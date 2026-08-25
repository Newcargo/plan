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
        <tbody id="sprint-tbody"><tr><td colspan="7" class="empty-state">${t('common.loading')}</td></tr></tbody>
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
      <th>${t('sprints.closed')}</th>
      <th class="num">${t('sprints.capacity')}</th>
      <th></th>
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
    if (!piSelect.value) { sprintsData = []; tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${t('common.none')}</td></tr>`; return; }

    const { data, error } = await supabase.from('sprints').select('*').eq('pi_id', piSelect.value);
    if (error) { tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${t('common.error')}</td></tr>`; return; }
    sprintsData = data || [];

    const sprintIds = sprintsData.map(s => s.id);
    if (sprintIds.length) {
      const { data: caps } = await supabase.from('capacity_snapshots').select('sprint_id, capacity_person_days').in('sprint_id', sprintIds);
      const totals = new Map();
      (caps || []).forEach(c => totals.set(c.sprint_id, (totals.get(c.sprint_id) || 0) + Number(c.capacity_person_days)));
      sprintsData.forEach(s => { s.capacityTotal = totals.has(s.id) ? totals.get(s.id) : null; });
    }

    renderSprintRows();
  }

  function renderSprintRows() {
    const tbody = document.getElementById('sprint-tbody');
    if (!sprintsData.length) { tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${t('common.none')}</td></tr>`; return; }

    sortArray(sprintsData, sortState);

    tbody.innerHTML = sprintsData.map(s => `
      <tr data-id="${s.id}">
        <td class="mono">${s.sprint_number}</td>
        <td>${escapeHtml(s.name || '')}</td>
        <td class="mono">${formatDate(s.start_date)}</td>
        <td class="mono">${formatDate(s.end_date)}</td>
        <td><input type="checkbox" class="closed-toggle" ${s.is_closed ? 'checked' : ''}></td>
        <td class="num">
          ${s.capacityTotal !== null && s.capacityTotal !== undefined
            ? `<span class="mono">${s.capacityTotal.toFixed(1)} PT</span>`
            : `<span class="empty-state" style="padding:0;">${t('sprints.notCalculated')}</span>`}
          <button type="button" class="btn btn-secondary calc-capacity-btn" style="margin-left:0.5rem;">${t('sprints.calculate')}</button>
          <button type="button" class="btn btn-secondary velocity-btn" style="margin-left:0.35rem;">${t('sprints.storyPoints')}</button>
        </td>
        <td class="row-actions">
          ${iconButton(ICON_EDIT, t('common.edit'), 'edit-btn')}
          ${iconButton(ICON_DELETE, t('common.delete'), 'delete-btn')}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.calc-capacity-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        btn.disabled = true;
        btn.textContent = t('common.loading');
        const { error } = await supabase.rpc('calculate_capacity_snapshot', { target_sprint_id: id });
        if (error) { alert(t('common.error') + '\n' + error.message); btn.disabled = false; btn.textContent = t('sprints.calculate'); return; }
        loadSprints();
      });
    });

    tbody.querySelectorAll('.velocity-btn').forEach(btn => {
      btn.addEventListener('click', () => openVelocityModal(btn.closest('tr').dataset.id));
    });

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

  async function openVelocityModal(sprintId) {
    const sprint = sprintsData.find(s => s.id === sprintId);

    const [{ data: teams }, { data: existing }, { data: caps }, { data: band }, { data: cfg }] = await Promise.all([
      supabase.from('teams').select('id, name').order('name'),
      supabase.from('sprint_velocity').select('team_id, planned_sp, completed_sp').eq('sprint_id', sprintId),
      supabase.from('capacity_snapshots').select('capacity_person_days, employees(team_id)').eq('sprint_id', sprintId),
      supabase.from('confidence_bands').select('lower_pct, upper_pct').eq('sprint_position', sprint ? sprint.sprint_number : -1).maybeSingle(),
      supabase.from('app_config').select('value').eq('key', 'velocity_rolling_window').maybeSingle(),
    ]);

    const windowSize = (cfg && cfg.value) ? Number(cfg.value) : 3;
    const existingMap = new Map((existing || []).map(v => [v.team_id, v]));
    const capacityByTeam = new Map();
    (caps || []).forEach(c => {
      const tId = c.employees?.team_id;
      if (!tId) return;
      capacityByTeam.set(tId, (capacityByTeam.get(tId) || 0) + Number(c.capacity_person_days));
    });

    if (!teams || !teams.length) {
      alert(t('common.none'));
      return;
    }

    // Pro Team die historische Velocity abfragen und daraus den Von-Bis-Bereich berechnen
    const velocities = await Promise.all(teams.map(tm => supabase.rpc('get_team_velocity', { target_team_id: tm.id, window_size: windowSize })));
    const rangeByTeam = new Map();
    teams.forEach((tm, i) => {
      const velocity = velocities[i].data;
      const capacity = capacityByTeam.get(tm.id);
      if (velocity == null || capacity == null || !band) { rangeByTeam.set(tm.id, null); return; }
      const lower = Math.round(velocity * capacity * Number(band.lower_pct));
      const upper = Math.round(velocity * capacity * Number(band.upper_pct));
      rangeByTeam.set(tm.id, { lower, upper });
    });

    const bodyHtml = `
      <div class="form-grid" style="grid-template-columns: 1fr 100px 100px;">
        <div></div>
        <label style="text-align:center;">${t('sprints.plannedSp')}</label>
        <label style="text-align:center;">${t('sprints.completedSp')}</label>
        ${teams.map(tm => {
          const ex = existingMap.get(tm.id);
          const cap = capacityByTeam.get(tm.id);
          const range = rangeByTeam.get(tm.id);
          const rangeText = range
            ? t('sprints.forecastRange').replace('{lower}', range.lower).replace('{upper}', range.upper)
            : t('sprints.forecastUnavailable');
          return `
            <label>
              ${escapeHtml(tm.name)}${cap !== undefined ? ` <span style="color:var(--text-muted); font-size:0.75rem;">(${cap.toFixed(1)} PT)</span>` : ''}
              <br><span style="color:var(--accent); font-size:0.75rem; font-weight:500;">${rangeText}</span>
            </label>
            <input type="number" min="0" step="0.5" class="vel-planned" data-team="${tm.id}" value="${ex ? ex.planned_sp : ''}">
            <input type="number" min="0" step="0.5" class="vel-completed" data-team="${tm.id}" value="${ex ? ex.completed_sp : ''}">
          `;
        }).join('')}
      </div>
      <p style="font-size:0.78rem; color:var(--text-muted); margin-top:0.5rem;">${t('sprints.velocityHint')}</p>
    `;

    const modal = openFormModal({ title: t('sprints.storyPoints'), bodyHtml, submitLabel: t('common.save'), cancelLabel: t('common.cancel') });

    modal.submitBtn.addEventListener('click', async () => {
      const rows = teams
        .map(tm => {
          const plannedEl = modal.body.querySelector(`.vel-planned[data-team="${tm.id}"]`);
          const completedEl = modal.body.querySelector(`.vel-completed[data-team="${tm.id}"]`);
          const planned = plannedEl.value;
          const completed = completedEl.value;
          if (planned === '' && completed === '') return null;
          return {
            sprint_id: sprintId,
            team_id: tm.id,
            planned_sp: planned === '' ? 0 : Number(planned),
            completed_sp: completed === '' ? 0 : Number(completed),
            team_capacity_person_days: capacityByTeam.get(tm.id) || 0,
          };
        })
        .filter(Boolean);

      if (!rows.length) { modal.close(); return; }

      const { error } = await supabase.from('sprint_velocity').upsert(rows, { onConflict: 'sprint_id,team_id' });
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  loadPis();
}
