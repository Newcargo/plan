import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { formatDate, businessDaysSince } from '../dateFormat.js';

const STATUS_META = {
  beantragt: { label: 'Beantragt', cls: 'badge-warn' },
  genehmigt_projekt: { label: 'Genehmigt (Projektleitung)', cls: 'badge-info' },
  abgelehnt: { label: 'Abgelehnt', cls: 'badge-danger' },
  final_gebucht: { label: 'Final gebucht', cls: 'badge-success' },
  storniert: { label: 'Storniert', cls: 'badge-muted' },
};

export async function renderApprovals(container, context) {
  const roles = (context && context.roles) || new Set();
  const currentEmployeeId = context && context.employee && context.employee.id;
  const canApprove = roles.has('stufe2_genehmiger') || roles.has('admin');

  let reminderDays = 5;
  const { data: cfg } = await supabase.from('app_config').select('value').eq('key', 'reminder_business_days').maybeSingle();
  if (cfg && cfg.value) reminderDays = Number(cfg.value);

  container.innerHTML = `
    <header><h1>${t('approvals.title')}</h1></header>

    ${canApprove ? `
      <div class="card">
        <div class="form-panel-title">${t('approvals.pendingTitle')}</div>
        <table>
          <thead><tr>
            <th>${t('approvals.employee')}</th>
            <th>${t('myLeave.period')}</th>
            <th></th>
          </tr></thead>
          <tbody id="pending-tbody"><tr><td colspan="3" class="empty-state">${t('common.loading')}</td></tr></tbody>
        </table>
      </div>
    ` : ''}

    <div class="card">
      <div class="form-panel-title">${t('approvals.historyTitle')}</div>
      <table>
        <thead><tr>
          <th>${t('approvals.employee')}</th>
          <th>${t('myLeave.period')}</th>
          <th>${t('myLeave.statusCol')}</th>
          <th>${t('myLeave.comment')}</th>
          <th>${t('approvals.processedBy')}</th>
          ${canApprove ? '<th></th>' : ''}
        </tr></thead>
        <tbody id="history-tbody"><tr><td colspan="${canApprove ? 6 : 5}" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  async function loadAll() {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('id, start_date, end_date, status, comment_stufe2, created_at, employee_id, employees!leave_requests_employee_id_fkey(full_name, is_external), approver:employees!leave_requests_approved_by_fkey(full_name)')
      .order('start_date', { ascending: false });

    if (error) {
      ['pending-tbody', 'history-tbody'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<tr><td colspan="6" class="empty-state">${t('common.error')}</td></tr>`;
      });
      return;
    }

    const all = data || [];
    if (canApprove) {
      const { data: blockedPeriods } = await supabase.from('blocked_periods').select('start_date, end_date, label');
      renderPending(all.filter(r => r.status === 'beantragt'), blockedPeriods || []);
    }
    renderHistory(all);
  }

  function renderPending(rows, blockedPeriods) {
    const tbody = document.getElementById('pending-tbody');
    if (!rows.length) { tbody.innerHTML = `<tr><td colspan="3" class="empty-state">${t('common.none')}</td></tr>`; return; }

    tbody.innerHTML = rows.map(r => {
      const waitingDays = businessDaysSince(r.created_at);
      const isAged = waitingDays >= reminderDays;
      const overlaps = blockedPeriods.filter(bp => bp.start_date <= r.end_date && bp.end_date >= r.start_date);
      const warningHtml = overlaps.length
        ? overlaps.map(bp => `<div style="font-size:0.78rem; color:var(--danger); margin-top:0.2rem;">⚠ ${t('approvals.blockedWarning')
            .replace('{label}', escapeHtml(bp.label))
            .replace('{start}', formatDate(bp.start_date))
            .replace('{end}', formatDate(bp.end_date))}</div>`).join('')
        : '';
      return `
        <tr data-id="${r.id}" class="${isAged ? 'row-past' : ''}">
          <td>${escapeHtml(r.employees?.full_name || '–')}
            ${isAged ? `<span class="badge badge-danger">${t('approvals.waitingDays').replace('{days}', waitingDays)}</span>` : ''}
          </td>
          <td class="mono">${formatDate(r.start_date)} – ${formatDate(r.end_date)}${warningHtml}</td>
          <td class="row-actions">
            <button type="button" class="btn btn-secondary approve-btn">${t('approvals.approve')}</button>
            <button type="button" class="btn btn-danger reject-btn">${t('approvals.reject')}</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        const comment = prompt(t('approvals.approveCommentPrompt')) || null;
        const { error } = await supabase.from('leave_requests').update({
          status: 'genehmigt_projekt',
          comment_stufe2: comment,
          approved_by: currentEmployeeId,
          approved_at: new Date().toISOString(),
        }).eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        loadAll();
      });
    });

    tbody.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        let comment = prompt(t('approvals.rejectCommentPrompt'));
        while (comment !== null && !comment.trim()) {
          comment = prompt(t('approvals.rejectCommentRequired'));
        }
        if (comment === null) return;
        const { error } = await supabase.from('leave_requests').update({
          status: 'abgelehnt',
          comment_stufe2: comment.trim(),
          approved_by: currentEmployeeId,
        }).eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        loadAll();
      });
    });
  }

  function renderHistory(rows) {
    const tbody = document.getElementById('history-tbody');
    const colspan = canApprove ? 6 : 5;
    if (!rows.length) { tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">${t('common.none')}</td></tr>`; return; }

    tbody.innerHTML = rows.map(r => {
      const meta = STATUS_META[r.status] || { label: r.status, cls: 'badge-muted' };
      const canConfirmFinal = canApprove && r.status === 'genehmigt_projekt';
      return `
        <tr data-id="${r.id}">
          <td>${escapeHtml(r.employees?.full_name || '–')}${r.employees?.is_external ? ` <span class="badge badge-muted">extern</span>` : ''}</td>
          <td class="mono">${formatDate(r.start_date)} – ${formatDate(r.end_date)}</td>
          <td><span class="badge ${meta.cls}">${t('myLeave.status.' + r.status) || meta.label}</span></td>
          <td>${escapeHtml(r.comment_stufe2 || '')}</td>
          <td>${escapeHtml(r.approver?.full_name || '–')}</td>
          ${canApprove ? `<td class="row-actions">${canConfirmFinal ? `<button type="button" class="btn btn-secondary confirm-final-manual-btn">${t('approvals.confirmFinalManual')}</button>` : ''}</td>` : ''}
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.confirm-final-manual-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('approvals.confirmFinalManualConfirm'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('leave_requests').update({ status: 'final_gebucht' }).eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        loadAll();
      });
    });
  }

  loadAll();
}
