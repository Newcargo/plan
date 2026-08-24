import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { formatMonthYear } from '../dateFormat.js';

const PAGE_SIZE = 300;

export async function renderAuditLog(container) {
  let allRows = [];
  let offset = 0;
  let hasMore = true;
  let searchTerm = '';
  const expandedYears = new Set();
  const expandedMonths = new Set();

  container.innerHTML = `
    <header>
      <h1>${t('auditLog.title')}</h1>
      <p>${t('auditLog.subtitle')}</p>
    </header>
    <div class="card">
      <div class="form-grid" style="max-width:420px; margin-bottom:1rem;">
        <label>${t('auditLog.search')}</label>
        <input type="text" id="audit-search" placeholder="${t('auditLog.searchPlaceholder')}">
      </div>
      <div id="audit-groups"><p class="empty-state">${t('common.loading')}</p></div>
      <div class="form-actions" style="justify-content:center; margin-top:1rem;">
        <button type="button" class="btn btn-secondary" id="audit-load-more" hidden>${t('auditLog.loadMore')}</button>
      </div>
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

  document.getElementById('audit-search').addEventListener('input', e => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderGroups();
  });

  document.getElementById('audit-load-more').addEventListener('click', () => load(false));

  async function load(reset) {
    if (reset) { offset = 0; allRows = []; hasMore = true; }
    const container = document.getElementById('audit-groups');
    if (reset) container.innerHTML = `<p class="empty-state">${t('common.loading')}</p>`;

    const { data, error } = await supabase
      .from('audit_log')
      .select('id, table_name, record_id, action, details, changed_at, employees(full_name)')
      .order('changed_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) { container.innerHTML = `<p class="empty-state">${t('common.error')}</p>`; return; }

    allRows = allRows.concat(data || []);
    offset += PAGE_SIZE;
    hasMore = (data || []).length === PAGE_SIZE;
    document.getElementById('audit-load-more').hidden = !hasMore;

    renderGroups();
  }

  function matchesSearch(row) {
    if (!searchTerm) return true;
    const haystack = [
      row.employees?.full_name || '',
      row.table_name || '',
      row.action || '',
      row.details ? JSON.stringify(row.details) : '',
    ].join(' ').toLowerCase();
    return haystack.includes(searchTerm);
  }

  function renderGroups() {
    const container = document.getElementById('audit-groups');
    const rows = allRows.filter(matchesSearch);

    if (!rows.length) {
      container.innerHTML = `<p class="empty-state">${searchTerm ? t('auditLog.noMatches') : t('common.none')}</p>`;
      return;
    }

    // Nach Jahr, dann Monat gruppieren
    const byYear = new Map();
    rows.forEach(row => {
      const d = new Date(row.changed_at);
      const year = String(d.getFullYear());
      const monthKey = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byYear.has(year)) byYear.set(year, new Map());
      const byMonth = byYear.get(year);
      if (!byMonth.has(monthKey)) byMonth.set(monthKey, []);
      byMonth.get(monthKey).push(row);
    });

    const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));

    container.innerHTML = years.map(year => {
      const byMonth = byYear.get(year);
      const yearCount = [...byMonth.values()].reduce((sum, arr) => sum + arr.length, 0);
      const monthKeys = [...byMonth.keys()].sort((a, b) => b.localeCompare(a));
      const yearOpen = expandedYears.has(year) || (!!searchTerm && yearCount > 0);

      return `
        <div class="year-group">
          <div class="year-group-header" data-year="${year}">
            <span class="year-chevron">${yearOpen ? '▾' : '▸'}</span>
            <span>${year}</span>
            <span class="year-count">(${yearCount})</span>
          </div>
          <div class="year-group-body" ${yearOpen ? '' : 'hidden'}>
            ${monthKeys.map(monthKey => {
              const monthRows = byMonth.get(monthKey);
              const monthDate = new Date(monthKey + '-01T00:00:00');
              const monthOpen = expandedMonths.has(monthKey) || !!searchTerm;
              return `
                <div class="year-group" style="margin:0.5rem 0.75rem; border-color:var(--border);">
                  <div class="year-group-header" data-month="${monthKey}" style="font-size:0.85rem; padding:0.55rem 0.75rem;">
                    <span class="year-chevron">${monthOpen ? '▾' : '▸'}</span>
                    <span>${formatMonthYear(monthDate)}</span>
                    <span class="year-count">(${monthRows.length})</span>
                  </div>
                  <div class="year-group-body" ${monthOpen ? '' : 'hidden'}>
                    <table>
                      <thead><tr>
                        <th>${t('auditLog.when')}</th>
                        <th>${t('auditLog.who')}</th>
                        <th>${t('auditLog.table')}</th>
                        <th>${t('auditLog.action')}</th>
                        <th>${t('auditLog.details')}</th>
                      </tr></thead>
                      <tbody>
                        ${monthRows.map(row => `
                          <tr>
                            <td class="mono">${formatDateTime(row.changed_at)}</td>
                            <td>${escapeHtml(row.employees?.full_name || '–')}</td>
                            <td class="mono">${escapeHtml(row.table_name)}</td>
                            <td>${escapeHtml(row.action)}</td>
                            <td class="mono" style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(row.details ? JSON.stringify(row.details) : '')}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.year-group-header[data-year]').forEach(header => {
      header.addEventListener('click', () => {
        const year = header.dataset.year;
        if (expandedYears.has(year)) expandedYears.delete(year); else expandedYears.add(year);
        renderGroups();
      });
    });

    container.querySelectorAll('.year-group-header[data-month]').forEach(header => {
      header.addEventListener('click', e => {
        e.stopPropagation();
        const month = header.dataset.month;
        if (expandedMonths.has(month)) expandedMonths.delete(month); else expandedMonths.add(month);
        renderGroups();
      });
    });
  }

  load(true);
}
