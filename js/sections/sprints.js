import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { createSortState, sortableHeader, wireSortHeaders, sortArray } from '../sortable.js';
import { formatDate, todayISO } from '../dateFormat.js';
import { openFormModal } from '../modal.js';

export async function renderSprints(container) {
  const sortState = createSortState('sprint_number', true);
  let sprintsData = [];

  container.innerHTML = `
    <header><h1>${t('sprints.title')}</h1></header>

    <div class="card">
      <div class="form-grid" style="max-width:520px;">
        ${fieldLabel(t('sprints.piName'), 'Name des Program Increments, frei wählbar und jederzeit im Nachhinein änderbar.')}
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <select id="pi-select" style="flex:1;"></select>
          ${iconButton(ICON_EDIT, t('common.edit'), 'pi-rename-btn')}
          ${iconButton(ICON_DELETE, t('common.delete'), 'pi-delete-btn')}
        </div>
      </div>
      <div class="form-actions" style="justify-content:flex-start;">
        <button type="button" class="btn btn-secondary" id="open-add-pi-btn">${t('sprints.addPi')}</button>
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        <div></div>
        <button type="button" class="btn btn-primary" id="open-add-sprint-btn">${t('sprints.addSprint')}</button>
      </div>
      <table>
        <thead><tr id="sprint-thead-row"></tr></thead>
        <tbody id="sprint-tbody"><tr><td colspan="6" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  const piSelect = document.getElementById('pi-select');

  function wireHead() {
    const row = document.getElementById('sprint-thead-row');
    row.innerHTML = `
      ${sortableHeader(t('sprints.sprintNr'), 'sprint_number', sortState)}
      ${sortableHeader(t('common.name'), 'name', sortState)}
      ${sortableHeader(t('sprints.start'), 'start_date', sortState)}
      ${sortableHeader(t('sprints.end'), 'end_date', sortState)}
      <th>${t('sprints.closed')}</th><th></th>
    `;
    wireSortHeaders(row, sortState, () => { renderSprintRows(); wireHead(); });
  }
  wireHead();

  document.getElementById('open-add-pi-btn').addEventListener('click', () => {
    const modal = openFormModal({
      title: t('sprints.addPi'),
      bodyHtml: `<div class="form-grid"><label>${t('sprints.piName')}</label><input type="text" id="mf-pi-name" placeholder="PI 2026.2" required></div>`,
      submitLabel: t('common.add'),
      cancelLabel: t('common.cancel'),
    });
    modal.submitBtn.addEventListener('click', async () => {
      const name = modal.body.querySelector('#mf-pi-name').value.trim();
      if (!name) return;
      const { error } = await supabase.from('program_increments').insert({ name });
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      await loadPis(name);
    });
  });

  document.querySelector('.pi-rename-btn').addEventListener('click', async () => {
    if (!piSelect.value) return;
    const current = piSelect.options[piSelect.selectedIndex].textContent;
    const newName = prompt(t('sprints.piName'), current);
    if (newName === null || !newName.trim()) return;
    const { error } = await supabase.from('program_increments').update({ name: newName.trim() }).eq('id', piSelect.value);
    if (error) { alert(t('common.error') + '\n' + error.message); return; }
    await loadPis(newName.trim());
  });

  document.querySelector('.pi-delete-btn').addEventListener('click', async () => {
    if (!piSelect.value) return;
    if (!confirm(t('common.confirmDelete'))) return;
    const { error } = await supabase.from('program_increments').delete().eq('id', piSelect.value);
    if (error) { alert(t('common.error') + '\n' + error.message); return; }
    await loadPis();
  });

  piSelect.addEventListener('change', loadSprints);

  function sprintFormBody(s) {
    return `
      <div class="form-grid">
        ${fieldLabel(t('sprints.sprintNr'), 'Fortlaufende Position des Sprints innerhalb der PI (1, 2, 3, ...). Bestimmt z. B. die Zuordnung zum Konfidenzband und bleibt beim Umbenennen des Namens unverändert.')}
        <input type="number" id="mf-nr" min="1" required value="${s ? s.sprint_number : ''}">

        ${fieldLabel(t('common.name'), 'Frei wählbarer Anzeigename des Sprints, unabhängig von der Sprint-Position. Kann jederzeit geändert werden, ohne Verknüpfungen zu brechen.')}
        <input type="text" id="mf-name" placeholder="Sprint 1" value="${s && s.name ? escapeHtml(s.name) : ''}">

        ${fieldLabel(t('sprints.start') + ' – ' + t('sprints.end'), 'Sprint-Zeitraum. Bestimmt die verfügbaren Arbeitstage für die Kapazitätsberechnung.')}
        <div class="date-range-inline">
          <input type="date" id="mf-start" required value="${s ? s.start_date : todayISO()}">
          <span>–</span>
          <input type="date" id="mf-end" required value="${s ? s.end_date : todayISO()}">
        </div>
      </div>
    `;
  }

  function wireDateLink(modal) {
    modal.body.querySelector('#mf-start').addEventListener('change', e => {
      modal.body.querySelector('#mf-end').min = e.target.value;
    });
  }

  document.getElementById('open-add-sprint-btn').addEventListener('click', () => {
    if (!piSelect.value) return;
    const modal = openFormModal({ title: t('sprints.addSprint'), bodyHtml: sprintFormBody(null), submitLabel: t('common.add'), cancelLabel: t('common.cancel') });
    wireDateLink(modal);
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        pi_id: piSelect.value,
        sprint_number: modal.body.querySelector('#mf-nr').value,
        name: modal.body.querySelector('#mf-name').value.trim() || null,
        start_date: modal.body.querySelector('#mf-start').value,
        end_date: modal.body.querySelector('#mf-end').value,
      };
      const { error } = await supabase.from('sprints').insert(payload);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      loadSprints();
    });
  });

  function openEditSprint(s) {
    const modal = openFormModal({ title: t('common.edit'), bodyHtml: sprintFormBody(s), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    wireDateLink(modal);
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        sprint_number: modal.body.querySelector('#mf-nr').value,
        name: modal.body.querySelector('#mf-name').value.trim() || null,
        start_date: modal.body.querySelector('#mf-start').value,
        end_date: modal.body.querySelector('#mf-end').value,
      };
      const { error } = await supabase.from('sprints').update(payload).eq('id', s.id);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      loadSprints();
    });
  }

  async function loadPis(selectName) {
    const { data, error } = await supabase.from('program_increments').select('*').order('created_at', { ascending: false });
    if (error || !data) return;
    piSelect.innerHTML = data.map(pi => `<option value="${pi.id}">${escapeHtml(pi.name)}</option>`).join('');
    if (selectName) {
      const match = data.find(pi => pi.name === selectName);
      if (match) piSelect.value = match.id;
    }
    loadSprints();
  }

  async function loadSprints() {
    const tbody = document.getElementById('sprint-tbody');
    if (!piSelect.value) { sprintsData = []; tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${t('common.none')}</td></tr>`; return; }

    const { data, error } = await supabase.from('sprints').select('*').eq('pi_id', piSelect.value);
    if (error) { tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${t('common.error')}</td></tr>`; return; }
    sprintsData = data || [];
    renderSprintRows();
  }

  function renderSprintRows() {
    const tbody = document.getElementById('sprint-tbody');
    if (!sprintsData.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${t('common.none')}</td></tr>`; return; }

    sortArray(sprintsData, sortState);

    tbody.innerHTML = sprintsData.map(s => `
      <tr data-id="${s.id}">
        <td class="mono">${s.sprint_number}</td>
        <td>${escapeHtml(s.name || '')}</td>
        <td class="mono">${formatDate(s.start_date)}</td>
        <td class="mono">${formatDate(s.end_date)}</td>
        <td><input type="checkbox" class="closed-toggle" ${s.is_closed ? 'checked' : ''}></td>
        <td class="row-actions">
          ${iconButton(ICON_EDIT, t('common.edit'), 'edit-btn')}
          ${iconButton(ICON_DELETE, t('common.delete'), 'delete-btn')}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.closed-toggle').forEach(cb => {
      cb.addEventListener('change', async () => {
        const id = cb.closest('tr').dataset.id;
        const { error } = await supabase.from('sprints').update({ is_closed: cb.checked }).eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); cb.checked = !cb.checked; }
      });
    });

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').dataset.id;
        openEditSprint(sprintsData.find(x => x.id === id));
      });
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('sprints').delete().eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        loadSprints();
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  loadPis();
}
