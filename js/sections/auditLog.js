import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';

export async function renderAuditLog(container) {
  container.innerHTML = `
    <header>
      <h1>${t('auditLog.title')}</h1>
      <p>${t('auditLog.subtitle')}</p>
    </header>
    <div class="card">
      <table>
        <thead><tr>
          <th>${t('auditLog.when')}</th>
          <th>${t('auditLog.who')}</th>
          <th>${t('auditLog.table')}</th>
          <th>${t('auditLog.action')}</th>
          <th>${t('auditLog.details')}</th>
        </tr></thead>
        <tbody id="audit-tbody"><tr><td colspan="5" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    const wdArr = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const wd = wdArr[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${wd} ${dd}.${mm}.${yyyy} ${hh}:${min}`;
  }

  const tbody = document.getElementById('audit-tbody');
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, table_name, record_id, action, details, changed_at, employees(full_name)')
    .order('changed_at', { ascending: false })
    .limit(200);

  if (error) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${t('common.error')}</td></tr>`; return; }
  if (!data.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${t('common.none')}</td></tr>`; return; }

  tbody.innerHTML = data.map(row => `
    <tr>
      <td class="mono">${formatDateTime(row.changed_at)}</td>
      <td>${escapeHtml(row.employees?.full_name || '–')}</td>
      <td class="mono">${escapeHtml(row.table_name)}</td>
      <td>${escapeHtml(row.action)}</td>
      <td class="mono" style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(row.details ? JSON.stringify(row.details) : '')}</td>
    </tr>
  `).join('');
}
