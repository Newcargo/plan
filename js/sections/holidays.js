import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { createSortState, sortableHeader, wireSortHeaders, sortArray } from '../sortable.js';
import { formatDate, todayISO } from '../dateFormat.js';
import { openFormModal } from '../modal.js';

export async function renderHolidays(container) {
  const sortState = createSortState('date', false);
  let holidaysData = [];

  container.innerHTML = `
    <header><h1>${t('nav.holidays')}</h1></header>
    <div class="card">
      <div class="toolbar">
        <div></div>
        <button type="button" class="btn btn-primary" id="open-add-btn">${t('common.add')}</button>
      </div>
      <table>
        <thead><tr id="hol-thead-row"></tr></thead>
        <tbody id="hol-tbody"><tr><td colspan="4" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  function wireHead() {
    const row = document.getElementById('hol-thead-row');
    row.innerHTML = `
      ${sortableHeader(t('holidays.date'), 'date', sortState)}
      ${sortableHeader(t('holidays.name'), 'name', sortState)}
      <th>${t('holidays.note')}</th><th></th>
    `;
    wireSortHeaders(row, sortState, () => { renderRows(); wireHead(); });
  }
  wireHead();

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
    const tbody = document.getElementById('hol-tbody');
    const { data, error } = await supabase.from('holidays').select('*');
    if (error) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('common.error')}</td></tr>`; return; }
    holidaysData = data || [];
    renderRows();
  }

  function renderRows() {
    const tbody = document.getElementById('hol-tbody');
    if (!holidaysData.length) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('common.none')}</td></tr>`; return; }

    sortArray(holidaysData, sortState);
    const today = todayISO();

    tbody.innerHTML = holidaysData.map(h => {
      const isPast = h.date < today;
      return `
        <tr data-id="${h.id}" class="${isPast ? 'row-past' : ''}">
          <td class="mono">${formatDate(h.date)}</td>
          <td>${escapeHtml(h.name)}</td>
          <td>${escapeHtml(h.note || '')}</td>
          <td class="row-actions">
            ${iconButton(ICON_EDIT, t('common.edit'), 'edit-btn')}
            ${iconButton(ICON_DELETE, t('common.delete'), 'delete-btn')}
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').dataset.id;
        openEdit(holidaysData.find(x => x.id === id));
      });
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
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
