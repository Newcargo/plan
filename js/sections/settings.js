import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { fieldLabel } from '../icons.js';
import { openFormModal } from '../modal.js';
import { signIn } from '../auth.js';

export async function renderSettings(container, context) {
  container.innerHTML = `
    <header><h1>${t('settings.title')}</h1></header>
    <div class="card">
      <div class="form-panel-title">${t('settings.title')}</div>
      <div class="form-grid">
        ${fieldLabel(t('settings.rollingWindow'), 'Anzahl der letzten abgeschlossenen Sprints, aus denen der SP/PT-Durchschnitt (Velocity) für die Prognose berechnet wird.')}
        <input type="number" id="f-window" min="1" step="1" class="narrow">

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

    <div class="card" style="border:2px solid var(--danger);">
      <div class="form-panel-title" style="color:var(--danger);">⚠️ ${t('settings.dangerTitle')}</div>
      <p style="font-size:0.82rem; color:var(--text-muted); margin:-0.25rem 0 0.9rem;">${t('settings.dangerHint')}</p>
      <div class="form-grid">
        <label>${t('settings.dangerCategory')}</label>
        <select id="danger-category">
          <option value="leave_requests">${t('settings.dangerLeave')}</option>
          <option value="holidays">${t('nav.holidays')}</option>
          <option value="blocked_periods">${t('nav.blocked')}</option>
        </select>

        ${fieldLabel(t('settings.dangerRange'), t('settings.dangerRangeHint'))}
        <div class="date-range-inline">
          <input type="date" id="danger-from">
          <span>–</span>
          <input type="date" id="danger-to">
        </div>
      </div>
      <div class="form-actions" style="justify-content:flex-start;">
        <button id="danger-delete-btn" class="btn btn-danger">${t('settings.dangerDelete')}</button>
      </div>
    </div>
  `;

  const { data } = await supabase.from('app_config').select('*');
  const map = new Map((data || []).map(c => [c.key, c.value]));
  document.getElementById('f-window').value = map.get('velocity_rolling_window') ?? 3;
  document.getElementById('f-blocked-contact').value = map.get('blocked_contact_name') ?? 'Admin';
  document.getElementById('f-reminder-days').value = map.get('reminder_business_days') ?? 5;
  document.getElementById('f-email-enabled').checked = map.get('email_notifications_enabled') ?? true;

  document.getElementById('save-btn').addEventListener('click', async () => {
    const windowVal = Number(document.getElementById('f-window').value);
    const contactName = document.getElementById('f-blocked-contact').value.trim() || 'Admin';
    const reminderDays = Number(document.getElementById('f-reminder-days').value);
    const emailEnabled = document.getElementById('f-email-enabled').checked;

    const { error: e1 } = await supabase.from('app_config').upsert(
      { key: 'velocity_rolling_window', value: windowVal }, { onConflict: 'key' }
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
    if (e1 || e3 || e4 || e5) {
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

  const DANGER_CONFIG = {
    leave_requests: { table: 'leave_requests', dateCol: 'start_date' },
    holidays: { table: 'holidays', dateCol: 'date' },
    blocked_periods: { table: 'blocked_periods', dateCol: 'start_date' },
  };

  function buildDangerQuery(base, cfg, from, to) {
    let q = base;
    if (from) q = q.gte(cfg.dateCol, from);
    if (to) q = q.lte(cfg.dateCol, to);
    return q;
  }

  document.getElementById('danger-delete-btn').addEventListener('click', async () => {
    const categorySelect = document.getElementById('danger-category');
    const cfg = DANGER_CONFIG[categorySelect.value];
    const categoryLabel = categorySelect.selectedOptions[0].textContent;
    const from = document.getElementById('danger-from').value || null;
    const to = document.getElementById('danger-to').value || null;

    const { count, error: countErr } = await buildDangerQuery(
      supabase.from(cfg.table).select('*', { count: 'exact', head: true }), cfg, from, to
    );
    if (countErr) { alert(t('common.error') + '\n' + countErr.message); return; }
    if (!count) { alert(t('settings.dangerNothing')); return; }

    const bodyHtml = `
      <p>${t('settings.dangerConfirmText').replace('{count}', count).replace('{category}', categoryLabel)}</p>
      <div class="form-grid">
        <label>${t('settings.dangerPasswordLabel')}</label>
        <input type="password" id="danger-password" required autocomplete="current-password">
      </div>
      <p id="danger-error" class="error-text" hidden></p>
    `;
    const modal = openFormModal({ title: t('settings.dangerConfirmTitle'), bodyHtml, submitLabel: t('settings.dangerDelete'), cancelLabel: t('common.cancel') });
    modal.submitBtn.classList.remove('btn-primary');
    modal.submitBtn.classList.add('btn-danger');

    modal.submitBtn.addEventListener('click', async () => {
      const errorEl = modal.body.querySelector('#danger-error');
      errorEl.hidden = true;
      const password = modal.body.querySelector('#danger-password').value;
      if (!password) return;

      const email = context && context.employee && context.employee.email;
      if (!email) { errorEl.textContent = t('settings.dangerNoEmail'); errorEl.hidden = false; return; }

      const { error: authErr } = await signIn(email, password);
      if (authErr) {
        errorEl.textContent = t('settings.dangerWrongPassword');
        errorEl.hidden = false;
        return;
      }

      const { error: delErr } = await buildDangerQuery(supabase.from(cfg.table).delete(), cfg, from, to);
      if (delErr) { errorEl.textContent = delErr.message; errorEl.hidden = false; return; }

      modal.close();
      alert(t('settings.dangerDone').replace('{count}', count));
      document.getElementById('danger-from').value = '';
      document.getElementById('danger-to').value = '';
    });
  });
}
