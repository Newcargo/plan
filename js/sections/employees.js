import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { createSortState, sortableHeader, wireSortHeaders, sortArray } from '../sortable.js';
import { openFormModal, showConfirmModal } from '../modal.js';
import { invokeAdminUsers } from '../adminUsers.js';

export async function renderEmployees(container, context) {
  const canEdit = !!(context && context.permissions && context.permissions.employees && context.permissions.employees.edit);
  const isAdmin = !!(context && context.roles && context.roles.has('admin'));
  const sortState = createSortState('full_name', true);

  container.innerHTML = `
    <header><h1>${t('employees.title')}</h1></header>
    <div class="card">
      <div class="toolbar">
        <div></div>
        ${canEdit ? `<button type="button" class="btn btn-primary" id="open-add-btn">${t('common.add')}</button>` : ''}
      </div>
      <table>
        <thead><tr id="emp-thead-row"></tr></thead>
        <tbody id="emp-tbody"><tr><td colspan="8" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  let teams = [];
  let empsData = [];
  let reductionMap = new Map();

  const { data: teamData } = await supabase.from('teams').select('id, name').order('name');
  teams = teamData || [];
  const teamMap = new Map(teams.map(tm => [tm.id, tm.name]));

  function wireHead() {
    const row = document.getElementById('emp-thead-row');
    row.innerHTML = `
      ${sortableHeader(t('employees.fullName'), 'full_name', sortState)}
      <th>${t('roles.email')}</th>
      ${sortableHeader(t('employees.team'), 'team_name', sortState)}
      <th class="num">${t('employees.employmentPct')}</th>
      <th class="num">${t('employees.effective')}</th>
      <th>${t('employees.active')}</th>
      <th>${t('employees.hasLogin')}</th>
      <th></th>
    `;
    wireSortHeaders(row, sortState, () => { renderRows(); wireHead(); });
  }
  wireHead();

  function formBody(emp) {
    return `
      <div class="form-grid">
        <label>${t('employees.fullName')}</label>
        <input type="text" id="mf-name" required value="${emp ? escapeHtml(emp.full_name) : ''}">

        ${fieldLabel(t('roles.email'), emp && emp.auth_user_id
          ? 'Hat bereits einen App-Zugang – E-Mail nur über "Rollen & Zugriff" änderbar, damit Login und Stammdaten synchron bleiben.'
          : 'E-Mail-Adresse des Mitarbeiters. Solange noch kein App-Zugang besteht, kann sie hier frei erfasst/geändert werden.')}
        <input type="email" id="mf-email" value="${emp && emp.email ? escapeHtml(emp.email) : ''}" ${emp && emp.auth_user_id ? 'readonly' : ''}>

        ${fieldLabel(t('employees.team'), 'Team-Zuordnung bestimmt den Standard-Fokusfaktor und Team-Puffer für die Kapazitätsberechnung dieser Person.')}
        <select id="mf-team">${teams.map(tm => `<option value="${tm.id}" ${emp && emp.team_id === tm.id ? 'selected' : ''}>${escapeHtml(tm.name)}</option>`).join('')}</select>

        ${fieldLabel(t('employees.employmentPct'), 'Beschäftigungsgrad (0–1), z. B. 0.8 für 80%. Fliesst direkt in die Kapazitätsberechnung ein.')}
        <input type="number" id="mf-pensum" min="0" max="1" step="0.01" required value="${emp ? emp.employment_pct : '1.00'}">

        <div class="divider"></div>

        ${fieldLabel(t('employees.focusOverride'), 'Überschreibt den Team-Fokusfaktor nur für diese Person. Leer lassen, um den Team-Standard zu verwenden.')}
        <input type="number" id="mf-focus-override" min="0" max="1" step="0.01" value="${emp && emp.focus_factor_override != null ? emp.focus_factor_override : ''}">

        ${fieldLabel(t('employees.individualFactor'), 'Zusätzlicher persönlicher Reduktionsfaktor (0–1), z. B. bei Sonderaufgaben. Multipliziert sich mit dem Fokusfaktor.')}
        <input type="number" id="mf-indiv-factor" min="0" max="1" step="0.01" value="${emp && emp.individual_factor != null ? emp.individual_factor : ''}">

        ${fieldLabel(t('employees.individualNote'), 'Pflichtfeld, sobald ein individueller Zusatzfaktor gesetzt ist – dokumentiert nachvollziehbar, warum.')}
        <input type="text" id="mf-indiv-note" value="${emp && emp.individual_factor_note ? escapeHtml(emp.individual_factor_note) : ''}">

        <div class="divider"></div>

        ${fieldLabel(t('employees.isExternal'), 'Mitarbeiter ohne Fiori-SAP-Zugang. Ihr Urlaub-Genehmigungsprozess läuft über den People Pool Manager statt über Fiori-SAP.')}
        <input type="checkbox" id="mf-external" ${emp && emp.is_external ? 'checked' : ''}>

        ${fieldLabel(t('employees.active'), 'Inaktive Mitarbeiter erscheinen nicht mehr im Team-Kalender und können sich nicht mehr einloggen. Für Personen, die die Firma verlassen haben.')}
        <input type="checkbox" id="mf-active" ${!emp || emp.active ? 'checked' : ''}>
      </div>
    `;
  }

  function readForm(modal, emp) {
    const indivFactor = modal.body.querySelector('#mf-indiv-factor').value;
    const indivNote = modal.body.querySelector('#mf-indiv-note').value.trim();
    if (indivFactor && !indivNote) {
      alert(t('employees.individualNote'));
      return null;
    }
    const payload = {
      full_name: modal.body.querySelector('#mf-name').value.trim(),
      team_id: modal.body.querySelector('#mf-team').value || null,
      employment_pct: modal.body.querySelector('#mf-pensum').value,
      focus_factor_override: modal.body.querySelector('#mf-focus-override').value || null,
      individual_factor: indivFactor || null,
      individual_factor_note: indivFactor ? indivNote : null,
      is_external: modal.body.querySelector('#mf-external').checked,
      active: modal.body.querySelector('#mf-active').checked,
    };
    // E-Mail nur setzen, solange noch kein App-Zugang besteht (sonst laeuft das ueber
    // "Rollen & Zugriff", damit Login und Stammdaten synchron bleiben)
    if (!emp || !emp.auth_user_id) {
      payload.email = modal.body.querySelector('#mf-email').value.trim() || null;
    }
    return payload;
  }

  function openAdd() {
    const modal = openFormModal({ title: t('common.add'), bodyHtml: formBody(null), submitLabel: t('common.add'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = readForm(modal, null);
      if (!payload) return;
      const { error } = await supabase.from('employees').insert(payload);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      loadEmployees();
    });
  }

  function openEdit(emp) {
    const modal = openFormModal({ title: t('common.edit'), bodyHtml: formBody(emp), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = readForm(modal, emp);
      if (!payload) return;
      const { error } = await supabase.from('employees').update(payload).eq('id', emp.id);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      loadEmployees();
    });
  }

  if (canEdit) document.getElementById('open-add-btn').addEventListener('click', openAdd);

  async function loadEmployees() {
    const tbody = document.getElementById('emp-tbody');
    const { data: emps, error } = await supabase
      .from('employees')
      .select('id, full_name, email, team_id, employment_pct, focus_factor_override, individual_factor, individual_factor_note, is_external, active, auth_user_id');

    if (error) { tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${t('common.error')}</td></tr>`; return; }

    const { data: reductions } = await supabase.from('v_employee_reduction').select('employee_id, effective_reduction_pct');
    reductionMap = new Map((reductions || []).map(r => [r.employee_id, r.effective_reduction_pct]));

    empsData = (emps || []).map(emp => ({ ...emp, team_name: teamMap.get(emp.team_id) || '' }));
    renderRows();
  }

  function renderRows() {
    const tbody = document.getElementById('emp-tbody');
    if (!empsData.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${t('common.none')}</td></tr>`; return; }

    sortArray(empsData, sortState);

    tbody.innerHTML = empsData.map(emp => {
      const eff = reductionMap.get(emp.id);
      const effPct = eff !== undefined ? Math.round(Number(eff) * 100) + '%' : '–';
      return `
        <tr data-id="${emp.id}" class="${!emp.active ? 'row-past' : ''}">
          <td>${escapeHtml(emp.full_name)}${emp.is_external ? ` <span class="badge badge-muted">extern</span>` : ''}</td>
          <td>${emp.email ? escapeHtml(emp.email) : '–'}</td>
          <td>${escapeHtml(emp.team_name || '–')}</td>
          <td class="num mono">${Number(emp.employment_pct).toFixed(2)}</td>
          <td class="num mono">${effPct}</td>
          <td>${emp.active
            ? `<span class="badge badge-success">${t('employees.active')}</span>`
            : `<span class="badge badge-muted">${t('employees.inactive')}</span>`}</td>
          <td>${emp.auth_user_id
            ? `<span class="badge badge-success">${t('employees.hasLogin')}</span>`
            : `<span class="badge badge-muted">${t('employees.noLogin')}</span>`}</td>
          <td class="row-actions">
            ${isAdmin ? `<button type="button" class="btn btn-secondary backfill-btn">${t('employees.backfillLeave')}</button>` : ''}
            ${canEdit ? iconButton(ICON_EDIT, t('common.edit'), 'edit-btn') : ''}
            ${canEdit ? iconButton(ICON_DELETE, t('common.delete'), 'delete-btn') : ''}
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').dataset.id;
        openEdit(empsData.find(e => e.id === id));
      });
    });

    tbody.querySelectorAll('.backfill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').dataset.id;
        openBackfillModal(empsData.find(e => e.id === id));
      });
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await invokeAdminUsers({ action: 'delete_employee', employee_id: id });
        if (error) {
          // Fremdschluessel-Fehler (Urlaubshistorie vorhanden) -> Deaktivieren anbieten statt loeschen
          const isFkError = error.toLowerCase().includes('foreign key');
          if (isFkError) {
            const wantsDeactivate = await showConfirmModal({
              title: t('employees.cannotDeleteTitle'),
              message: t('employees.cannotDeleteMessage'),
              confirmLabel: t('employees.deactivateInstead'),
              cancelLabel: t('common.cancel'),
            });
            if (wantsDeactivate) {
              const { error: deactErr } = await supabase.from('employees').update({ active: false }).eq('id', id);
              if (deactErr) { alert(t('common.error') + '\n' + deactErr.message); return; }
              loadEmployees();
            }
            return;
          }
          alert(t('common.error') + '\n' + error);
          return;
        }
        loadEmployees();
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  function openBackfillModal(emp) {
    const bodyHtml = `
      <p style="font-size:0.85rem; color:var(--text-muted); margin-top:-0.25rem;">${t('employees.backfillHint').replace('{name}', escapeHtml(emp.full_name))}</p>
      <div class="form-grid">
        <label>${t('myLeave.start')} – ${t('myLeave.end')}</label>
        <div class="date-range-inline">
          <input type="date" id="bf-start" required>
          <span>–</span>
          <input type="date" id="bf-end" required>
        </div>
        <label>${t('myLeave.dayPortion')}</label>
        <select id="bf-portion">
          <option value="ganztag">${t('myLeave.dayPortion.ganztag')}</option>
          <option value="vormittag">${t('myLeave.dayPortion.vormittag')}</option>
          <option value="nachmittag">${t('myLeave.dayPortion.nachmittag')}</option>
        </select>
      </div>
      <p id="bf-error" class="error-text" hidden></p>
    `;
    const modal = openFormModal({ title: t('employees.backfillLeave'), bodyHtml, submitLabel: t('employees.backfillSubmit'), cancelLabel: t('common.cancel') });

    const startInput = modal.body.querySelector('#bf-start');
    const endInput = modal.body.querySelector('#bf-end');
    startInput.addEventListener('change', () => { if (!endInput.value || endInput.value < startInput.value) endInput.value = startInput.value; });

    modal.submitBtn.addEventListener('click', async () => {
      const errorEl = modal.body.querySelector('#bf-error');
      errorEl.hidden = true;
      const start = startInput.value;
      const end = endInput.value;
      if (!start || !end || start > end) {
        errorEl.textContent = t('myLeave.dateOrderError');
        errorEl.hidden = false;
        return;
      }
      const { error } = await supabase.from('leave_requests').insert({
        employee_id: emp.id,
        start_date: start,
        end_date: end,
        day_portion: modal.body.querySelector('#bf-portion').value,
        absence_type: 'urlaub',
        status: 'final_gebucht',
      });
      if (error) { errorEl.textContent = error.message; errorEl.hidden = false; return; }
      modal.close();
    });
  }

  loadEmployees();
}
