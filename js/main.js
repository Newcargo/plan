import { supabase } from './supabaseClient.js';
import { checkAccess, signIn, signOut } from './auth.js';
import { t, getLang, setLang, applyTranslations } from './i18n.js';

import { renderDashboard } from './sections/dashboard.js';
import { renderTeams } from './sections/teams.js';
import { renderEmployees } from './sections/employees.js';
import { renderHolidays } from './sections/holidays.js';
import { renderBlocked } from './sections/blockedPeriods.js';
import { renderSprints } from './sections/sprints.js';
import { renderBands } from './sections/confidenceBands.js';
import { renderSettings } from './sections/settings.js';
import { renderRoles } from './sections/roles.js';
import { renderChangelog } from './sections/changelog.js';
import { renderMyLeave } from './sections/myLeave.js';
import { renderApprovals } from './sections/approvals.js';
import { renderTeamCalendar } from './sections/teamCalendar.js';
import { renderAuditLog } from './sections/auditLog.js';
import { APP_VERSION } from './version.js';
import { ROLE_DEFINITIONS, ALL_ROLE_KEYS } from './roleDefinitions.js';
import { openFormModal } from './modal.js';
import { initNotifications, refreshBadge } from './notifications.js';

const routes = {
  dashboard: renderDashboard,
  teams: renderTeams,
  employees: renderEmployees,
  holidays: renderHolidays,
  blocked: renderBlocked,
  sprints: renderSprints,
  bands: renderBands,
  settings: renderSettings,
  roles: renderRoles,
  changelog: renderChangelog,
  'my-leave': renderMyLeave,
  approvals: renderApprovals,
  'team-calendar': renderTeamCalendar,
  'audit-log': renderAuditLog,
};

const loginScreen = document.getElementById('login-screen');
const forcePasswordScreen = document.getElementById('force-password-screen');
const appShell = document.getElementById('app-shell');
const mainContent = document.getElementById('main-content');

let currentRoles = new Set();
let currentEmployee = null;

async function refreshApprovalsBadge() {
  const btn = document.querySelector('.nav-item[data-route="approvals"]');
  if (!btn || btn.hidden) return;
  if (!(currentRoles.has('stufe2_genehmiger') || currentRoles.has('admin'))) return;

  const { count } = await supabase
    .from('leave_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'beantragt');

  let badge = btn.querySelector('.nav-badge');
  if (!count || count === 0) {
    if (badge) badge.remove();
    return;
  }
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'nav-badge';
    btn.appendChild(badge);
  }
  badge.textContent = count > 9 ? '9+' : String(count);
}

function setActiveNav(route) {
  document.querySelectorAll('.nav-item[data-route]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === route);
  });
}

async function navigate(route) {
  setActiveNav(route);
  const renderFn = routes[route] || routes['my-leave'];
  await renderFn(mainContent, { employee: currentEmployee, roles: currentRoles });
  refreshApprovalsBadge();
}

function applyRoleVisibility() {
  document.querySelectorAll('.nav-item[data-route]').forEach(btn => {
    const requires = btn.dataset.requires;
    const requiresAny = btn.dataset.requiresAny;

    if (requires) {
      btn.hidden = !currentRoles.has(requires);
    } else if (requiresAny) {
      const options = requiresAny.split(',');
      btn.hidden = !options.some(r => currentRoles.has(r));
    } else {
      btn.hidden = false;
    }
  });
  document.querySelectorAll('.nav-group-label[data-requires]').forEach(el => {
    el.hidden = !currentRoles.has(el.dataset.requires);
  });
}

function setupNav() {
  document.querySelectorAll('.nav-item[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await signOut();
    showLogin();
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === getLang());
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === btn.dataset.lang));
      renderSidebarUser();
      const active = document.querySelector('.nav-item.active');
      navigate(active ? active.dataset.route : defaultRoute());
    });
  });
}

function defaultRoute() {
  return currentRoles.has('admin') ? 'dashboard' : 'my-leave';
}

function showLogin(message) {
  appShell.hidden = true;
  forcePasswordScreen.hidden = true;
  loginScreen.hidden = false;
  const errEl = document.getElementById('login-error');
  if (message) { errEl.textContent = message; errEl.hidden = false; } else { errEl.hidden = true; }
}

function showForcePassword() {
  loginScreen.hidden = true;
  appShell.hidden = true;
  forcePasswordScreen.hidden = false;
}

async function showApp() {
  loginScreen.hidden = true;
  forcePasswordScreen.hidden = true;
  appShell.hidden = false;
  setupNav();
  applyRoleVisibility();
  applyTranslations();
  document.getElementById('sidebar-version').textContent = 'v' + APP_VERSION;
  renderSidebarUser();
  initNotifications(currentEmployee.id, () => navigate('my-leave'));
  await navigate(defaultRoute());
  setInterval(() => { refreshBadge(); refreshApprovalsBadge(); }, 60000);
}

function renderSidebarUser() {
  const el = document.getElementById('sidebar-user');
  if (!currentEmployee) { el.innerHTML = ''; return; }

  const roleLabels = ALL_ROLE_KEYS.filter(r => currentRoles.has(r)).map(r => ROLE_DEFINITIONS[r].label);
  const roleText = roleLabels.length ? roleLabels.join(', ') : t('roles.mitarbeiter');

  el.innerHTML = `
    <div class="sidebar-user-name">${escapeHtml(currentEmployee.full_name)}</div>
    <div class="sidebar-user-role">${escapeHtml(roleText)}</div>
  `;
  el.style.cursor = 'pointer';
  el.title = t('account.changePassword');
  el.onclick = openPasswordModal;
}

// Passwort-Regeln fuer selbst gesetzte Passwoerter (Erst-Login, "Mein Konto").
// Gilt NICHT fuer Admin-vergebene Start-/Reset-Passwoerter - die duerfen bewusst
// unbeschraenkt sein, da der Mitarbeiter sie beim naechsten Login ohnehin ersetzen muss.
function validatePasswordRules(pw) {
  const missing = [];
  if (pw.length < 12) missing.push(t('password.ruleLength'));
  if (!/[0-9]/.test(pw)) missing.push(t('password.ruleDigit'));
  if (!/[^A-Za-z0-9]/.test(pw)) missing.push(t('password.ruleSpecial'));
  return missing;
}

function openPasswordModal() {
  const modal = openFormModal({
    title: t('account.title'),
    bodyHtml: `
      <div class="form-grid">
        <label>${t('forcePw.new')}</label>
        <input type="password" id="mf-new-pw" required minlength="12" autocomplete="new-password">
        <label>${t('forcePw.confirm')}</label>
        <input type="password" id="mf-confirm-pw" required minlength="12" autocomplete="new-password">
      </div>
      <p style="color:var(--text-muted); font-size:0.78rem; margin:-0.6rem 0 1rem;">${t('password.hint')}</p>
      <p id="mf-pw-error" class="error-text" hidden></p>
    `,
    submitLabel: t('account.changePassword'),
    cancelLabel: t('common.cancel'),
  });

  modal.submitBtn.addEventListener('click', async () => {
    const errEl = modal.body.querySelector('#mf-pw-error');
    errEl.hidden = true;
    const newPw = modal.body.querySelector('#mf-new-pw').value;
    const confirmPw = modal.body.querySelector('#mf-confirm-pw').value;

    if (newPw !== confirmPw) {
      errEl.textContent = t('forcePw.mismatch');
      errEl.hidden = false;
      return;
    }
    const missing = validatePasswordRules(newPw);
    if (missing.length) {
      errEl.textContent = t('password.missingPrefix') + missing.join(', ');
      errEl.hidden = false;
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      errEl.textContent = error.message;
      errEl.hidden = false;
      return;
    }

    modal.close();
    alert(t('common.saved'));
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const { error } = await signIn(email, password);
  if (error) { showLogin(t('login.error')); return; }

  await handleAccessResult();
});

async function handleAccessResult() {
  const result = await checkAccess();

  if (result.status === 'ok') {
    currentEmployee = result.employee;
    currentRoles = result.roles;

    if (currentEmployee.must_change_password) {
      showForcePassword();
      return;
    }

    await showApp();
    return;
  }

  // Fuer alle anderen Faelle: Session sofort wieder beenden, kein Zugriff gewaehrt
  await supabase.auth.signOut();

  if (result.status === 'blocked') {
    showLogin(t('login.blocked').replace('{name}', result.contactName));
  } else {
    showLogin();
  }
}

document.getElementById('force-password-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl = document.getElementById('force-pw-error');
  errEl.hidden = true;

  const newPw = document.getElementById('force-pw-new').value;
  const confirmPw = document.getElementById('force-pw-confirm').value;

  if (newPw !== confirmPw) {
    errEl.textContent = t('forcePw.mismatch');
    errEl.hidden = false;
    return;
  }
  const missing = validatePasswordRules(newPw);
  if (missing.length) {
    errEl.textContent = t('password.missingPrefix') + missing.join(', ');
    errEl.hidden = false;
    return;
  }

  const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
  if (updateErr) {
    errEl.textContent = updateErr.message;
    errEl.hidden = false;
    return;
  }

  await supabase.from('employees').update({ must_change_password: false }).eq('id', currentEmployee.id);
  currentEmployee.must_change_password = false;
  document.getElementById('force-password-form').reset();
  await showApp();
});

// Beim Laden pruefen, ob bereits eine gueltige Session besteht
(async function init() {
  applyTranslations();
  await handleAccessResult();
})();
