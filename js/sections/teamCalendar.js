import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { formatMonthYear, localISO, todayISO } from '../dateFormat.js';

const STATUS_COLORS = {
  beantragt: { bg: '#E0A400', text: '#000', code: 'BE' },
  genehmigt_projekt: { bg: '#2F6FED', text: '#fff', code: 'PL' },
  final_gebucht: { bg: '#1E9E6B', text: '#fff', code: 'FG' },
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

export async function renderTeamCalendar(container) {
  let cursor = new Date();
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);

  container.innerHTML = `
    <header><h1>${t('teamCal.title')}</h1></header>
    <div class="card">
      <div class="cal-toolbar">
        <button type="button" class="btn btn-secondary" id="cal-prev">‹</button>
        <h2 id="cal-month-label"></h2>
        <button type="button" class="btn btn-secondary" id="cal-next">›</button>
        <button type="button" class="btn btn-secondary" id="cal-today">${t('teamCal.today')}</button>
      </div>
      <div class="cal-scroll">
        <table class="cal-table" id="cal-table"></table>
      </div>
      <div class="cal-legend">
        <span><span class="swatch" style="background:${STATUS_COLORS.beantragt.bg};"></span>BE = ${t('myLeave.status.beantragt')}</span>
        <span><span class="swatch" style="background:${STATUS_COLORS.genehmigt_projekt.bg};"></span>PL = ${t('myLeave.status.genehmigt_projekt')}</span>
        <span><span class="swatch" style="background:${STATUS_COLORS.final_gebucht.bg};"></span>FG = ${t('myLeave.status.final_gebucht')}</span>
        <span><span class="swatch" style="background:#E6E0F8;"></span>${t('teamCal.legendHoliday')}</span>
        <span><span class="swatch" style="background:#FBE7EA;"></span>${t('teamCal.legendBlocked')}</span>
        <span><span class="swatch" style="background:${WEEKEND_BG}; border:1px solid var(--border);"></span>${t('teamCal.legendWeekend')}</span>
        <span><span class="swatch" style="background:${PI_SPRINT_COLOR};"></span>${t('teamCal.legendPiSprint')}</span>
      </div>
    </div>
  `;

  document.getElementById('cal-prev').addEventListener('click', () => { cursor.setMonth(cursor.getMonth() - 1); load(); });
  document.getElementById('cal-next').addEventListener('click', () => { cursor.setMonth(cursor.getMonth() + 1); load(); });
  document.getElementById('cal-today').addEventListener('click', () => { cursor = new Date(); cursor.setDate(1); cursor.setHours(0, 0, 0, 0); load(); });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  function holidayText(holiday) {
    if (!holiday) return '';
    return holiday.note ? `${holiday.name} - ${holiday.note}` : holiday.name;
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

    const [teamsRes, employeesRes, leaveRes, holidaysRes, blockedRes, sprintsRes, pisRes] = await Promise.all([
      supabase.from('teams').select('id, name').order('name'),
      supabase.from('employees').select('id, full_name, team_id').eq('active', true),
      supabase.from('v_leave_calendar').select('employee_id, start_date, end_date, status').lte('start_date', monthEndISO).gte('end_date', monthStartISO),
      supabase.from('holidays').select('date, name, note').gte('date', monthStartISO).lte('date', monthEndISO),
      supabase.from('blocked_periods').select('start_date, end_date, label').lte('start_date', monthEndISO).gte('end_date', monthStartISO),
      supabase.from('sprints').select('id, pi_id, sprint_number, name, start_date, end_date').lte('start_date', monthEndISO).gte('end_date', monthStartISO),
      supabase.from('program_increments').select('id, name'),
    ]);

    const teams = teamsRes.data || [];
    const employees = employeesRes.data || [];
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
        holiday: holiday ? { name: holiday.name, note: holiday.note } : null,
        blocked: blockedHit ? blockedHit.label : null,
        sprint: sprintHit || null,
      });
    }

    // Urlaubsstatus pro Mitarbeiter und Tag vorberechnen
    const leaveByEmployee = new Map();
    leaves.forEach(lr => {
      if (!leaveByEmployee.has(lr.employee_id)) leaveByEmployee.set(lr.employee_id, []);
      leaveByEmployee.get(lr.employee_id).push(lr);
    });

    function statusOnDay(employeeId, iso) {
      const list = leaveByEmployee.get(employeeId);
      if (!list) return null;
      const hit = list.find(lr => lr.start_date <= iso && lr.end_date >= iso);
      return hit ? hit.status : null;
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
        ${dayInfo.map(di => `<th class="cal-day-col${di.isWeekend ? ' weekend' : ''}${di.date === currentTodayISO ? ' today' : ''}" title="${di.holiday ? escapeHtml(holidayText(di.holiday)) : ''}${di.blocked ? ' ' + escapeHtml(di.blocked) : ''}">${di.dayNum}<br>${wd[di.weekday]}</th>`).join('')}
      </tr>
    </thead>`;

    let bodyHtml = '<tbody>';
    if (!sorted.length) {
      bodyHtml += `<tr><td colspan="${2 + daysInMonth}" class="empty-state" style="border:none;">${t('common.none')}</td></tr>`;
    } else {
      sorted.forEach(emp => {
        bodyHtml += `<tr>
          <td class="cal-name-col">${escapeHtml(emp.full_name)}</td>
          <td class="cal-team-col">${escapeHtml(teamMap.get(emp.team_id) || '–')}</td>
          ${dayInfo.map(di => {
            const status = statusOnDay(emp.id, di.date);
            let bg = '';
            let textColor = '';
            let code = '';
            let title = '';
            if (status && STATUS_COLORS[status]) {
              bg = STATUS_COLORS[status].bg;
              textColor = STATUS_COLORS[status].text;
              code = STATUS_COLORS[status].code;
              title = t('myLeave.status.' + status);
            } else if (di.blocked) {
              bg = '#FBE7EA';
              title = di.blocked;
            } else if (di.holiday) {
              bg = '#E6E0F8';
              title = holidayText(di.holiday);
            } else if (di.isWeekend) {
              bg = WEEKEND_BG;
            }
            const style = `${bg ? `background:${bg};` : ''}${textColor ? `color:${textColor};` : ''}`;
            return `<td class="cal-cell" style="${style}" title="${escapeHtml(title)}">${code}</td>`;
          }).join('')}
        </tr>`;
      });
    }
    bodyHtml += '</tbody>';

    table.innerHTML = headHtml + bodyHtml;
  }

  load();
}
