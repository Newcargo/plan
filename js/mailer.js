// Erstellt und oeffnet einen mailto-Link. Gibt true zurueck, wenn mindestens ein
// Empfaenger vorhanden war, sonst false (Aufrufer zeigt dann einen Hinweis).
export function openMailto({ to, cc, subject, body }) {
  const toList = (to || []).filter(Boolean);
  const ccList = (cc || []).filter(Boolean);
  if (!toList.length) return false;

  const mailtoHref = `mailto:${toList.join(',')}?cc=${ccList.join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const a = document.createElement('a');
  a.href = mailtoHref;
  a.click();
  return true;
}
