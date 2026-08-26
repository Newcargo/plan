import { supabase } from './supabaseClient.js';
import { t } from './i18n.js';
import { formatDate } from './dateFormat.js';
import { openMailto } from './mailer.js';

export const APP_URL = 'https://newcargo.github.io/plan/';

export function periodText(r) {
  return r.start_date === r.end_date ? formatDate(r.start_date) : `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`;
}

export function portionText(r) {
  return r.day_portion !== 'ganztag' ? t('myLeave.dayPortion.' + r.day_portion) : t('myLeave.dayPortion.ganztag');
}

export function commentLine(r) {
  return t('approvals.mailCommentLine').replaceAll('{comment}', r.comment_stufe2 || '-');
}

export async function getPpmEmails() {
  const { data } = await supabase.rpc('get_notification_recipients');
  return [...new Set((data || []).filter(r => r.role === 'people_pool_manager' && r.email).map(r => r.email))];
}

// Sendet die Entscheidungs-Mail(s) fuer einen Antrag: an den Antragsteller immer,
// bei Genehmigung + extern zusaetzlich an alle People Pool Manager (als CC in derselben Mail).
export async function sendDecisionMail(r, approverName, decision) {
  const employeeEmail = r.employees?.email;
  const employeeName = r.employees?.full_name || '';
  const isExternal = !!r.employees?.is_external;

  if (decision === 'approved') {
    const ppmEmails = isExternal ? await getPpmEmails() : [];

    const subject = t('approvals.mailApprovedSubject');
    const bodyKey = isExternal ? 'approvals.mailApprovedExternBody' : 'approvals.mailApprovedInternBody';
    const body = t(bodyKey)
      .replaceAll('{name}', employeeName)
      .replaceAll('{approver}', approverName)
      .replaceAll('{period}', periodText(r))
      .replaceAll('{portion}', portionText(r))
      .replaceAll('{comment}', commentLine(r))
      .replaceAll('{link}', APP_URL);

    // WICHTIG: EINE Mail mit PPM als CC statt zwei getrennter mailto-Aufrufe -
    // Browser lassen pro Klick meist nur eine mailto-Ausloesung zu, eine zweite
    // unabhaengige wird sonst lautlos verworfen (auch ohne jede Wartezeit dazwischen).
    return openMailto({ to: [employeeEmail], cc: ppmEmails, subject, body });
  }

  // decision === 'rejected'
  const subject = t('approvals.mailRejectedSubject');
  const body = t('approvals.mailRejectedBody')
    .replaceAll('{name}', employeeName)
    .replaceAll('{approver}', approverName)
    .replaceAll('{period}', periodText(r))
    .replaceAll('{portion}', portionText(r))
    .replaceAll('{comment}', commentLine(r))
    .replaceAll('{link}', APP_URL);
  return openMailto({ to: [employeeEmail], subject, body });
}
