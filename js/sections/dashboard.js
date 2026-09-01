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
      <div class="form-panel-title" style="margin-bottom:0.5rem;">${t('dashboard.piSelect')}</div>
      <select id="dash-pi-select" class="pi-select"></select>
    </div>
    <div id="dash-tiles" class="dash-tiles" style="margin-top:1rem;"></div>
    <div id="dash-content" style="margin-top:1rem;">
      <p class="empty-state">${t('common.loading')}</p>
    </div>
  `;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  const piSelect = document.getElementById('dash-pi-select');
  const tilesEl = document.getElementById('dash-tiles');
  const contentEl = document.getElementById('dash-content');

  let allSprints = [];
  let selectedSprintId = null; // null = "Alle Sprints" der gewaehlten PI

  const { data: pis, error: piErr } = await supabase.from('program_increments').select('id, name').order('created_at', { ascending: false });
  const { data: sprintsRaw } = await supabase.from('sprints').select('id, pi_id, sprint_number, name, start_date, end_date').order('sprint_number');
  allSprints = sprintsRaw || [];

  if (piErr || !pis || !pis.length) {
    piSelect.innerHTML = `<option>${t('common.none')}</option>`;
    contentEl.innerHTML = `<p class="empty-state">${t('dashboard.noSprintsHint')}</p>`;
    return;
  }

  piSelect.innerHTML = pis.map(pi => `<option value="${pi.id}">${escapeHtml(pi.name)}</option>`).join('');

  // Standard-PI: die, die den heutigen Sprint enthaelt, sonst die erste in der Liste
  const today = todayISO();
  const currentSprint = allSprints.find(s => s.start_date <= today && s.end_date >= today);
  piSelect.value = currentSprint ? currentSprint.pi_id : pis[0].id;

  piSelect.addEventListener('change', () => {
    selectedSprintId = null;
    renderTiles();
  });

  function renderTiles() {
    const piSprints = allSprints.filter(s => s.pi_id === piSelect.value).sort((a, b) => a.sprint_number - b.sprint_number);
    if (!selectedSprintId) {
      const cur = piSprints.find(s => s.start_date <= today && s.end_date >= today);
      selectedSprintId = cur ? cur.id : (piSprints[0] ? piSprints[0].id : null);
    }

    tilesEl.innerHTML = `
      ${piSprints.map(s => `
        <button type="button" class="dash-tile ${s.id === selectedSprintId ? 'active' : ''}" data-sprint="${s.id}">
          ${escapeHtml(s.name || ('Sprint ' + s.sprint_number))}
        </button>
      `).join('')}
      <button type="button" class="dash-tile ${selectedSprintId === 'all' ? 'active' : ''}" data-sprint="all">${t('dashboard.allSprints')}</button>
    `;

    tilesEl.querySelectorAll('.dash-tile').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSprintId = btn.dataset.sprint;
        renderTiles();
        if (selectedSprintId === 'all') loadMatrix(piSprints); else loadSingleSprint(selectedSprintId);
      });
    });

    if (selectedSprintId === 'all') loadMatrix(piSprints); else loadSingleSprint(selectedSprintId);
  }

  async function loadSingleSprint(sprintId) {
    contentEl.innerHTML = `<p class="empty-state">${t('common.loading')}</p>`;
    const sprint = allSprints.find(s => s.id === sprintId);

    const [{ data: teams }, { data: snapshots, error: snapErr }, { data: band }, { data: cfg }] = await Promise.all([
      supabase.from('teams').select('id, name').eq('tracks_capacity', true).order('name'),
      supabase
        .from('capacity_snapshots')
        .select('capacity_person_days, working_days, absence_days, employees(team_id)')
        .eq('sprint_id', sprintId),
      supabase.from('confidence_bands').select('lower_pct, upper_pct').eq('sprint_position', sprint ? sprint.sprint_number : -1).maybeSingle(),
      supabase.from('app_config').select('value').eq('key', 'velocity_rolling_window').maybeSingle(),
    ]);

    if (snapErr) { contentEl.innerHTML = `<p class="empty-state">${t('common.error')}</p>`; return; }
    if (!snapshots || !snapshots.length) { contentEl.innerHTML = `<p class="empty-state">${t('dashboard.notCalculatedHint')}</p>`; return; }

    const windowSize = (cfg && cfg.value) ? Number(cfg.value) : 3;
    const teamIdSet = new Set((teams || []).map(tm => tm.id));

    const byTeam = new Map();
    snapshots.forEach(s => {
      const teamId = s.employees?.team_id;
      if (!teamId || !teamIdSet.has(teamId)) return;
      if (!byTeam.has(teamId)) byTeam.set(teamId, { capacity: 0, working: 0, absence: 0, count: 0 });
      const agg = byTeam.get(teamId);
      agg.capacity += Number(s.capacity_person_days);
      agg.working += Number(s.working_days);
      agg.absence += Number(s.absence_days);
      agg.count += 1;
    });

    if (!byTeam.size) { contentEl.innerHTML = `<p class="empty-state">${t('dashboard.notCalculatedHint')}</p>`; return; }

    const teamMap = new Map((teams || []).map(tm => [tm.id, tm.name]));
    const teamIds = [...byTeam.keys()];
    const velocities = await Promise.all(teamIds.map(id => supabase.rpc('get_team_velocity', { target_team_id: id, window_size: windowSize })));
    const velocityByTeam = new Map();
    teamIds.forEach((id, i) => velocityByTeam.set(id, velocities[i].data));

    contentEl.innerHTML = `<div class="grid-cards">${[...byTeam.entries()].map(([teamId, agg]) => {
      const teamName = teamMap.get(teamId) || t('dashboard.noTeam');
      const maxPossible = agg.working * agg.count;
      const pct = maxPossible > 0 ? Math.round((agg.capacity / maxPossible) * 100) : 0;

      const velocity = velocityByTeam.get(teamId);
      let forecastHtml = `<div class="meta" style="color:var(--text-muted);">${t('dashboard.forecastUnavailable')}</div>`;
      if (velocity != null && band) {
        const forecast = Math.round(velocity * agg.capacity * Number(band.lower_pct));
        forecastHtml = `<div class="meta" style="color:var(--accent); font-weight:600;">${t('dashboard.forecast')}: ${forecast} SP</div>`;
      }

      return `
        <div class="team-card">
          <h3>${escapeHtml(teamName)}</h3>
          <div class="capacity-gauge">
            <div class="track"><div class="seg-focus" style="width:${pct}%"></div></div>
            <div class="value">${agg.capacity.toFixed(1)} PT</div>
          </div>
          <div class="meta">${agg.count} ${t('dashboard.people')} \u00b7 ${t('dashboard.absenceDays')}: ${agg.absence.toFixed(1)} PT</div>
          ${forecastHtml}
        </div>
      `;
    }).join('')}</div>`;
  }

  async function loadMatrix(piSprints) {
    contentEl.innerHTML = `<p class="empty-state">${t('common.loading')}</p>`;
    if (!piSprints.length) { contentEl.innerHTML = `<p class="empty-state">${t('common.none')}</p>`; return; }

    const sprintIds = piSprints.map(s => s.id);
    const sprintPositions = [...new Set(piSprints.map(s => s.sprint_number))];
    const [{ data: teams }, { data: snapshots, error: snapErr }, { data: bands }, { data: cfg }] = await Promise.all([
      supabase.from('teams').select('id, name').eq('tracks_capacity', true).order('name'),
      supabase
        .from('capacity_snapshots')
        .select('sprint_id, capacity_person_days, employees(team_id)')
        .in('sprint_id', sprintIds),
      supabase.from('confidence_bands').select('sprint_position, lower_pct').in('sprint_position', sprintPositions),
      supabase.from('app_config').select('value').eq('key', 'velocity_rolling_window').maybeSingle(),
    ]);

    if (snapErr) { contentEl.innerHTML = `<p class="empty-state">${t('common.error')}</p>`; return; }

    const windowSize = (cfg && cfg.value) ? Number(cfg.value) : 3;
    const bandByPosition = new Map((bands || []).map(b => [b.sprint_position, Number(b.lower_pct)]));

    const teamIdSet = new Set((teams || []).map(tm => tm.id));
    // matrix[teamId][sprintId] = capacity
    const matrix = new Map();
    (snapshots || []).forEach(s => {
      const teamId = s.employees?.team_id;
      if (!teamId || !teamIdSet.has(teamId)) return;
      if (!matrix.has(teamId)) matrix.set(teamId, new Map());
      const row = matrix.get(teamId);
      row.set(s.sprint_id, (row.get(s.sprint_id) || 0) + Number(s.capacity_person_days));
    });

    if (!matrix.size) { contentEl.innerHTML = `<p class="empty-state">${t('dashboard.notCalculatedHint')}</p>`; return; }

    const teamMap = new Map((teams || []).map(tm => [tm.id, tm.name]));

    // Velocity ist pro Team gleich (unabhaengig vom Sprint) - einmal pro Team abfragen,
    // dann fuer jeden Sprint mit dessen eigenem Konfidenzband kombinieren.
    const teamIds = [...matrix.keys()];
    const velocities = await Promise.all(teamIds.map(id => supabase.rpc('get_team_velocity', { target_team_id: id, window_size: windowSize })));
    const velocityByTeam = new Map();
    teamIds.forEach((id, i) => velocityByTeam.set(id, velocities[i].data));

    contentEl.innerHTML = `
      <div class="card">
        <table>
          <thead><tr>
            <th>${t('dashboard.team')}</th>
            ${piSprints.map(s => `<th class="num">${escapeHtml(s.name || ('Sprint ' + s.sprint_number))}</th>`).join('')}
            <th class="num">${t('dashboard.total')}</th>
          </tr></thead>
          <tbody>
            ${[...matrix.entries()].map(([teamId, row]) => {
              const velocity = velocityByTeam.get(teamId);
              let totalCapacity = 0;
              let totalForecast = 0;
              let hasForecast = false;
              const cells = piSprints.map(s => {
                const cap = row.get(s.id);
                if (cap === undefined) return `<td class="num mono">\u2013</td>`;
                totalCapacity += cap;

                const band = bandByPosition.get(s.sprint_number);
                let forecastLine = '';
                if (velocity != null && band != null) {
                  const forecast = Math.round(velocity * cap * band);
                  totalForecast += forecast;
                  hasForecast = true;
                  forecastLine = `<div style="color:var(--accent); font-weight:600;">${forecast} SP</div>`;
                }
                return `<td class="num mono">${cap.toFixed(1)} PT${forecastLine}</td>`;
              }).join('');
              const totalForecastLine = hasForecast ? `<div style="color:var(--accent);">${Math.round(totalForecast)} SP</div>` : '';
              return `<tr><td>${escapeHtml(teamMap.get(teamId) || t('dashboard.noTeam'))}</td>${cells}<td class="num mono" style="font-weight:600;">${totalCapacity.toFixed(1)} PT${totalForecastLine}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderTiles();
}
