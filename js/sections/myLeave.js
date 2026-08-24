import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_DELETE, iconButton, fieldLabel, infoIcon } from '../icons.js';
import { formatDate, todayISO } from '../dateFormat.js';
import { showConfirmModal } from '../modal.js';
import { openMailto } from '../mailer.js';

const STATUS_META = {
  beantragt: { label: 'Beantragt', cls: 'badge-warn' },
  genehmigt_projekt: { label: 'Genehmigt (Projektleitung)', cls: 'badge-info' },
  abgelehnt: { label: 'Abgelehnt', cls: 'badge-danger' },
  final_gebucht: { label: 'Final gebucht', cls: 'badge-success' },
  storniert: { label: 'Storniert', cls: 'badge-muted' },
};

const APP_URL = 'https://newcargo.github.io/plan/';

// Ermittelt alle Projekt Approver (An) und Admins (Cc, ohne Dopplungen) mit hinterlegter E-Mail,
// baut daraus einen mailto-Link und oeffnet ihn. Gibt true zurueck, falls jemand gefunden wurde.
async function notifyApprovers(supabase, t, employeeName, startDate, endDate, dayPortion, isReminder, isExternal, discussedWithTeam) {
  const { data: roleRows, error } = await supabase
    .from('user_roles')
    .select('role, employees!user_roles_user_id_fkey(email)')
    .in('role', ['stufe2_genehmiger', 'admin', 'people_pool_manager']);

  if (error) return false;

  const approverEmails = new Set();
  const adminEmails = new Set();
  const ppmEmails = new Set();
  (roleRows || []).forEach(r => {
    const email = r.employees?.email;
    if (!email) return;
    if (r.role === 'stufe2_genehmiger') approverEmails.add(email);
    if (r.role === 'admin') adminEmails.add(email);
    if (r.role === 'people_pool_manager') ppmEmails.add(email);
  });

  let toEmails = [...approverEmails];
  let ccEmails = [...adminEmails].filter(e => !approverEmails.has(e));
  // Bei externen Mitarbeitern soll der People Pool Manager ebenfalls informiert werden
  // (muss den Antrag spaeter, nach Genehmigung, an RUAG Office weiterleiten)
  if (isExternal) {
    ppmEmails.forEach(e => { if (!approverEmails.has(e) && !ccEmails.includes(e)) ccEmails.push(e); });
  }
  if (toEmails.length === 0 && ccEmails.length > 0) {
    toEmails = ccEmails;
    ccEmails = [];
  }

  const portionText = dayPortion !== 'ganztag' ? t('myLeave.dayPortion.' + dayPortion) : t('myLeave.dayPortion.ganztag');
  const periodText = startDate === endDate ? formatDate(startDate) : `${formatDate(startDate)} – ${formatDate(endDate)}`;
  const discussedText = discussedWithTeam ? t('approvals.discussedYes') : t('approvals.discussedNo');

  // Ueberschneidung mit Sperrzeiten pruefen, damit der Genehmiger das direkt in der Mail sieht
  const { data: blockedHits } = await supabase
    .from('blocked_periods')
    .select('start_date, end_date, label')
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  const blockedWarning = (blockedHits && blockedHits.length)
    ? blockedHits.map(bp => '⚠ ' + t('approvals.blockedWarning')
        .replace('{label}', bp.label)
        .replace('{start}', formatDate(bp.start_date))
        .replace('{end}', formatDate(bp.end_date))).join('\n') + '\n\n'
    : '';

  const subjectKey = isReminder ? 'myLeave.mailReminderSubject' : 'myLeave.mailSubject';
  const bodyKey = isReminder ? 'myLeave.mailReminderBody' : 'myLeave.mailBody';

  const subject = t(subjectKey).replaceAll('{name}', employeeName);
  const body = t(bodyKey)
    .replaceAll('{name}', employeeName)
    .replaceAll('{period}', periodText)
    .replaceAll('{portion}', portionText)
    .replaceAll('{discussed}', discussedText)
    .replaceAll('{blockedWarning}', blockedWarning)
    .replaceAll('{link}', APP_URL);

  return openMailto({ to: toEmails, cc: ccEmails, subject, body });
}

export async function renderMyLeave(container, context) {
  const employee = context && context.employee;
  if (!employee) {
    container.innerHTML = `<p class="empty-state">${t('common.error')}</p>`;
    return;
  }

  let leaveData = [];
  let isExternal = false;

  const { data: empDetail } = await supabase.from('employees').select('is_external').eq('id', employee.id).maybeSingle();
  isExternal = !!(empDetail && empDetail.is_external);

  container.innerHTML = `
    <header>
      <h1>${t('myLeave.title')}</h1>
      <button type="button" class="btn btn-secondary" id="goto-team-cal-btn" style="margin-top:0.5rem;">${t('myLeave.gotoTeamCalendar')} →</button>
    </header>

    <div class="card">
      <div class="form-panel-title">${t('myLeave.legendTitle')}</div>
      <div style="display:flex; flex-wrap:wrap; gap:0.6rem 1.2rem;">
        ${Object.entries(STATUS_META).map(([key, meta]) => `
          <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.85rem; color:var(--text-muted);">
            <span class="badge ${meta.cls}">${t('myLeave.status.' + key)}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <div class="form-panel-title">${t('myLeave.newRequestTitle')}</div>
      <form id="leave-form">
        <div class="form-grid">
          ${fieldLabel(t('myLeave.start') + ' – ' + t('myLeave.end'), 'Erster und letzter Urlaubstag (inklusive). Das Enddatum kann nicht vor dem Startdatum liegen.')}
          <div class="date-range-inline">
            <input type="date" id="f-leave-start" required value="${todayISO()}">
            <span>–</span>
            <input type="date" id="f-leave-end" required value="${todayISO()}">
          </div>

          <label id="portion-label" for="f-portion" class="field-label">${t('myLeave.dayPortion')}${infoIcon('Gilt für jeden Tag im gewählten Zeitraum, z. B. eine ganze Woche lang nur vormittags.')}</label>
          <select id="f-portion" style="max-width:220px;">
            <option value="ganztag">${t('myLeave.dayPortion.ganztag')}</option>
            <option value="vormittag">${t('myLeave.dayPortion.vormittag')}</option>
            <option value="nachmittag">${t('myLeave.dayPortion.nachmittag')}</option>
          </select>
        </div>
        <div id="leave-warnings" style="margin-bottom:0.75rem;"></div>
        <div class="form-actions" style="justify-content:flex-start;">
          <button type="submit" class="btn btn-primary">${t('myLeave.submit')}</button>
        </div>
      </form>
      <p id="leave-msg" class="error-text" hidden></p>
    </div>

    <div class="card">
      <div class="form-panel-title">${t('myLeave.myRequestsTitle')}</div>
      <table>
        <thead><tr>
          <th>${t('myLeave.period')}</th>
          <th>${t('myLeave.statusCol')}</th>
          <th>${t('myLeave.comment')}</th>
          <th>${t('approvals.processedBy')}</th>
          <th></th>
        </tr></thead>
        <tbody id="leave-tbody"><tr><td colspan="5" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  document.getElementById('goto-team-cal-btn').addEventListener('click', () => {
    const navBtn = document.querySelector('.nav-item[data-route="team-calendar"]');
    if (navBtn) navBtn.click();
  });

  const startInput = document.getElementById('f-leave-start');
  const endInput = document.getElementById('f-leave-end');
  const warningsBox = document.getElementById('leave-warnings');
  const portionSelect = document.getElementById('f-portion');

  function updatePortionVisibility() {
    // Halbtag gilt jetzt einheitlich fuer den ganzen gewaehlten Zeitraum (nicht mehr nur eintaegig) -
    // Feld bleibt daher immer waehlbar, unabhaengig von Von/Bis.
  }

  const isAdmin = (context && context.roles && context.roles.has('admin')) || false;
  if (!isAdmin) {
    startInput.min = todayISO();
  }

  async function checkOverlaps() {
    const start = startInput.value;
    const end = endInput.value;
    warningsBox.innerHTML = '';
    if (!start || !end || start > end) return;

    const { data: holidaysHit } = await supabase.from('holidays').select('date, name').gte('date', start).lte('date', end);
    const { data: blockedHit } = await supabase.from('blocked_periods').select('start_date, end_date, label, capacity_impact').lte('start_date', end).gte('end_date', start);

    let html = '';
    if (blockedHit && blockedHit.length) {
      html += blockedHit.map(bp => `
        <p style="font-size:0.85rem; color:var(--danger); margin:0.2rem 0;">⚠ ${t('myLeave.blockedWarning')
          .replace('{label}', escapeHtml(bp.label))
          .replace('{start}', formatDate(bp.start_date))
          .replace('{end}', formatDate(bp.end_date))}</p>
      `).join('');
    }
    if (holidaysHit && holidaysHit.length) {
      html += `<p style="font-size:0.85rem; color:var(--text-muted); margin:0.2rem 0;">ℹ ${t('myLeave.holidayInfo')
        .replace('{count}', holidaysHit.length)
        .replace('{names}', holidaysHit.map(h => `${escapeHtml(h.name)} (${formatDate(h.date)})`).join(', '))}</p>`;
    }
    warningsBox.innerHTML = html;
  }

  let startTouched = false;
  let endTouched = false;

  startInput.addEventListener('change', () => {
    startTouched = true;
    endInput.min = startInput.value;
    if (!endTouched || endInput.value < startInput.value) {
      endInput.value = startInput.value;
    }
    updatePortionVisibility();
    checkOverlaps();
  });
  endInput.addEventListener('change', () => {
    endTouched = true;
    if (!startTouched || startInput.value > endInput.value) {
      startInput.value = endInput.value;
      endInput.min = startInput.value;
    }
    updatePortionVisibility();
    checkOverlaps();
  });
  updatePortionVisibility();

  document.getElementById('leave-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('leave-msg');
    msg.hidden = true;
    msg.style.color = '';

    const start = startInput.value;
    const end = endInput.value;
    if (start > end) {
      msg.textContent = t('myLeave.dateOrderError');
      msg.hidden = false;
      return;
    }

    // Ueberlappungspruefung gegen eigene bestehende (aktive) Antraege - harte Sperre
    const { data: ownActive } = await supabase
      .from('leave_requests')
      .select('start_date, end_date')
      .eq('employee_id', employee.id)
      .not('status', 'in', '(abgelehnt,storniert)')
      .lte('start_date', end)
      .gte('end_date', start);

    if (ownActive && ownActive.length) {
      const conflict = ownActive[0];
      msg.textContent = t('myLeave.overlapError')
        .replace('{start}', formatDate(conflict.start_date))
        .replace('{end}', formatDate(conflict.end_date));
      msg.hidden = false;
      return;
    }

    // Nicht-blockierende Info-Abfrage fuer den Genehmiger, kein Abbruch bei "Nein"
    const discussedWithTeam = await showConfirmModal({
      title: t('myLeave.discussedTitle'),
      message: t('myLeave.discussedMessage'),
      confirmLabel: t('common.yes'),
      cancelLabel: t('common.no'),
    });

    const { error } = await supabase.from('leave_requests').insert({
      employee_id: employee.id,
      start_date: start,
      end_date: end,
      day_portion: portionSelect.value,
      is_external_process: isExternal,
      discussed_with_team: discussedWithTeam,
    });

    if (error) {
      msg.textContent = error.message;
      msg.hidden = false;
      return;
    }

    const mailSent = await notifyApprovers(supabase, t, employee.full_name, start, end, portionSelect.value, false, isExternal, discussedWithTeam);
    if (!mailSent) {
      msg.style.color = 'var(--text-muted)';
      msg.textContent = t('myLeave.noRecipientsHint');
      msg.hidden = false;
    } else {
      msg.hidden = true;
    }

    e.target.reset();
    startInput.value = todayISO();
    endInput.value = todayISO();
    startTouched = false;
    endTouched = false;
    if (!isAdmin) startInput.min = todayISO();
    updatePortionVisibility();
    warningsBox.innerHTML = '';
    load();
  });

  async function load() {
    const tbody = document.getElementById('leave-tbody');
    const { data, error } = await supabase
      .from('leave_requests')
      .select('id, start_date, end_date, status, day_portion, comment_stufe2, is_external_process, discussed_with_team, approver:employees!leave_requests_approved_by_fkey(full_name)')
      .eq('employee_id', employee.id)
      .order('start_date', { ascending: false });

    if (error) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${t('common.error')}</td></tr>`; return; }
    leaveData = data || [];
    renderRows();
  }

  function renderRows() {
    const tbody = document.getElementById('leave-tbody');
    if (!leaveData.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${t('common.none')}</td></tr>`; return; }

    const currentTodayISO = todayISO();

    tbody.innerHTML = leaveData.map(lr => {
      const meta = STATUS_META[lr.status] || { label: lr.status, cls: 'badge-muted' };

      let actions = '';
      if (lr.status === 'beantragt') {
        actions += `<button type="button" class="btn btn-secondary remind-btn">${t('myLeave.sendReminder')}</button>`;
        actions += iconButton(ICON_DELETE, t('myLeave.withdraw'), 'withdraw-btn');
      }
      if (lr.status === 'abgelehnt') {
        actions += `<button type="button" class="btn btn-secondary reapply-btn">${t('myLeave.reapply')}</button>`;
        if (isAdmin) {
          actions += iconButton(ICON_DELETE, t('common.delete'), 'admin-delete-rejected-btn');
        }
      }
      if (lr.status === 'genehmigt_projekt') {
        actions += `<button type="button" class="btn btn-secondary confirm-final-btn">${t('myLeave.confirmFinal')}</button>`;
        actions += `<button type="button" class="btn btn-danger storno-btn">${t('myLeave.storno')}</button>`;
      }
      if (lr.status === 'final_gebucht') {
        const isPast = lr.end_date < currentTodayISO;
        if (!isPast) {
          actions += `<button type="button" class="btn btn-danger storno-btn">${t('myLeave.storno')}</button>`;
        }
      }

      if (lr.status === 'storniert') {
        actions += iconButton(ICON_DELETE, t('common.delete'), 'delete-storniert-btn');
      }

      const isPastFinal = lr.status === 'final_gebucht' && lr.end_date < currentTodayISO;

      const portionSuffix = lr.day_portion !== 'ganztag' ? ` (${t('myLeave.dayPortion.' + lr.day_portion)})` : '';

      return `
        <tr data-id="${lr.id}" data-start="${lr.start_date}" data-end="${lr.end_date}" class="${isPastFinal ? 'row-past' : ''}">
          <td class="mono">${formatDate(lr.start_date)} – ${formatDate(lr.end_date)}${portionSuffix}</td>
          <td><span class="badge ${meta.cls}">${t('myLeave.status.' + lr.status) || meta.label}</span></td>
          <td>${escapeHtml(lr.comment_stufe2 || '')}</td>
          <td>${escapeHtml(lr.approver?.full_name || '–')}</td>
          <td class="row-actions">${actions}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.remind-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        const lr = leaveData.find(x => x.id === row.dataset.id);
        const sent = await notifyApprovers(supabase, t, employee.full_name, lr.start_date, lr.end_date, lr.day_portion, true, lr.is_external_process, lr.discussed_with_team);
        if (!sent) alert(t('myLeave.noRecipientsHint'));
      });
    });

    tbody.querySelectorAll('.delete-storniert-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('myLeave.deleteStornoConfirm'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('leave_requests').delete().eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        load();
      });
    });

    tbody.querySelectorAll('.admin-delete-rejected-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('leave_requests').delete().eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        load();
      });
    });

    tbody.querySelectorAll('.withdraw-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('myLeave.withdrawConfirm'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('leave_requests').delete().eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        load();
      });
    });

    tbody.querySelectorAll('.confirm-final-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await showConfirmModal({
          title: t('myLeave.confirmFinalModalTitle'),
          message: isExternal ? t('myLeave.confirmFinalModalMessageExtern') : t('myLeave.confirmFinalModalMessageIntern'),
          confirmLabel: t('myLeave.confirmFinalModalConfirm'),
          cancelLabel: t('common.cancel'),
        });
        if (!ok) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('leave_requests').update({ status: 'final_gebucht' }).eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        load();
      });
    });

    tbody.querySelectorAll('.storno-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await showConfirmModal({
          title: t('myLeave.storno'),
          message: t('myLeave.stornoConfirm'),
          confirmLabel: t('myLeave.storno'),
          cancelLabel: t('common.cancel'),
        });
        if (!ok) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('leave_requests').update({ status: 'storniert' }).eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        load();
      });
    });

    tbody.querySelectorAll('.reapply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        startInput.value = row.dataset.start;
        endInput.value = row.dataset.end;
        startTouched = true;
        endTouched = true;
        updatePortionVisibility();
        checkOverlaps();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  load();
}
