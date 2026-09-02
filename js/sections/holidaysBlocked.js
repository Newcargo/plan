import { t } from '../i18n.js';
import { renderHolidays } from './holidays.js';
import { renderBlocked } from './blockedPeriods.js';

// Fasst "Feiertage" und "Sperrzeiten" auf einer Seite mit Reitern zusammen. Jeder Reiter prueft
// weiterhin seine EIGENE Sehen-Berechtigung (holidays/blocked bleiben zwei getrennte Bereiche
// in der Matrix) - ein Reiter wird nur angezeigt, wenn die Person ihn auch sehen darf.
export async function renderHolidaysBlocked(container, context) {
  const permissions = (context && context.permissions) || {};
  const tabs = [
    { key: 'holidays', label: t('nav.holidays'), render: renderHolidays, allowed: !!(permissions.holidays && permissions.holidays.view) },
    { key: 'blocked', label: t('nav.blocked'), render: renderBlocked, allowed: !!(permissions.blocked && permissions.blocked.view) },
  ].filter(tab => tab.allowed);

  if (!tabs.length) {
    container.innerHTML = `<p class="empty-state">${t('common.none')}</p>`;
    return;
  }

  let activeKey = tabs[0].key;

  function renderShell() {
    container.innerHTML = `
      <header><h1>${t('nav.holidaysBlocked')}</h1></header>
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
