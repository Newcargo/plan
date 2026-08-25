import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { formatDate, todayISO } from '../dateFormat.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <header>
      <h1>${t('dashboard.title')}</h1>
      <p>${t('dashboard.subtitle')}</p>
    </header>
    <div class="card" style="max-width:420px;">
      <div class="form-panel-title" style="margin-bottom:0.5rem;">${t('dashboard.sprintSelect')}</div>
      <select id="dash-sprint-select"></select>
    </div>
    <div id="dash-cards" class="grid-cards" style="margin-top:1rem;">
      <p class="empty-state">${t('common.loading')}</p>
    </div>
  `;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  const sprintSelect = document.getElementById('dash-sprint-select');
  const cardsEl = document.getElementById('dash-cards');

  const { data: sprints, error: sprintErr } = await supabase
    .from('sprints')
    .select('id, sprint_number, name, start_date, end_date, program_increments(name)')
    .order('start_date', { ascending: false });

  if (sprintErr || !sprints || !sprints.length) {
    sprintSelect.innerHTML = `<option>${t('common.none')}</option>`;
    cardsEl.innerHTML = `<p class="empty-state">${t('dashboard.noSprintsHint')}</p>`;
    return;
  }

  sprintSelect.innerHTML = sprints.map(s => {
    const piName = s.program_increments ? s.program_increments.name : '';
    const label = `${piName} \u00b7 ${s.name || ('Sprint ' + s.sprint_number)} (${formatDate(s.start_date)} \u2013 ${formatDate(s.end_date)})`;
    return `<option value="${s.id}">${escapeHtml(label)}</option>`;
  }).join('');

  // Standardmaessig den Sprint waehlen, der "heute" enthaelt, sonst den zeitlich naechsten
  const today = todayISO();
  const current = sprints.find(s => s.start_date <= today && s.end_date >= today);
  const upcoming = [...sprints].reverse().find(s => s.start_date >= today);
  sprintSelect.value = (current || upcoming || sprints[0]).id;

  sprintSelect.addEventListener('change', loadCapacity);
  loadCapacity();

  async function loadCapacity() {
    cardsEl.innerHTML = `<p class="empty-state">${t('common.loading')}</p>`;
    const sprintId = sprintSelect.value;

    const [{ data: teams }, { data: snapshots, error: snapErr }] = await Promise.all([
      supabase.from('teams').select('id, name').order('name'),
      supabase
        .from('capacity_snapshots')
        .select('capacity_person_days, working_days, absence_days, employees(team_id)')
        .eq('sprint_id', sprintId),
    ]);

    if (snapErr) { cardsEl.innerHTML = `<p class="empty-state">${t('common.error')}</p>`; return; }

    if (!snapshots || !snapshots.length) {
      cardsEl.innerHTML = `<p class="empty-state">${t('dashboard.notCalculatedHint')}</p>`;
      return;
    }

    const byTeam = new Map();
    snapshots.forEach(s => {
      const teamId = s.employees?.team_id || 'none';
      if (!byTeam.has(teamId)) byTeam.set(teamId, { capacity: 0, working: 0, absence: 0, count: 0 });
      const agg = byTeam.get(teamId);
      agg.capacity += Number(s.capacity_person_days);
      agg.working += Number(s.working_days);
      agg.absence += Number(s.absence_days);
      agg.count += 1;
    });

    const teamMap = new Map((teams || []).map(tm => [tm.id, tm.name]));

    cardsEl.innerHTML = [...byTeam.entries()].map(([teamId, agg]) => {
      const teamName = teamMap.get(teamId) || t('dashboard.noTeam');
      const maxPossible = agg.working * agg.count;
      const pct = maxPossible > 0 ? Math.round((agg.capacity / maxPossible) * 100) : 0;

      return `
        <div class="team-card">
          <h3>${escapeHtml(teamName)}</h3>
          <div class="capacity-gauge">
            <div class="track"><div class="seg-focus" style="width:${pct}%"></div></div>
            <div class="value">${agg.capacity.toFixed(1)} PT</div>
          </div>
          <div class="meta">${agg.count} ${t('dashboard.people')} \u00b7 ${t('dashboard.absenceDays')}: ${agg.absence.toFixed(1)} PT</div>
        </div>
      `;
    }).join('');
  }
}
