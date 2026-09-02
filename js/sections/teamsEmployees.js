import { t } from '../i18n.js';
import { renderTeams } from './teams.js';
import { renderEmployees } from './employees.js';

// Fasst "Teams" und "Mitarbeiter" auf einer Seite mit Reitern zusammen. Jeder Reiter prueft
// weiterhin seine EIGENE Sehen-Berechtigung (teams/employees bleiben zwei getrennte Bereiche
// in der Matrix) - ein Reiter wird nur angezeigt, wenn die Person ihn auch sehen darf.
export async function renderTeamsEmployees(container, context) {
  const permissions = (context && context.permissions) || {};
  const tabs = [
    { key: 'teams', label: t('nav.teams'), render: renderTeams, allowed: !!(permissions.teams && permissions.teams.view) },
    { key: 'employees', label: t('nav.employees'), render: renderEmployees, allowed: !!(permissions.employees && permissions.employees.view) },
  ].filter(tab => tab.allowed);

  if (!tabs.length) {
    container.innerHTML = `<p class="empty-state">${t('common.none')}</p>`;
    return;
  }

  let activeKey = tabs[0].key;

  function renderShell() {
    container.innerHTML = `
      <header><h1>${t('nav.teamsEmployees')}</h1></header>
      <div class="dash-tiles" style="margin-bottom:1rem;">
        ${tabs.map(tab => `<button type="button" class="dash-tile${tab.key === activeKey ? ' active' : ''}" data-tab="${tab.key}">${tab.label}</button>`).join('')}
      </div>
      <div id="tab-content"></div>
    `;
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeKey = btn.dataset.tab;
        renderShell();
      });
    });
    const activeTab = tabs.find(tab => tab.key === activeKey);
    activeTab.render(document.getElementById('tab-content'), context);
  }

  renderShell();
}
