import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { createSortState, sortableHeader, wireSortHeaders, sortArray } from '../sortable.js';
import { formatDate, todayISO } from '../dateFormat.js';

export async function renderHolidays(container) {
  // Standard: Datum Z-A (neueste/zukuenftigste zuerst), per Klick auf Spaltenkopf umschaltbar
  const sortState = createSortState('date', false);
  let holidaysData = [];

  container.innerHTML = `
    <header><h1>${t('nav.holidays')}</h1></header>
    <div class="card">
      <div class="form-panel-title" id="hol-form-title">${t('common.add')}</div>
      <form id="hol-form">
        <input type="hidden" id="f-id">
        <div class="form-grid">
          ${fieldLabel(t('holidays.date'), 'Datum des Feiertags. Wird bei der Kapazitätsberechnung automatisch als Nicht-Arbeitstag berücksichtigt.')}
          <input type="date" id="f-date" required class="narrow">

          <label>${t('holidays.name')}</label>
          <input type="text" id="f-name" required>

          ${fieldLabel(t('holidays.note'), 'Optionale Zusatzinfo, z. B. "Fällt auf einen Samstag".')}
          <input type="text" id="f-note">
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="hol-cancel-btn" hidden>${t('common.cancel')}</button>
          <button type="submit" class="btn btn-primary" id="hol-submit-btn">${t('common.add')}</button>
        </div>
      </form>
    </div>

    <div class="card">
      <table>
        <thead><tr id="hol-thead-row"></tr></thead>
        <tbody id="hol-tbody"><tr><td colspan="4" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  const form = document.getElementById('hol-form');
  const submitBtn = document.getElementById('hol-submit-btn');
  const cancelBtn = document.getElementById('hol-cancel-btn');

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

  function resetForm() {
    form.reset();
    document.getElementById('f-id').value = '';
    submitBtn.textContent = t('common.add');
    document.getElementById('hol-form-title').textContent = t('common.add');
    cancelBtn.hidden = true;
  }

  cancelBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('f-id').value;
    const payload = {
      date: document.getElementById('f-date').value,
      name: document.getElementById('f-name').value.trim(),
      note: document.getElementById('f-note').value.trim() || null,
    };

    const query = id
      ? supabase.from('holidays').update(payload).eq('id', id)
      : supabase.from('holidays').insert(payload);

    const { error } = await query;
    if (error) { alert(t('common.error') + '\n' + error.message); return; }
    resetForm();
    load();
  });

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
        const h = holidaysData.find(x => x.id === id);
        document.getElementById('f-id').value = h.id;
        document.getElementById('f-date').value = h.date;
        document.getElementById('f-name').value = h.name;
        document.getElementById('f-note').value = h.note || '';
        submitBtn.textContent = t('common.save');
        document.getElementById('hol-form-title').textContent = t('common.edit');
        cancelBtn.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
