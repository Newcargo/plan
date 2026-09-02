import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { fieldLabel, ICON_EDIT, ICON_DELETE, iconButton } from '../icons.js';
import { openFormModal } from '../modal.js';

export async function renderSettings(container) {
  container.innerHTML = `
    <header><h1>${t('settings.title')}</h1></header>
    <div class="card">
      <div class="form-panel-title">${t('settings.title')}</div>
      <div class="form-grid">
        ${fieldLabel(t('settings.rollingWindow'), 'Anzahl der letzten abgeschlossenen Sprints, aus denen der SP/PT-Durchschnitt (Velocity) für die Prognose berechnet wird.')}
        <input type="number" id="f-window" min="1" step="1" class="narrow">

        ${fieldLabel(t('settings.defaultSprintCount'), 'Standardwert für die Anzahl Sprints bei einer neuen PI, z. B. 5.')}
        <input type="number" id="f-sprintcount" min="1" step="1" class="narrow">

        ${fieldLabel(t('roles.blocked') + ' – Kontaktperson (Name, keine E-Mail)', 'Name, der gesperrten Mitarbeitenden beim Login-Versuch angezeigt wird, an wen sie sich wenden sollen. Bewusst nur ein Name, keine E-Mail-Adresse.')}
        <input type="text" id="f-blocked-contact">

        ${fieldLabel(t('settings.reminderDays'), 'Ab wie vielen Werktagen ein offener Antrag in der Genehmigungs-Ansicht als "wartet lange" hervorgehoben wird.')}
        <input type="number" id="f-reminder-days" min="1" step="1" class="narrow">

        ${fieldLabel(t('settings.emailEnabled'), 'Schaltet alle automatischen E-Mail-Benachrichtigungen (Beantragen, Genehmigen, Ablehnen) und die dazugehörigen Buttons ("Erinnerung senden", "Mail erneut senden") komplett ein oder aus.')}
        <input type="checkbox" id="f-email-enabled">
      </div>
      <div class="form-actions" style="justify-content:flex-start;align-items:center;">
        <button id="save-btn" class="btn btn-primary">${t('common.save')}</button>
        <span id="save-msg" style="color:var(--success);font-size:0.85rem;"></span>
      </div>
    </div>

    <div class="card">
      <div class="form-panel-title">${t('settings.matrixTitle')}</div>
      <p style="font-size:0.82rem; color:var(--text-muted); margin:-0.25rem 0 0.9rem;">${t('settings.matrixHint')}</p>
      <table style="table-layout:fixed;">
        <thead>
          <tr>
            <th rowspan="2" style="width:170px;">${t('settings.matrixArea')}</th>
            <th colspan="2" class="center">${t('roles.mitarbeiter')}</th>
            <th colspan="2" class="center">${t('roles.stufe2_genehmiger')}</th>
            <th colspan="2" class="center">${t('roles.people_pool_manager')}</th>
            <th class="center" rowspan="2" style="width:90px;">${t('roles.admin')}</th>
          </tr>
          <tr>
            <th class="center" style="width:90px;">${t('settings.mxView')}</th><th class="center" style="width:90px;">${t('settings.mxEdit')}</th>
            <th class="center" style="width:90px;">${t('settings.mxView')}</th><th class="center" style="width:90px;">${t('settings.mxEdit')}</th>
            <th class="center" style="width:90px;">${t('settings.mxView')}</th><th class="center" style="width:90px;">${t('settings.mxEdit')}</th>
          </tr>
        </thead>
        <tbody id="matrix-tbody"><tr><td colspan="8" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
      <div class="form-actions" style="justify-content:flex-start;align-items:center;">
        <button id="matrix-save-btn" class="btn btn-primary">${t('common.save')}</button>
        <span id="matrix-save-msg" style="color:var(--success);font-size:0.85rem;"></span>
      </div>
    </div>

    <div class="card">
      <div class="form-panel-title">${t('bands.title')}</div>
      <p style="font-size:0.82rem; color:var(--text-muted); margin:-0.25rem 0 0.9rem;">${t('bands.subtitle')}</p>
      <div class="toolbar">
        <div></div>
        <button type="button" class="btn btn-primary" id="band-add-btn">${t('common.add')}</button>
      </div>
      <table>
        <thead><tr>
          <th>${t('bands.position')}</th><th class="num">${t('bands.lower')}</th><th class="num">${t('bands.upper')}</th><th></th>
        </tr></thead>
        <tbody id="band-tbody"><tr><td colspan="4" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  const { data } = await supabase.from('app_config').select('*');
  const map = new Map((data || []).map(c => [c.key, c.value]));
  document.getElementById('f-window').value = map.get('velocity_rolling_window') ?? 3;
  document.getElementById('f-sprintcount').value = map.get('default_pi_sprint_count') ?? 5;
  document.getElementById('f-blocked-contact').value = map.get('blocked_contact_name') ?? 'Admin';
  document.getElementById('f-reminder-days').value = map.get('reminder_business_days') ?? 5;
  document.getElementById('f-email-enabled').checked = map.get('email_notifications_enabled') ?? true;

  document.getElementById('save-btn').addEventListener('click', async () => {
    const windowVal = Number(document.getElementById('f-window').value);
    const sprintCountVal = Number(document.getElementById('f-sprintcount').value);
    const contactName = document.getElementById('f-blocked-contact').value.trim() || 'Admin';
    const reminderDays = Number(document.getElementById('f-reminder-days').value);
    const emailEnabled = document.getElementById('f-email-enabled').checked;

    const { error: e1 } = await supabase.from('app_config').upsert(
      { key: 'velocity_rolling_window', value: windowVal }, { onConflict: 'key' }
    );
    const { error: e2 } = await supabase.from('app_config').upsert(
      { key: 'default_pi_sprint_count', value: sprintCountVal }, { onConflict: 'key' }
    );
    const { error: e3 } = await supabase.from('app_config').upsert(
      { key: 'blocked_contact_name', value: contactName }, { onConflict: 'key' }
    );
    const { error: e4 } = await supabase.from('app_config').upsert(
      { key: 'reminder_business_days', value: reminderDays }, { onConflict: 'key' }
    );
    const { error: e5 } = await supabase.from('app_config').upsert(
      { key: 'email_notifications_enabled', value: emailEnabled }, { onConflict: 'key' }
    );

    const msg = document.getElementById('save-msg');
    if (e1 || e2 || e3 || e4 || e5) {
      msg.style.color = 'var(--danger)';
      msg.textContent = t('common.error');
    } else {
      msg.style.color = 'var(--success)';
      msg.textContent = t('common.saved');
      setTimeout(() => { msg.textContent = ''; }, 2500);
    }
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  const MATRIX_AREAS = [
    { area: 'genehmigt', label: t('nav.approvals') },
    { area: 'teams', label: t('nav.teams') },
    { area: 'employees', label: t('nav.employees') },
    { area: 'holidays', label: t('nav.holidays') },
    { area: 'blocked', label: t('nav.blocked') },
    { area: 'dashboard', label: t('nav.dashboard') },
    { area: 'sprints', label: t('nav.sprints') },
  ];
  const MATRIX_ROLES = ['mitarbeiter', 'stufe2_genehmiger', 'people_pool_manager'];

  loadMatrix();

  async function loadMatrix() {
    const tbody = document.getElementById('matrix-tbody');
    const { data, error } = await supabase.from('role_permissions').select('role, area, can_view, can_edit').in('role', MATRIX_ROLES);
    if (error) { tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${t('common.error')}</td></tr>`; return; }

    const map = new Map();
    (data || []).forEach(row => map.set(row.role + ':' + row.area, row));

    tbody.innerHTML = MATRIX_AREAS.map(({ area, label }) => {
      const cells = MATRIX_ROLES.map(role => {
        const row = map.get(role + ':' + area) || { can_view: false, can_edit: false };
        return `
          <td class="center"><input type="checkbox" class="mx-view" data-role="${role}" data-area="${area}" ${row.can_view ? 'checked' : ''}></td>
          <td class="center"><input type="checkbox" class="mx-edit" data-role="${role}" data-area="${area}" ${row.can_edit ? 'checked' : ''}></td>
        `;
      }).join('');
      return `<tr><td>${label}</td>${cells}<td class="center" style="color:var(--text-muted);">${t('settings.mxAlways')}</td></tr>`;
    }).join('');

    // Bearbeiten setzt automatisch Sehen voraus - beide haengen zusammen, damit keine
    // widerspruechliche Kombination (Bearbeiten ohne Sehen) entstehen kann.
    tbody.querySelectorAll('.mx-edit').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          const viewCb = tbody.querySelector(`.mx-view[data-role="${cb.dataset.role}"][data-area="${cb.dataset.area}"]`);
          if (viewCb) viewCb.checked = true;
        }
      });
    });
    tbody.querySelectorAll('.mx-view').forEach(cb => {
      cb.addEventListener('change', () => {
        if (!cb.checked) {
          const editCb = tbody.querySelector(`.mx-edit[data-role="${cb.dataset.role}"][data-area="${cb.dataset.area}"]`);
          if (editCb) editCb.checked = false;
        }
      });
    });
  }

  document.getElementById('matrix-save-btn').addEventListener('click', async () => {
    const tbody = document.getElementById('matrix-tbody');
    const rows = [];
    MATRIX_ROLES.forEach(role => {
      MATRIX_AREAS.forEach(({ area }) => {
        const viewCb = tbody.querySelector(`.mx-view[data-role="${role}"][data-area="${area}"]`);
        const editCb = tbody.querySelector(`.mx-edit[data-role="${role}"][data-area="${area}"]`);
        rows.push({ role, area, can_view: viewCb.checked, can_edit: editCb.checked });
      });
    });

    const { error } = await supabase.from('role_permissions').upsert(rows, { onConflict: 'role,area' });
    const msg = document.getElementById('matrix-save-msg');
    if (error) {
      msg.style.color = 'var(--danger)';
      msg.textContent = t('common.error') + ': ' + error.message;
    } else {
      msg.style.color = 'var(--success)';
      msg.textContent = t('settings.matrixSaved');
      setTimeout(() => { msg.textContent = ''; }, 2500);
    }
  });

  function bandFormBody(b) {
    return `
      <div class="form-grid">
        ${fieldLabel(t('bands.position'), 'Position des Sprints innerhalb der PI (1 = direkt nach PI Planning). Muss mit der Sprint-Position bei "PI & Sprints" übereinstimmen.')}
        <input type="number" id="mf-pos" min="1" required ${b ? 'readonly' : ''} value="${b ? b.sprint_position : ''}">

        ${fieldLabel(t('bands.lower'), 'Wie viel Prozent der berechneten Kapazität mindestens erwartet wird.')}
        <input type="number" id="mf-lower" min="0" max="1" step="0.01" required value="${b ? b.lower_pct : ''}">

        ${fieldLabel(t('bands.upper'), 'Wie viel Prozent der berechneten Kapazität höchstens erwartet wird, meist 100%.')}
        <input type="number" id="mf-upper" min="0" max="1" step="0.01" required value="${b ? b.upper_pct : ''}">
      </div>
    `;
  }

  function openBandAdd() {
    const modal = openFormModal({ title: t('common.add'), bodyHtml: bandFormBody(null), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        sprint_position: modal.body.querySelector('#mf-pos').value,
        lower_pct: modal.body.querySelector('#mf-lower').value,
        upper_pct: modal.body.querySelector('#mf-upper').value,
      };
      const { error } = await supabase.from('confidence_bands').upsert(payload, { onConflict: 'sprint_position' });
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      loadBands();
    });
  }

  function openBandEdit(b) {
    const modal = openFormModal({ title: t('common.edit'), bodyHtml: bandFormBody(b), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        sprint_position: b.sprint_position,
        lower_pct: modal.body.querySelector('#mf-lower').value,
        upper_pct: modal.body.querySelector('#mf-upper').value,
      };
      const { error } = await supabase.from('confidence_bands').upsert(payload, { onConflict: 'sprint_position' });
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      loadBands();
    });
  }

  document.getElementById('band-add-btn').addEventListener('click', openBandAdd);

  async function loadBands() {
    const tbody = document.getElementById('band-tbody');
    const { data, error } = await supabase.from('confidence_bands').select('*').order('sprint_position');
    if (error) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('common.error')}</td></tr>`; return; }
    if (!data.length) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('common.none')}</td></tr>`; return; }

    tbody.innerHTML = data.map(b => `
      <tr data-pos="${b.sprint_position}">
        <td class="mono">${b.sprint_position}</td>
        <td class="num mono">${Math.round(Number(b.lower_pct) * 100)}%</td>
        <td class="num mono">${Math.round(Number(b.upper_pct) * 100)}%</td>
        <td class="row-actions">
          ${iconButton(ICON_EDIT, t('common.edit'), 'band-edit-btn')}
          ${iconButton(ICON_DELETE, t('common.delete'), 'band-delete-btn')}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.band-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pos = btn.closest('tr').dataset.pos;
        openBandEdit(data.find(x => String(x.sprint_position) === pos));
      });
    });

    tbody.querySelectorAll('.band-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        const pos = btn.closest('tr').dataset.pos;
        const { error } = await supabase.from('confidence_bands').delete().eq('sprint_position', pos);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        loadBands();
      });
    });
  }

  loadBands();
}
