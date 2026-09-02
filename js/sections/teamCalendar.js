import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { formatMonthYear, localISO, todayISO, formatDate } from '../dateFormat.js';
import { openFormModal, showConfirmModal } from '../modal.js';
import { sendDecisionMail } from '../leaveDecision.js';

const STATUS_COLORS = {
  beantragt: { bg: '#E0A400', text: '#000', code: 'BE' },
  genehmigt_projekt: { bg: '#2F6FED', text: '#fff', code: 'PL' },
  final_gebucht: { bg: '#1E9E6B', text: '#fff', code: 'FG' },
  krankheit: { bg: '#5B3FA8', text: '#fff', code: 'K' },
};

const WEEKEND_BG = '#EDEFF2';
const PI_SPRINT_COLOR = '#B8E8E0';


// Gruppiert aufeinanderfolgende Tage mit demselben Label zu einer Zelle (colspan),
// fuer die Sprint-Kopfzeile (ein Sprint ist immer schon von Natur aus zusammenhaengend).
function buildSegments(dayInfo, getLabel) {
  const segments = [];
  dayInfo.forEach(di => {
    const label = getLabel(di) || '';
    const last = segments[segments.length - 1];
    if (last && last.label === label) {
      last.colspan++;
    } else {
      segments.push({ label, colspan: 1 });
    }
  });
  return segments;
}

// Fuer die PI-Kopfzeile: eine PI soll durchgehend und nur EINMAL erscheinen, auch wenn
// zwischen zwei Sprints derselben PI eine Luecke liegt (z.B. Wochenende ohne Sprint).
// Ermittelt dazu pro PI den ersten und letzten Tag ihres Vorkommens im Monat und
// behandelt die gesamte Spanne dazwischen als eine zusammenhaengende Zelle.
function buildContinuousSegments(dayInfo, getLabel) {
  const ranges = new Map();
  dayInfo.forEach((di, idx) => {
    const label = getLabel(di);
    if (!label) return;
    if (!ranges.has(label)) ranges.set(label, { first: idx, last: idx });
    else ranges.get(label).last = idx;
  });

  const sortedLabels = [...ranges.entries()].sort((a, b) => a[1].first - b[1].first);
  const segments = [];
  let cursor = 0;
  sortedLabels.forEach(([label, range]) => {
    if (range.first > cursor) {
      segments.push({ label: '', colspan: range.first - cursor });
    }
    segments.push({ label, colspan: range.last - range.first + 1 });
    cursor = range.last + 1;
  });
  if (cursor < dayInfo.length) {
    segments.push({ label: '', colspan: dayInfo.length - cursor });
  }
  return segments;
}

export async function renderTeamCalendar(container, context) {
  const myEmployeeId = context && context.employee && context.employee.id;
  const myEmployeeName = context && context.employee && context.employee.full_name;
  const roles = (context && context.roles) || new Set();
  const permissions = (context && context.permissions) || {};
  const canApprove = !!(permissions.genehmigt && permissions.genehmigt.edit);
  let emailEnabled = true;
  let cursor = new Date();
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);

  container.innerHTML = `
    <header>
      <h1>${t('teamCal.title')}</h1>
      <button type="button" class="btn btn-secondary" id="goto-my-leave-btn" style="margin-top:0.5rem;">${t('teamCal.gotoMyLeave')} →</button>
    </header>
    <div class="card">
      <div class="cal-toolbar">
        <button type="button" class="btn btn-secondary" id="cal-prev">‹</button>
        <h2 id="cal-month-label"></h2>
        <button type="button" class="btn btn-secondary" id="cal-next">›</button>
        <button type="button" class="btn btn-secondary" id="cal-today">${t('teamCal.today')}</button>
        <button type="button" class="btn btn-secondary" id="cal-export-btn" style="margin-left:auto;">📥 ${t('teamCal.export')}</button>
      </div>
      <div class="cal-scroll">
        <table class="cal-table" id="cal-table"></table>
      </div>
      <div class="cal-legend">
        <span><span class="swatch" style="background:${STATUS_COLORS.beantragt.bg};"></span>BE = ${t('myLeave.status.beantragt')}</span>
        <span><span class="swatch" style="background:${STATUS_COLORS.genehmigt_projekt.bg};"></span>PL = ${t('myLeave.status.genehmigt_projekt')}</span>
        <span><span class="swatch" style="background:${STATUS_COLORS.final_gebucht.bg};"></span>FG = ${t('myLeave.status.final_gebucht')}</span>
        <span><span class="swatch" style="background:${STATUS_COLORS.krankheit.bg};"></span>K = ${t('myLeave.sickBadge')}</span>
        <span><span class="swatch" style="background:#E6E0F8;"></span>${t('teamCal.legendHoliday')}</span>
        <span><span class="swatch" style="background:#FBE7EA;"></span>${t('teamCal.legendBlocked')}</span>
        <span><span class="swatch" style="background:${WEEKEND_BG}; border:1px solid var(--border);"></span>${t('teamCal.legendWeekend')}</span>
        <span><span class="swatch" style="background:${PI_SPRINT_COLOR};"></span>${t('teamCal.legendPiSprint')}</span>
      </div>
      ${canApprove ? `<p style="font-size:0.8rem; color:var(--accent); margin-top:0.5rem;">💡 ${t('teamCal.clickToDecide')}: ${t('myLeave.status.beantragt')}</p>` : ''}
      <p style="font-size:0.8rem; color:var(--accent); margin-top:0.25rem;">💡 ${t('teamCal.clickToConfirmFinal')}: ${t('myLeave.status.genehmigt_projekt')} (${t('teamCal.ownRowOnly')})</p>
    </div>
  `;

  document.getElementById('goto-my-leave-btn').addEventListener('click', () => {
    const navBtn = document.querySelector('.nav-item[data-route="my-leave"]');
    if (navBtn) navBtn.click();
  });

  document.getElementById('cal-prev').addEventListener('click', () => { cursor.setMonth(cursor.getMonth() - 1); load(); });
  document.getElementById('cal-next').addEventListener('click', () => { cursor.setMonth(cursor.getMonth() + 1); load(); });
  document.getElementById('cal-today').addEventListener('click', () => { cursor = new Date(); cursor.setDate(1); cursor.setHours(0, 0, 0, 0); load(); });
  document.getElementById('cal-export-btn').addEventListener('click', openExportModal);

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  function holidayText(holiday) {
    if (!holiday) return '';
    const base = holiday.note ? `${holiday.name} - ${holiday.note}` : holiday.name;
    return holiday.day_portion && holiday.day_portion !== 'ganztag'
      ? `${base} (${t('myLeave.dayPortion.' + holiday.day_portion)})`
      : base;
  }

  function blockedText(blocked) {
    if (!blocked) return '';
    return blocked.day_portion && blocked.day_portion !== 'ganztag'
      ? `${blocked.label} (${t('myLeave.dayPortion.' + blocked.day_portion)})`
      : blocked.label;
  }

  async function load() {
    document.getElementById('cal-month-label').textContent = formatMonthYear(cursor);
    const table = document.getElementById('cal-table');
    table.innerHTML = `<tr><td class="empty-state" style="border:none;">${t('common.loading')}</td></tr>`;

    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const monthStartISO = localISO(monthStart);
    const monthEndISO = localISO(monthEnd);
    const daysInMonth = monthEnd.getDate();
    const currentTodayISO = todayISO();

    const [teamsRes, employeesRes, leaveRes, holidaysRes, blockedRes, sprintsRes, pisRes, emailCfgRes] = await Promise.all([
      supabase.from('teams').select('id, name, approver_id').order('name'),
      supabase.from('employees').select('id, full_name, team_id, start_date, end_date')
        .or(`start_date.is.null,start_date.lte.${monthEndISO}`)
        .or(`end_date.is.null,end_date.gte.${monthStartISO}`),
      supabase.from('v_leave_calendar').select('id, employee_id, start_date, end_date, status, day_portion, absence_type').lte('start_date', monthEndISO).gte('end_date', monthStartISO),
      supabase.from('holidays').select('date, name, note, day_portion').gte('date', monthStartISO).lte('date', monthEndISO),
      supabase.from('blocked_periods').select('start_date, end_date, label, day_portion').lte('start_date', monthEndISO).gte('end_date', monthStartISO),
      supabase.from('sprints').select('id, pi_id, sprint_number, name, start_date, end_date').lte('start_date', monthEndISO).gte('end_date', monthStartISO),
      supabase.from('program_increments').select('id, name'),
      supabase.from('app_config').select('value').eq('key', 'email_notifications_enabled').maybeSingle(),
    ]);
    emailEnabled = emailCfgRes.data ? emailCfgRes.data.value !== false : true;

    const teams = teamsRes.data || [];
    const employees = employeesRes.data || [];
    const isAdmin = roles.has('admin');
    const teamApproverMap = new Map(teams.map(tm => [tm.id, tm.approver_id]));
    // Darf ich (nicht Admin) genau DIESEN Mitarbeiter genehmigen? Nur wenn ich fuer sein Team
    // als Approver hinterlegt bin. Admin darf immer.
    function canDecideFor(employeeId) {
      if (isAdmin) return true;
      if (!canApprove) return false;
      const emp = employees.find(e => e.id === employeeId);
      if (!emp) return false;
      return teamApproverMap.get(emp.team_id) === myEmployeeId;
    }
    const leaves = leaveRes.data || [];
    const holidays = holidaysRes.data || [];
    const blocked = blockedRes.data || [];
    const sprints = sprintsRes.data || [];
    const pis = pisRes.data || [];
    const piMap = new Map(pis.map(pi => [pi.id, pi.name]));

    const teamMap = new Map(teams.map(tm => [tm.id, tm.name]));

    // Tages-Infos vorab berechnen (Feiertag / Sperrzeit / Wochenende / PI / Sprint)
    const dayInfo = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      const iso = localISO(dt);
      const holiday = holidays.find(h => h.date === iso);
      const blockedHit = blocked.find(bp => bp.start_date <= iso && bp.end_date >= iso);
      const sprintHit = sprints.find(s => s.start_date <= iso && s.end_date >= iso);
      dayInfo.push({
        date: iso,
        dayNum: d,
        weekday: dt.getDay(),
        isWeekend: dt.getDay() === 0 || dt.getDay() === 6,
        holiday: holiday ? { name: holiday.name, note: holiday.note, day_portion: holiday.day_portion } : null,
        blocked: blockedHit ? { label: blockedHit.label, day_portion: blockedHit.day_portion } : null,
        sprint: sprintHit || null,
      });
    }

    // Urlaubsstatus pro Mitarbeiter und Tag vorberechnen
    const leaveByEmployee = new Map();
    leaves.forEach(lr => {
      if (!leaveByEmployee.has(lr.employee_id)) leaveByEmployee.set(lr.employee_id, []);
      leaveByEmployee.get(lr.employee_id).push(lr);
    });

    function leaveOnDay(employeeId, iso) {
      const list = leaveByEmployee.get(employeeId);
      if (!list) return null;
      return list.find(lr => lr.start_date <= iso && lr.end_date >= iso) || null;
    }

    // Nach Team gruppieren und sortieren
    const sorted = [...employees].sort((a, b) => {
      const teamA = teamMap.get(a.team_id) || '';
      const teamB = teamMap.get(b.team_id) || '';
      if (teamA !== teamB) return teamA.localeCompare(teamB, 'de');
      return a.full_name.localeCompare(b.full_name, 'de');
    });

    const weekdayLetters = { de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] };
    const lang = document.documentElement.lang === 'en' ? 'en' : 'de';
    const wd = weekdayLetters[lang];

    // PI- und Sprint-Kopfzeilen: PI durchgehend und nur einmal pro Vorkommen, Sprint pro tatsaechlichem Sprint
    const piSegments = buildContinuousSegments(dayInfo, di => di.sprint ? (piMap.get(di.sprint.pi_id) || '') : '');
    const sprintSegments = buildSegments(dayInfo, di => di.sprint ? (di.sprint.name || ('Sprint ' + di.sprint.sprint_number)) : '');

    let headHtml = `<thead>
      <tr>
        <th class="cal-name-col" style="border-bottom:none;"></th>
        <th class="cal-team-col" style="border-bottom:none;"></th>
        ${piSegments.map(seg => `<th colspan="${seg.colspan}" style="font-size:0.68rem; color:#0f4a44; font-weight:600; ${seg.label ? `background:${PI_SPRINT_COLOR};` : ''}">${escapeHtml(seg.label)}</th>`).join('')}
      </tr>
      <tr>
        <th class="cal-name-col" style="border-bottom:none; border-top:none;"></th>
        <th class="cal-team-col" style="border-bottom:none; border-top:none;"></th>
        ${sprintSegments.map(seg => `<th colspan="${seg.colspan}" style="font-size:0.65rem; color:#0f4a44; font-weight:500; border-top:none; ${seg.label ? `background:${PI_SPRINT_COLOR};` : ''}">${escapeHtml(seg.label)}</th>`).join('')}
      </tr>
      <tr>
        <th class="cal-name-col">${t('employees.fullName')}</th>
        <th class="cal-team-col">${t('employees.team')}</th>
        ${dayInfo.map(di => `<th class="cal-day-col${di.isWeekend ? ' weekend' : ''}${di.date === currentTodayISO ? ' today' : ''}" title="${di.holiday ? escapeHtml(holidayText(di.holiday)) : ''}${di.blocked ? ' ' + escapeHtml(blockedText(di.blocked)) : ''}">${di.dayNum}<br>${wd[di.weekday]}</th>`).join('')}
      </tr>
    </thead>`;

    let bodyHtml = '<tbody>';
    if (!sorted.length) {
      bodyHtml += `<tr><td colspan="${2 + daysInMonth}" class="empty-state" style="border:none;">${t('common.none')}</td></tr>`;
    } else {
      sorted.forEach(emp => {
        const isMe = emp.id === myEmployeeId;
        bodyHtml += `<tr${isMe ? ' class="cal-my-row"' : ''}>
          <td class="cal-name-col">${escapeHtml(emp.full_name)}${isMe ? ' 👤' : ''}</td>
          <td class="cal-team-col">${escapeHtml(teamMap.get(emp.team_id) || '–')}</td>
          ${dayInfo.map(di => {
            const leave = leaveOnDay(emp.id, di.date);
            const isSick = leave && leave.absence_type === 'krankheit';
            const statusKey = leave ? (isSick ? 'krankheit' : leave.status) : null;
            const portion = leave ? leave.day_portion : 'ganztag';

            // Basis-Hintergrund fuer den nicht durch Urlaub belegten Teil einer Zelle
            // (Sperrzeit/Feiertag/Wochenende), gilt fuer Ganztag genauso wie fuer die freie Haelfte
            let contextBg = '';
            let contextTitle = '';
            if (di.blocked) { contextBg = '#FBE7EA'; contextTitle = blockedText(di.blocked); }
            else if (di.holiday) { contextBg = '#E6E0F8'; contextTitle = holidayText(di.holiday); }
            else if (di.isWeekend) { contextBg = WEEKEND_BG; }

            if (!leave && di.blocked && di.blocked.day_portion !== 'ganztag') {
              const topIsBlocked = di.blocked.day_portion === 'vormittag';
              const blockedStyle = 'background:#FBE7EA;';
              const blockedTitle = blockedText(di.blocked);
              return `<td class="cal-cell cal-cell-split" title="${escapeHtml(blockedTitle)}">
                <div class="cal-cell-half" style="${topIsBlocked ? blockedStyle : ''}"></div>
                <div class="cal-cell-half" style="${!topIsBlocked ? blockedStyle : ''}"></div>
              </td>`;
            }

            if (!leave && di.holiday && di.holiday.day_portion !== 'ganztag') {
              const topIsHoliday = di.holiday.day_portion === 'vormittag';
              const holidayStyle = 'background:#E6E0F8;';
              const holidayTitle = holidayText(di.holiday);
              return `<td class="cal-cell cal-cell-split" title="${escapeHtml(holidayTitle)}">
                <div class="cal-cell-half" style="${topIsHoliday ? holidayStyle : ''}"></div>
                <div class="cal-cell-half" style="${!topIsHoliday ? holidayStyle : ''}"></div>
              </td>`;
            }

            if (statusKey && STATUS_COLORS[statusKey] && portion !== 'ganztag') {
              const meta = STATUS_COLORS[statusKey];
              const statusLabel = isSick ? t('myLeave.sickBadge') : t('myLeave.status.' + statusKey);
              const statusTitle = `${statusLabel} (${t('myLeave.dayPortion.' + portion)})`;
              const topIsStatus = portion === 'vormittag';
              const topStyle = topIsStatus ? `background:${meta.bg};color:${meta.text};` : (contextBg ? `background:${contextBg};` : '');
              const bottomStyle = !topIsStatus ? `background:${meta.bg};color:${meta.text};` : (contextBg ? `background:${contextBg};` : '');
              const topCode = topIsStatus ? meta.code : '';
              const bottomCode = !topIsStatus ? meta.code : '';
              const action = canDecideFor(emp.id) && statusKey === 'beantragt' ? 'decide'
                : (isMe && statusKey === 'genehmigt_projekt' ? 'confirm-final' : '');
              const hint = action === 'decide' ? t('teamCal.clickToDecide') : (action === 'confirm-final' ? t('teamCal.clickToConfirmFinal') : '');
              return `<td class="cal-cell cal-cell-split${action ? ' cal-cell-clickable' : ''}" title="${escapeHtml(statusTitle)}${hint ? ' - ' + escapeHtml(hint) : ''}" ${action ? `data-leave-id="${leave.id}" data-action="${action}"` : ''}>
                <div class="cal-cell-half" style="${topStyle}">${topCode}</div>
                <div class="cal-cell-half" style="${bottomStyle}">${bottomCode}</div>
              </td>`;
            }

            let bg = '';
            let textColor = '';
            let code = '';
            let title = '';
            if (statusKey && STATUS_COLORS[statusKey]) {
              bg = STATUS_COLORS[statusKey].bg;
              textColor = STATUS_COLORS[statusKey].text;
              code = STATUS_COLORS[statusKey].code;
              title = isSick ? t('myLeave.sickBadge') : t('myLeave.status.' + statusKey);
            } else {
              bg = contextBg;
              title = contextTitle;
            }
            const style = `${bg ? `background:${bg};` : ''}${textColor ? `color:${textColor};` : ''}`;
            const action = canDecideFor(emp.id) && statusKey === 'beantragt' ? 'decide'
              : (isMe && statusKey === 'genehmigt_projekt' ? 'confirm-final' : '');
            const hint = action === 'decide' ? t('teamCal.clickToDecide') : (action === 'confirm-final' ? t('teamCal.clickToConfirmFinal') : '');
            const fullTitle = hint ? `${title} - ${hint}` : title;
            return `<td class="cal-cell${action ? ' cal-cell-clickable' : ''}" style="${style}" title="${escapeHtml(fullTitle)}" ${action ? `data-leave-id="${leave.id}" data-action="${action}"` : ''}>${code}</td>`;
          }).join('')}
        </tr>`;
      });
    }
    bodyHtml += '</tbody>';

    table.innerHTML = headHtml + bodyHtml;

    table.querySelectorAll('.cal-cell-clickable').forEach(cell => {
      cell.addEventListener('click', () => {
        if (cell.dataset.action === 'confirm-final') confirmFinalFromCalendar(cell.dataset.leaveId);
        else openDecisionModal(cell.dataset.leaveId);
      });
    });
  }

  async function confirmFinalFromCalendar(leaveId) {
    const { data: r } = await supabase.from('leave_requests').select('id, employees!leave_requests_employee_id_fkey(is_external)').eq('id', leaveId).maybeSingle();
    if (!r) return;
    const isExternalReq = !!r.employees?.is_external;

    const ok = await showConfirmModal({
      title: t('myLeave.confirmFinalModalTitle'),
      message: isExternalReq ? t('myLeave.confirmFinalModalMessageExtern') : t('myLeave.confirmFinalModalMessageIntern'),
      confirmLabel: t('myLeave.confirmFinalModalConfirm'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;

    const { error } = await supabase.from('leave_requests').update({ status: 'final_gebucht' }).eq('id', leaveId);
    if (error) { alert(t('common.error') + '\n' + error.message); return; }
    load();
  }

  async function openDecisionModal(leaveId) {
    const { data: r, error } = await supabase
      .from('leave_requests')
      .select('id, start_date, end_date, day_portion, comment_stufe2, employees!leave_requests_employee_id_fkey(full_name, is_external, email)')
      .eq('id', leaveId)
      .maybeSingle();

    if (error || !r) { alert(t('common.error')); return; }

    const period = r.start_date === r.end_date ? formatDate(r.start_date) : `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`;
    const portion = r.day_portion !== 'ganztag' ? t('myLeave.dayPortion.' + r.day_portion) : t('myLeave.dayPortion.ganztag');

    const bodyHtml = `
      <div class="form-grid">
        <label>${t('approvals.employee')}</label><div>${escapeHtml(r.employees?.full_name || '–')}${r.employees?.is_external ? ' <span class="badge badge-muted">extern</span>' : ''}</div>
        <label>${t('myLeave.period')}</label><div class="mono">${period}</div>
        <label>${t('myLeave.dayPortion')}</label><div>${portion}</div>
      </div>
      <div class="field" style="margin-top:0.75rem;">
        <label>${t('approvals.commentLabel')}</label>
        <textarea id="cal-decision-comment" rows="3" style="width:100%; padding:0.5rem 0.65rem; border:1px solid var(--border); border-radius:6px; font-family:inherit; font-size:0.85rem;"></textarea>
      </div>
      <p id="cal-decision-error" class="error-text" hidden></p>
      <div class="form-actions" style="justify-content:flex-end; gap:0.5rem; margin-top:0.75rem;">
        <button type="button" class="btn btn-success" id="cal-approve-btn">${t('approvals.approve')}</button>
        <button type="button" class="btn btn-danger" id="cal-reject-btn">${t('approvals.reject')}</button>
      </div>
    `;

    const modal = openFormModal({
      title: t('teamCal.decisionTitle'),
      bodyHtml,
      submitLabel: t('common.save'),
      cancelLabel: t('common.cancel'),
    });
    modal.submitBtn.style.display = 'none';

    const commentEl = modal.body.querySelector('#cal-decision-comment');
    const errorEl = modal.body.querySelector('#cal-decision-error');

    modal.body.querySelector('#cal-approve-btn').addEventListener('click', async () => {
      const comment = commentEl.value.trim() || null;
      const { error: updErr } = await supabase.from('leave_requests').update({
        status: 'genehmigt_projekt',
        comment_stufe2: comment,
        approved_by: myEmployeeId,
        approved_at: new Date().toISOString(),
      }).eq('id', leaveId);
      if (updErr) { errorEl.textContent = updErr.message; errorEl.hidden = false; return; }
      if (emailEnabled) await sendDecisionMail({ ...r, comment_stufe2: comment }, myEmployeeName, 'approved');
      modal.close();
      load();
    });

    modal.body.querySelector('#cal-reject-btn').addEventListener('click', async () => {
      const comment = commentEl.value.trim();
      if (!comment) {
        errorEl.textContent = t('approvals.rejectCommentRequired');
        errorEl.hidden = false;
        return;
      }
      const { error: updErr } = await supabase.from('leave_requests').update({
        status: 'abgelehnt',
        comment_stufe2: comment,
        approved_by: myEmployeeId,
      }).eq('id', leaveId);
      if (updErr) { errorEl.textContent = updErr.message; errorEl.hidden = false; return; }
      if (emailEnabled) await sendDecisionMail({ ...r, comment_stufe2: comment }, myEmployeeName, 'rejected');
      modal.close();
      load();
    });
  }

  function openExportModal() {
    const defaultFrom = localISO(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
    const defaultTo = localISO(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
    const bodyHtml = `
      <div class="form-grid">
        <label>${t('teamCal.exportFrom')} – ${t('teamCal.exportTo')}</label>
        <div class="date-range-inline">
          <input type="date" id="export-from" required value="${defaultFrom}">
          <span>–</span>
          <input type="date" id="export-to" required value="${defaultTo}">
        </div>
      </div>
      <p id="export-error" class="error-text" hidden></p>
    `;
    const modal = openFormModal({ title: t('teamCal.export'), bodyHtml, submitLabel: t('teamCal.export'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const errorEl = modal.body.querySelector('#export-error');
      errorEl.hidden = true;
      const from = modal.body.querySelector('#export-from').value;
      const to = modal.body.querySelector('#export-to').value;
      if (!from || !to || from > to) {
        errorEl.textContent = t('myLeave.dateOrderError');
        errorEl.hidden = false;
        return;
      }
      modal.submitBtn.disabled = true;
      await exportToExcel(from, to);
      modal.submitBtn.disabled = false;
      modal.close();
    });
  }

  async function exportToExcel(fromISO, toISO) {
    const [empRes, leaveRes, holRes, blockedRes] = await Promise.all([
      supabase.from('employees').select('id, full_name, team_id, teams(name)').order('full_name'),
      supabase.from('leave_requests').select('employee_id, start_date, end_date, day_portion, status, absence_type')
        .in('status', ['beantragt', 'genehmigt_projekt', 'final_gebucht'])
        .lte('start_date', toISO).gte('end_date', fromISO),
      supabase.from('holidays').select('date, name').gte('date', fromISO).lte('date', toISO),
      supabase.from('blocked_periods').select('start_date, end_date, label').lte('start_date', toISO).gte('end_date', fromISO),
    ]);

    const employees = empRes.data || [];
    const leaves = leaveRes.data || [];
    const holidaysList = holRes.data || [];
    const blockedList = blockedRes.data || [];

    // Alle Tage im gewaehlten Zeitraum als Spalten
    const dates = [];
    let d = new Date(fromISO + 'T00:00:00');
    const end = new Date(toISO + 'T00:00:00');
    while (d <= end) {
      dates.push(localISO(d));
      d.setDate(d.getDate() + 1);
    }

    const wdShort = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const header = [t('teamCal.exportName'), t('teamCal.exportTeam'), ...dates.map(iso => {
      const dt = new Date(iso + 'T00:00:00');
      return `${wdShort[dt.getDay()]} ${formatDate(iso)}`;
    })];

    function cellFor(empId, iso) {
      const leave = leaves.find(lr => lr.employee_id === empId && lr.start_date <= iso && lr.end_date >= iso);
      if (leave) {
        const code = leave.absence_type === 'krankheit' ? 'K' : STATUS_COLORS[leave.status]?.code || leave.status;
        const suffix = leave.day_portion === 'vormittag' ? ' (V)' : leave.day_portion === 'nachmittag' ? ' (N)' : '';
        return code + suffix;
      }
      const holiday = holidaysList.find(h => h.date === iso);
      if (holiday) return 'F';
      const blocked = blockedList.find(bp => bp.start_date <= iso && bp.end_date >= iso);
      if (blocked) return 'S';
      const dow = new Date(iso + 'T00:00:00').getDay();
      if (dow === 0 || dow === 6) return '';
      return '';
    }

    const rows = employees.map(emp => [
      emp.full_name,
      emp.teams ? emp.teams.name : '',
      ...dates.map(iso => cellFor(emp.id, iso)),
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws['!cols'] = [{ wch: 22 }, { wch: 18 }, ...dates.map(() => ({ wch: 8 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('teamCal.title').slice(0, 31));
    XLSX.writeFile(wb, `Team-Kalender_${fromISO}_bis_${toISO}.xlsx`);
  }

  load();
}
