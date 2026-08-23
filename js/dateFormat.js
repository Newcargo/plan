import { getLang } from './i18n.js';

// Wochentag-Kuerzel (2 Buchstaben) pro Sprache, Index = JS getDay() (0 = Sonntag)
const WEEKDAYS = {
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
};

// Formatiert ein ISO-Datum (YYYY-MM-DD, wie es <input type="date"> und Supabase liefern)
// als "Wochentag TT.MM.JJJJ", z.B. "Fr 21.08.2026".
export function formatDate(isoDateString, lang) {
  if (!isoDateString) return '';
  // 'T00:00:00' anhaengen, damit der Tag lokal interpretiert wird statt als UTC-Mitternacht
  // (sonst kann es je nach Zeitzone auf den Vortag verschieben).
  const d = new Date(isoDateString + 'T00:00:00');
  if (isNaN(d.getTime())) return isoDateString;

  const l = lang || getLang();
  const weekdays = WEEKDAYS[l] || WEEKDAYS.de;
  const weekday = weekdays[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  return `${weekday} ${dd}.${mm}.${yyyy}`;
}

// Anzahl Werktage (Mo-Fr) seit einem gegebenen Zeitpunkt bis jetzt.
// Wird fuer die "wartet seit X Werktagen"-Hervorhebung in der Genehmigungs-Ansicht verwendet.
export function businessDaysSince(fromDateString) {
  const from = new Date(fromDateString);
  const now = new Date();
  let count = 0;
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  while (cursor <= today) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

const MONTHS = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export function formatMonthYear(date, lang) {
  const l = lang || getLang();
  const months = MONTHS[l] || MONTHS.de;
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}
