import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { formatDate, todayISO } from '../dateFormat.js';
import { openFormModal } from '../modal.js';

export async function renderHolidays(container) {
  let holidaysData = [];
  const expandedYears = new Set([String(new Date().getFullYear())]);

  container.innerHTML = `
    <header><h1>${t('nav.holidays')}</h1></header>
    <div class="card">
      <div class="toolbar">
        <div></div>
        <button type="button" class="btn btn-primary" id="open-add-btn">${t('common.add')}</button>
      </div>
      <div id="hol-groups"><p class="empty-state">${t('common.loading')}</p></div>
    </div>
  `;

  function formBody(h) {
    return `
      <div class="form-grid">
        ${fieldLabel(t('holidays.date'), 'Datum des Feiertags. Wird bei der Kapazitätsberechnung automatisch als Nicht-Arbeitstag berücksichtigt.')}
        <input type="date" id="mf-date" required value="${h ? h.date : todayISO()}">

        <label>${t('holidays.name')}</label>
        <input type="text" id="mf-name" required value="${h ? escapeHtml(h.name) : ''}">

        ${fieldLabel(t('holidays.note'), 'Optionale Zusatzinfo, z. B. "Fällt auf einen Samstag".')}
        <input type="text" id="mf-note" value="${h && h.note ? escapeHtml(h.note) : ''}">
      </div>
    `;
  }

  function openAdd() {
    const modal = openFormModal({ title: t('common.add'), bodyHtml: formBody(null), submitLabel: t('common.add'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        date: modal.body.querySelector('#mf-date').value,
        name: modal.body.querySelector('#mf-name').value.trim(),
        note: modal.body.querySelector('#mf-note').value.trim() || null,
      };
      const { error } = await supabase.from('holidays').insert(payload);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      expandedYears.add(payload.date.slice(0, 4));
      modal.close();
      load();
    });
  }

  function openEdit(h) {
    const modal = openFormModal({ title: t('common.edit'), bodyHtml: formBody(h), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        date: modal.body.querySelector('#mf-date').value,
        name: modal.body.querySelector('#mf-name').value.trim(),
        note: modal.body.querySelector('#mf-note').value.trim() || null,
      };
      const { error } = await supabase.from('holidays').update(payload).eq('id', h.id);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      load();
    });
  }

  document.getElementById('open-add-btn').addEventListener('click', openAdd);

  async function load() {
    const container = document.getElementById('hol-groups');
    const { data, error } = await supabase.from('holidays').select('*');
    if (error) { container.innerHTML = `<p class="empty-state">${t('common.error')}</p>`; return; }
    holidaysData = data || [];
    renderGroups();
  }

  function renderGroups() {
    const container = document.getElementById('hol-groups');
    if (!holidaysData.length) { container.innerHTML = `<p class="empty-state">${t('common.none')}</p>`; return; }

    const grouped = new Map();
    holidaysData.forEach(h => {
      const year = h.date.slice(0, 4);
      if (!grouped.has(year)) grouped.set(year, []);
      grouped.get(year).push(h);
    });
    const years = [...grouped.keys()].sort((a, b) => b.localeCompare(a));
    const today = todayISO();

    container.innerHTML = years.map(year => {
      const items = grouped.get(year).sort((a, b) => a.date.localeCompare(b.date));
      const isOpen = expandedYears.has(year);
      return `
        <div class="year-group">
          <div class="year-group-header" data-year="${year}">
            <span class="year-chevron">${isOpen ? '▾' : '▸'}</span>
            <span>${year}</span>
            <span class="year-count">(${items.length})</span>
          </div>
          <div class="year-group-body" ${isOpen ? '' : 'hidden'}>
            <table>
              <thead><tr><th>${t('holidays.date')}</th><th>${t('holidays.name')}</th><th>${t('holidays.note')}</th><th></th></tr></thead>
              <tbody>
                ${items.map(h => `
                  <tr data-id="${h.id}" class="${h.date < today ? 'row-past' : ''}">
                    <td class="mono">${formatDate(h.date)}</td>
                    <td>${escapeHtml(h.name)}</td>
                    <td>${escapeHtml(h.note || '')}</td>
                    <td class="row-actions">
                      ${iconButton(ICON_EDIT, t('common.edit'), 'edit-btn')}
                      ${iconButton(ICON_DELETE, t('common.delete'), 'delete-btn')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.year-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const year = header.dataset.year;
        if (expandedYears.has(year)) expandedYears.delete(year); else expandedYears.add(year);
        renderGroups();
      });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.closest('tr').dataset.id;
        openEdit(holidaysData.find(x => x.id === id));
      });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm(t('common.confirmDelete'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('holidays').delete().eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        load();
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  load();
}
