import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { createSortState, sortableHeader, wireSortHeaders, sortArray } from '../sortable.js';
import { formatDate, todayISO } from '../dateFormat.js';
import { openFormModal } from '../modal.js';

export async function renderBlocked(container) {
  const sortState = createSortState('start_date', false);
  let bpData = [];

  container.innerHTML = `
    <header><h1>${t('nav.blocked')}</h1></header>
    <div class="card">
      <div class="toolbar">
        <div></div>
        <button type="button" class="btn btn-primary" id="open-add-btn">${t('common.add')}</button>
      </div>
      <table>
        <thead><tr id="bp-thead-row"></tr></thead>
        <tbody id="bp-tbody"><tr><td colspan="5" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  function wireHead() {
    const row = document.getElementById('bp-thead-row');
    row.innerHTML = `
      ${sortableHeader(t('blocked.start'), 'start_date', sortState)}
      ${sortableHeader(t('blocked.end'), 'end_date', sortState)}
      ${sortableHeader(t('blocked.label'), 'label', sortState)}
      <th>${t('blocked.capacityImpact')}</th><th></th>
    `;
    wireSortHeaders(row, sortState, () => { renderRows(); wireHead(); });
  }
  wireHead();

  function formBody(bp) {
    return `
      <div class="form-grid">
        ${fieldLabel(t('blocked.start') + ' – ' + t('blocked.end'), 'Zeitraum der Sperrzeit.')}
        <div class="date-range-inline">
          <input type="date" id="mf-start" required value="${bp ? bp.start_date : todayISO()}">
          <span>–</span>
          <input type="date" id="mf-end" required value="${bp ? bp.end_date : todayISO()}">
        </div>

        ${fieldLabel(t('blocked.label'), 'Grund der Sperrzeit, z. B. "Betriebsferien" oder "Wartungsfenster".')}
        <input type="text" id="mf-label" required value="${bp ? escapeHtml(bp.label) : ''}">

        ${fieldLabel(t('blocked.capacityImpact'), 'Aktiv: wirkt wie eine Firmenschliessung und wird von der verfügbaren Kapazität abgezogen. Inaktiv: dient nur als Genehmigungshinweis im Urlaubskalender, ohne die Kapazität zu verändern.')}
        <input type="checkbox" id="mf-impact" ${!bp || bp.capacity_impact ? 'checked' : ''}>
      </div>
    `;
  }

  function wireDateLink(modal) {
    modal.body.querySelector('#mf-start').addEventListener('change', e => {
      modal.body.querySelector('#mf-end').min = e.target.value;
    });
  }

  function openAdd() {
    const modal = openFormModal({ title: t('common.add'), bodyHtml: formBody(null), submitLabel: t('common.add'), cancelLabel: t('common.cancel') });
    wireDateLink(modal);
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        start_date: modal.body.querySelector('#mf-start').value,
        end_date: modal.body.querySelector('#mf-end').value,
        label: modal.body.querySelector('#mf-label').value.trim(),
        capacity_impact: modal.body.querySelector('#mf-impact').checked,
      };
      const { error } = await supabase.from('blocked_periods').insert(payload);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      load();
    });
  }

  function openEdit(bp) {
    const modal = openFormModal({ title: t('common.edit'), bodyHtml: formBody(bp), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    wireDateLink(modal);
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        start_date: modal.body.querySelector('#mf-start').value,
        end_date: modal.body.querySelector('#mf-end').value,
        label: modal.body.querySelector('#mf-label').value.trim(),
        capacity_impact: modal.body.querySelector('#mf-impact').checked,
      };
      const { error } = await supabase.from('blocked_periods').update(payload).eq('id', bp.id);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      load();
    });
  }

  document.getElementById('open-add-btn').addEventListener('click', openAdd);

  async function load() {
    const tbody = document.getElementById('bp-tbody');
    const { data, error } = await supabase.from('blocked_periods').select('*');
    if (error) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${t('common.error')}</td></tr>`; return; }
    bpData = data || [];
    renderRows();
  }

  function renderRows() {
    const tbody = document.getElementById('bp-tbody');
    if (!bpData.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${t('common.none')}</td></tr>`; return; }

    sortArray(bpData, sortState);
    const today = todayISO();

    tbody.innerHTML = bpData.map(bp => {
      const isPast = bp.end_date < today;
      return `
        <tr data-id="${bp.id}" class="${isPast ? 'row-past' : ''}">
          <td class="mono">${formatDate(bp.start_date)}</td>
          <td class="mono">${formatDate(bp.end_date)}</td>
          <td>${escapeHtml(bp.label)}</td>
          <td>${bp.capacity_impact
            ? `<span class="badge badge-danger">ja</span>`
            : `<span class="badge badge-muted">nein</span>`}</td>
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
        openEdit(bpData.find(x => x.id === id));
      });
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('blocked_periods').delete().eq('id', id);
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
