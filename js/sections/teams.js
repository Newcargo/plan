import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { createSortState, sortableHeader, wireSortHeaders, sortArray } from '../sortable.js';
import { openFormModal } from '../modal.js';

export async function renderTeams(container) {
  const sortState = createSortState('name', true);
  let teamsData = [];

  container.innerHTML = `
    <header><h1>${t('nav.teams')}</h1></header>
    <div class="card">
      <div class="toolbar">
        <div></div>
        <button type="button" class="btn btn-primary" id="open-add-btn">${t('common.add')}</button>
      </div>
      <table>
        <thead><tr id="teams-thead-row"></tr></thead>
        <tbody id="teams-tbody"><tr><td colspan="4" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  function refreshHeader() {
    document.getElementById('teams-thead-row').innerHTML = `
      ${sortableHeader(t('teams.name'), 'name', sortState)}
      <th class="num">${t('teams.focus')}</th>
      <th class="num">${t('teams.buffer')}</th>
      <th></th>
    `;
    wireSortHeaders(document.getElementById('teams-thead-row'), sortState, () => { renderRows(); refreshHeader(); });
  }
  refreshHeader();

  function formBody(team) {
    return `
      <div class="form-grid">
        <label>${t('teams.name')}</label>
        <input type="text" id="mf-name" required value="${team ? escapeHtml(team.name) : ''}">

        ${fieldLabel(t('teams.focus'), 'Anteil der Arbeitszeit für Story-Point-Arbeit nach Abzug von Zeremonien/Meetings, als Team-Standard (0–1). Kann pro Mitarbeiter überschrieben werden.')}
        <input type="number" id="mf-focus" min="0" max="1" step="0.01" required value="${team ? team.focus_factor : '0.8'}">

        ${fieldLabel(t('teams.buffer'), 'Anteil der Kapazität, der für ungeplante Arbeit reserviert wird, z. B. Betrieb (0–1). Wird von der Kapazität abgezogen: effektiv = Fokusfaktor × (1 − Puffer).')}
        <input type="number" id="mf-buffer" min="0" max="1" step="0.01" required value="${team ? team.unplanned_buffer : '0'}">
      </div>
    `;
  }

  function openAdd() {
    const modal = openFormModal({
      title: t('common.add'),
      bodyHtml: formBody(null),
      submitLabel: t('common.add'),
      cancelLabel: t('common.cancel'),
    });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        name: modal.body.querySelector('#mf-name').value.trim(),
        focus_factor: modal.body.querySelector('#mf-focus').value,
        unplanned_buffer: modal.body.querySelector('#mf-buffer').value,
      };
      const { error } = await supabase.from('teams').insert(payload);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      loadTeams();
    });
  }

  function openEdit(team) {
    const modal = openFormModal({
      title: t('common.edit'),
      bodyHtml: formBody(team),
      submitLabel: t('common.save'),
      cancelLabel: t('common.cancel'),
    });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        name: modal.body.querySelector('#mf-name').value.trim(),
        focus_factor: modal.body.querySelector('#mf-focus').value,
        unplanned_buffer: modal.body.querySelector('#mf-buffer').value,
      };
      const { error } = await supabase.from('teams').update(payload).eq('id', team.id);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      loadTeams();
    });
  }

  document.getElementById('open-add-btn').addEventListener('click', openAdd);

  async function loadTeams() {
    const tbody = document.getElementById('teams-tbody');
    const { data, error } = await supabase.from('teams').select('*');
    if (error) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('common.error')}</td></tr>`; return; }
    teamsData = data || [];
    renderRows();
  }

  function renderRows() {
    const tbody = document.getElementById('teams-tbody');
    if (!teamsData.length) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('common.none')}</td></tr>`; return; }

    sortArray(teamsData, sortState);

    tbody.innerHTML = teamsData.map(team => `
      <tr data-id="${team.id}">
        <td>${escapeHtml(team.name)}</td>
        <td class="num mono">${Number(team.focus_factor).toFixed(2)}</td>
        <td class="num mono">${Number(team.unplanned_buffer).toFixed(2)}</td>
        <td class="row-actions">
          ${iconButton(ICON_EDIT, t('common.edit'), 'edit-btn')}
          ${iconButton(ICON_DELETE, t('common.delete'), 'delete-btn')}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('teams').delete().eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        loadTeams();
      });
    });

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const team = teamsData.find(tm => tm.id === row.dataset.id);
        openEdit(team);
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  loadTeams();
}
