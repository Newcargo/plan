import { t } from '../i18n.js';

export async function renderHelp(container, context) {
  const roles = (context && context.roles) || new Set();
  const isApprover = roles.has('stufe2_genehmiger') || roles.has('admin');
  const isPpm = roles.has('people_pool_manager') || roles.has('admin');
  const isAdmin = roles.has('admin');

  function section(title, bodyHtml) {
    return `
      <div class="card">
        <div class="form-panel-title">${title}</div>
        ${bodyHtml}
      </div>
    `;
  }

  function list(items) {
    return `<ul style="margin:0; padding-left:1.2rem; font-size:0.88rem; line-height:1.7; color:var(--text);">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  }

  let html = `
    <header>
      <h1>${t('help.title')}</h1>
      <p>${t('help.subtitle')}</p>
    </header>
  `;

  html += section(t('help.leaveTitle'), list([
    t('help.leave1'),
    t('help.leave2'),
    t('help.leave3'),
    t('help.leave4'),
    t('help.leave5'),
  ]));

  html += section(t('help.sickTitle'), list([
    t('help.sick1'),
    t('help.sick2'),
  ]));

  html += section(t('help.calendarTitle'), list([
    t('help.calendar1'),
    t('help.calendar2'),
  ]));

  html += section(t('help.accountTitle'), list([
    t('help.account1'),
    t('help.account2'),
  ]));

  if (isApprover) {
    html += section(t('help.approverTitle'), list([
      t('help.approver1'),
      t('help.approver2'),
      t('help.approver3'),
    ]));
  }

  if (isPpm) {
    html += section(t('help.ppmTitle'), list([
      t('help.ppm1'),
      t('help.ppm2'),
    ]));
  }

  if (isAdmin) {
    html += section(t('help.adminTitle'), list([
      t('help.admin1'),
      t('help.admin2'),
      t('help.admin3'),
      t('help.admin4'),
      t('help.admin5'),
      t('help.admin6'),
      t('help.admin7'),
    ]));
  }

  container.innerHTML = html;
}
