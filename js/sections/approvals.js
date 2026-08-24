import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { formatDate, businessDaysSince } from '../dateFormat.js';
import { showConfirmModal } from '../modal.js';
import { ICON_DELETE, iconButton } from '../icons.js';
import { openMailto } from '../mailer.js';

const STATUS_META = {
  beantragt: { label: 'Beantragt', cls: 'badge-warn' },
  genehmigt_projekt: { label: 'Genehmigt (Projektleitung)', cls: 'badge-info' },
  abgelehnt: { label: 'Abgelehnt', cls: 'badge-danger' },
  final_gebucht: { label: 'Final gebucht', cls: 'badge-success' },
  storniert: { label: 'Storniert', cls: 'badge-muted' },
};

const APP_URL = 'https://newcargo.github.io/plan/';

function periodText(r) {
  return r.start_date === r.end_date ? formatDate(r.start_date) : `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`;
}

function portionText(r) {
  return r.day_portion !== 'ganztag' ? t('myLeave.dayPortion.' + r.day_portion) : t('myLeave.dayPortion.ganztag');
}

function commentLine(r) {
  return t('approvals.mailCommentLine').replaceAll('{comment}', r.comment_stufe2 || '-');
}

async function getPpmEmails() {
  const { data } = await supabase.rpc('get_notification_recipients');
  return [...new Set((data || []).filter(r => r.role === 'people_pool_manager' && r.email).map(r => r.email))];
}

// Sendet die Entscheidungs-Mail(s) fuer einen Antrag: an den Antragsteller immer,
// bei Genehmigung + extern zusaetzlich an alle People Pool Manager.
async function sendDecisionMail(r, approverName, decision) {
  const employeeEmail = r.employees?.email;
  const employeeName = r.employees?.full_name || '';
  const isExternal = !!r.employees?.is_external;

  if (decision === 'approved') {
    const ppmEmails = isExternal ? await getPpmEmails() : [];

    const subject = t('approvals.mailApprovedSubject');
    const bodyKey = isExternal ? 'approvals.mailApprovedExternBody' : 'approvals.mailApprovedInternBody';
    const body = t(bodyKey)
      .replaceAll('{name}', employeeName)
      .replaceAll('{approver}', approverName)
      .replaceAll('{period}', periodText(r))
      .replaceAll('{portion}', portionText(r))
      .replaceAll('{comment}', commentLine(r))
      .replaceAll('{link}', APP_URL);

    // WICHTIG: EINE Mail mit PPM als CC statt zwei getrennter mailto-Aufrufe -
    // Browser lassen pro Klick meist nur eine mailto-Ausloesung zu, eine zweite
    // unabhaengige wird sonst lautlos verworfen (auch ohne jede Wartezeit dazwischen).
    return openMailto({ to: [employeeEmail], cc: ppmEmails, subject, body });
  }

  // decision === 'rejected'
  const subject = t('approvals.mailRejectedSubject');
  const body = t('approvals.mailRejectedBody')
    .replaceAll('{name}', employeeName)
    .replaceAll('{approver}', approverName)
    .replaceAll('{period}', periodText(r))
    .replaceAll('{portion}', portionText(r))
    .replaceAll('{comment}', commentLine(r))
    .replaceAll('{link}', APP_URL);
  return openMailto({ to: [employeeEmail], subject, body });
}

export async function renderApprovals(container, context) {
  const roles = (context && context.roles) || new Set();
  const currentEmployeeId = context && context.employee && context.employee.id;
  const currentEmployeeName = context && context.employee && context.employee.full_name;
  const canApprove = roles.has('stufe2_genehmiger') || roles.has('admin');
  const isAdmin = roles.has('admin');

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
          <th></th>
        </tr></thead>
        <tbody id="history-tbody"><tr><td colspan="6" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  function discussedBadge(r) {
    return r.discussed_with_team
      ? `<span class="badge badge-success" title="${t('approvals.discussedYes')}">${t('approvals.discussedYesShort')}</span>`
      : `<span class="badge badge-warn" title="${t('approvals.discussedNo')}">${t('approvals.discussedNoShort')}</span>`;
  }

  async function loadAll() {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('id, start_date, end_date, status, day_portion, comment_stufe2, created_at, discussed_with_team, employee_id, employees!leave_requests_employee_id_fkey(full_name, is_external, email), approver:employees!leave_requests_approved_by_fkey(full_name)')
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
            ${discussedBadge(r)}
          </td>
          <td class="mono">${formatDate(r.start_date)} – ${formatDate(r.end_date)}${r.day_portion !== 'ganztag' ? ` (${t('myLeave.dayPortion.' + r.day_portion)})` : ''}${warningHtml}</td>
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
        const rowData = rows.find(r => r.id === id);
        const comment = prompt(t('approvals.approveCommentPrompt')) || null;
        const { error } = await supabase.from('leave_requests').update({
          status: 'genehmigt_projekt',
          comment_stufe2: comment,
          approved_by: currentEmployeeId,
          approved_at: new Date().toISOString(),
        }).eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        await sendDecisionMail({ ...rowData, comment_stufe2: comment }, currentEmployeeName, 'approved');
        loadAll();
      });
    });

    tbody.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        const rowData = rows.find(r => r.id === id);
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
        await sendDecisionMail({ ...rowData, comment_stufe2: comment.trim() }, currentEmployeeName, 'rejected');
        loadAll();
      });
    });
  }

  function renderHistory(rows) {
    const tbody = document.getElementById('history-tbody');
    if (!rows.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${t('common.none')}</td></tr>`; return; }

    tbody.innerHTML = rows.map(r => {
      const meta = STATUS_META[r.status] || { label: r.status, cls: 'badge-muted' };
      const canStorno = isAdmin && ['beantragt', 'genehmigt_projekt', 'final_gebucht'].includes(r.status);
      const canResend = canApprove && ['genehmigt_projekt', 'abgelehnt'].includes(r.status);
      return `
        <tr data-id="${r.id}">
          <td>${escapeHtml(r.employees?.full_name || '–')}${r.employees?.is_external ? ` <span class="badge badge-muted">extern</span>` : ''} ${discussedBadge(r)}</td>
          <td class="mono">${formatDate(r.start_date)} – ${formatDate(r.end_date)}${r.day_portion !== 'ganztag' ? ` (${t('myLeave.dayPortion.' + r.day_portion)})` : ''}</td>
          <td><span class="badge ${meta.cls}">${t('myLeave.status.' + r.status) || meta.label}</span></td>
          <td>${escapeHtml(r.comment_stufe2 || '')}</td>
          <td>${escapeHtml(r.approver?.full_name || '–')}</td>
          <td class="row-actions">
            ${canResend ? `<button type="button" class="btn btn-secondary resend-btn">${t('approvals.resendMail')}</button>` : ''}
            ${isAdmin && canStorno ? `<button type="button" class="btn btn-danger admin-storno-btn">${t('myLeave.storno')}</button>` : ''}
            ${isAdmin ? iconButton(ICON_DELETE, t('common.delete'), 'admin-delete-btn') : ''}
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.resend-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        const rowData = rows.find(r => r.id === id);
        const decision = rowData.status === 'genehmigt_projekt' ? 'approved' : 'rejected';
        const approverName = rowData.approver?.full_name || currentEmployeeName;
        const sent = await sendDecisionMail(rowData, approverName, decision);
        if (!sent) alert(t('myLeave.noRecipientsHint'));
      });
    });

    tbody.querySelectorAll('.admin-storno-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await showConfirmModal({
          title: t('myLeave.storno'),
          message: t('approvals.adminStornoConfirm'),
          confirmLabel: t('myLeave.storno'),
          cancelLabel: t('common.cancel'),
        });
        if (!ok) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('leave_requests').update({ status: 'storniert' }).eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        loadAll();
      });
    });

    tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await showConfirmModal({
          title: t('common.delete'),
          message: t('approvals.adminDeleteConfirm'),
          confirmLabel: t('common.delete'),
          cancelLabel: t('common.cancel'),
        });
        if (!ok) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('leave_requests').delete().eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        loadAll();
      });
    });
  }

  loadAll();
}
