// Erstellt und oeffnet einen mailto-Link. Gibt true zurueck, wenn mindestens ein
// Empfaenger vorhanden war, sonst false (Aufrufer zeigt dann einen Hinweis).
export function openMailto({ to, cc, subject, body }) {
  const toList = (to || []).filter(Boolean);
  const ccList = (cc || []).filter(Boolean);
  if (!toList.length) return false;

  // WICHTIG: "cc=" nur anhaengen, wenn tatsaechlich eine CC-Adresse vorhanden ist.
  // Ein leeres "cc=" direkt gefolgt von "&subject=..." wird von manchen Mail-Programmen
  // falsch geparst - das nachfolgende "&subject=..." landet dann faelschlich im CC-Feld.
  const params = [];
  if (ccList.length) params.push(`cc=${ccList.join(',')}`);
  params.push(`subject=${encodeURIComponent(subject)}`);
  params.push(`body=${encodeURIComponent(body)}`);

  const mailtoHref = `mailto:${toList.join(',')}?${params.join('&')}`;
  const a = document.createElement('a');
  a.href = mailtoHref;
  a.click();
  return true;
}
