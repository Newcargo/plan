// Zentrale Versionsverwaltung.
// Schema: MAJOR.MINOR.PATCH
//   MAJOR  -> nur auf ausdruecklichen Wunsch von Andrei erhoehen
//   MINOR  -> neue Funktionen
//   PATCH  -> Fehlerbehebungen / kleine Korrekturen
//
// Bei jeder Aenderung: APP_VERSION anpassen UND einen neuen Eintrag oben in CHANGELOG ergaenzen.

export const APP_VERSION = '1.20.4';

export const CHANGELOG = [
  {
    version: '1.20.4',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: eigentliche Ursache für das verschwindende Halbtag-Feld gefunden - "display:contents" (browserabhängig, v. a. Safari hat bekannte Darstellungsprobleme damit bei <select>-Feldern) durch dieselbe robuste hidden-Technik ersetzt, die schon im Rest der App bewährt ist',
      ],
      en: [
        'Bug fix: found the actual root cause of the disappearing half-day field - replaced "display:contents" (browser-dependent, Safari in particular has known rendering issues with it on <select> fields) with the same robust hidden-attribute technique already proven elsewhere in the app',
      ],
    },
  },
  {
    version: '1.20.3',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: Halbtag-Feld verschwand auch beim Setzen des "Bis"-Datums (vorheriger Fix deckte nur die Richtung "Von" ab) - beide Felder ziehen jetzt in beide Richtungen mit, solange nicht beide bewusst unterschiedlich gesetzt wurden',
        '"Erneut beantragen" bei abgelehnten Anträgen zeigt das Halbtag-Feld jetzt korrekt an, falls zutreffend',
      ],
      en: [
        'Bug fix: the half-day selector also disappeared when setting the "To" date (previous fix only covered the "From" direction) - both fields now follow each other in either direction until both have been deliberately set to different values',
        '"Reapply" on rejected requests now correctly shows the half-day field when applicable',
      ],
    },
  },
  {
    version: '1.20.2',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: Halbtag-Auswahl verschwand sofort beim Setzen des "Von"-Datums, weil "Bis" nicht automatisch mitzog - "Bis" springt jetzt automatisch auf "Von", solange es nicht bewusst später gesetzt wurde',
      ],
      en: [
        'Bug fix: the half-day selector disappeared immediately when setting the "From" date because "To" did not follow along - "To" now automatically jumps to "From" unless deliberately set later',
      ],
    },
  },
  {
    version: '1.20.1',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: PI & Sprints wurden nach dem Pop-up-Umbau nicht mehr angezeigt - beim Umbau versehentlich wieder derselbe Fehler wie zuvor eingebaut (getElementById statt Klassen-Selektor für die PI-Umbenennen/-Löschen-Icons)',
        'Alle Dateien systematisch auf denselben Fehlertyp durchsucht, keine weiteren Treffer',
      ],
      en: [
        'Bug fix: PI & Sprints stopped showing after the pop-up rewrite - the same bug as before was accidentally reintroduced (getElementById instead of a class selector for the PI rename/delete icons)',
        'Systematically searched all files for the same bug pattern, no further occurrences found',
      ],
    },
  },
  {
    version: '1.20.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Alle "Hinzufügen/Bearbeiten"-Formulare laufen jetzt über ein Pop-up statt inline auf der Seite (Teams, Mitarbeiter, Feiertage, Sperrzeiten, PI & Sprints, Konfidenzband, Rollen-Login-Erstellung)',
        'Mitarbeiter können jetzt deaktiviert werden (neue "Aktiv"-Checkbox); beim Löschen eines Mitarbeiters mit bestehender Urlaubshistorie wird automatisch "Stattdessen deaktivieren?" angeboten',
        'Benachrichtigungs-Glocke oben rechts mit Zähler-Badge, öffnet eine Liste aller Benachrichtigungen',
        'Neue Seite "Audit-Log" (nur Admin): Protokoll aller Änderungen an Urlaubsanträgen',
        'Passwort selbst ändern: Klick auf den eigenen Namen/Rollen-Block in der Seitenleiste öffnet ein Pop-up dafür',
        'Zähler-Badge bei "Genehmigungen" zeigt die Anzahl offener Anträge direkt in der Navigation',
        'Seitenleiste jetzt gruppiert: Urlaub / Verwaltung / Sonstiges',
        'Mein Urlaub und Team-Kalender gegenseitig verlinkt; die eigene Zeile ist im Team-Kalender optisch hervorgehoben',
        'E-Mail-Adressen von Mitarbeitern müssen jetzt eindeutig sein (Datenbank-Regel)',
      ],
      en: [
        'All "add/edit" forms now open as a pop-up instead of inline on the page (teams, employees, holidays, blocked periods, PI & sprints, confidence band, roles login creation)',
        'Employees can now be deactivated (new "Active" checkbox); deleting an employee with existing leave history now offers "Deactivate instead?" automatically',
        'Notification bell in the top-right corner with a count badge, opens a list of all notifications',
        'New "Audit log" page (admin only): record of all changes to leave requests',
        'Change your own password: click your name/role block in the sidebar to open a dialog for it',
        'Count badge on "Approvals" shows the number of open requests directly in the navigation',
        'Sidebar is now grouped: Leave / Administration / Other',
        'My Leave and Team Calendar are cross-linked; your own row is visually highlighted in the team calendar',
        'Employee email addresses must now be unique (database rule)',
      ],
    },
  },
  {
    version: '1.19.1',
    date: '2026-08-23',
    changes: {
      de: [
        '"Abmelden" in der Seitenleiste jetzt rot-pink eingefärbt, damit er sich von den übrigen Menüpunkten abhebt',
      ],
      en: [
        '"Sign out" in the sidebar is now colored red-pink to stand out from the other nav items',
      ],
    },
  },
  {
    version: '1.19.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Halbtags-Urlaub: bei eintägigen Anträgen (Von = Bis) kann zwischen Ganzer Tag / Vormittag / Nachmittag gewählt werden',
        'Halbtag-Anträge durchlaufen exakt denselben Genehmigungsprozess wie Ganztags-Anträge',
        'Team-Kalender: Halbtag-Einträge werden als zweigeteilte Zelle dargestellt (obere Hälfte = Vormittag, untere Hälfte = Nachmittag), inkl. Status-Kürzel und Tooltip',
        '"Mein Urlaub" und "Genehmigungen" zeigen den gewählten Tagesabschnitt bei eintägigen Anträgen zusätzlich an',
      ],
      en: [
        'Half-day leave: single-day requests (From = To) can now be set to full day / morning / afternoon',
        'Half-day requests go through the exact same approval process as full-day requests',
        'Team calendar: half-day entries render as a split cell (top half = morning, bottom half = afternoon), including status code and tooltip',
        '"My Leave" and "Approvals" now also show the selected day portion for single-day requests',
      ],
    },
  },
  {
    version: '1.18.2',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: Spaltenköpfe bei Rollen & Zugriff waren nicht mehr korrekt über den Daten ausgerichtet, sobald eine Zeile zwei Badges zeigte (z. B. "App-Zugang" + "Gesperrt") - Layout von flexibler auf feste Spaltenbreiten (Grid) umgestellt',
      ],
      en: [
        'Bug fix: column headers under Roles & Access no longer lined up correctly once a row showed two badges (e.g. "App access" + "Blocked") - switched the layout from flexible to fixed-width columns (grid)',
      ],
    },
  },
  {
    version: '1.18.1',
    date: '2026-08-23',
    changes: {
      de: [
        'Rolle "Stufe-2-Genehmiger" / "Level-2 approver" umbenannt in "Projekt Approver" (überall in der App, in beiden Sprachen)',
      ],
      en: [
        'Renamed the "Stufe-2-Genehmiger" / "Level-2 approver" role to "Projekt Approver" (throughout the app, in both languages)',
      ],
    },
  },
  {
    version: '1.18.0',
    date: '2026-08-23',
    changes: {
      de: [
        'App umbenannt von "Urlaub & Kapazität – Admin" zu "Urlaub & Kapazität"',
        'Name und Rollen des angemeldeten Users stehen jetzt oben in der Seitenleiste, direkt unter dem App-Namen',
        '"Abmelden" steht jetzt unterhalb von "Change-Log" in der normalen Navigation',
        'Sprachumschaltung in die obere rechte Ecke verschoben, DE/EN-Text durch Flaggen ersetzt (🇩🇪/🇬🇧)',
        'Sperrzeiten können jetzt auch nachträglich bearbeitet werden (bisher nur Löschen möglich)',
      ],
      en: [
        'App renamed from "Leave & Capacity – Admin" to "Leave & Capacity"',
        'Signed-in user\'s name and roles now sit at the top of the sidebar, right under the app name',
        '"Sign out" now sits below "Change log" in the regular navigation',
        'Language switch moved to the top-right corner, DE/EN text replaced with flags (🇩🇪/🇬🇧)',
        'Blocked periods can now be edited afterward (previously only deletion was possible)',
      ],
    },
  },
  {
    version: '1.17.2',
    date: '2026-08-23',
    changes: {
      de: [
        'Hauptbereich passt sich jetzt dynamisch an die Browserbreite an, statt bei 1100px gedeckelt zu sein (nützt v. a. dem Team-Kalender bei vielen Tages-Spalten)',
        'Formular-Felder bleiben dabei bewusst auf max. 700px begrenzt, damit Eingabefelder auf breiten Bildschirmen nicht unschön in die Breite gezogen werden',
      ],
      en: [
        'Main content area now adapts dynamically to the browser width instead of being capped at 1100px (mainly benefits the team calendar with many day columns)',
        'Form fields are deliberately still capped at max. 700px so input fields don\'t stretch awkwardly wide on large screens',
      ],
    },
  },
  {
    version: '1.17.1',
    date: '2026-08-23',
    changes: {
      de: [
        'Alle Datumsfelder in Formularen (Mein Urlaub, Sperrzeiten, PI & Sprints, Feiertage) zeigen jetzt standardmässig das heutige Datum statt eines leeren Platzhalters',
      ],
      en: [
        'All date fields in forms (My Leave, blocked periods, PI & sprints, holidays) now default to today\'s date instead of an empty placeholder',
      ],
    },
  },
  {
    version: '1.17.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Von-/Bis-Datumsfelder stehen jetzt überall nebeneinander statt untereinander (Mein Urlaub, Sperrzeiten, PI & Sprints) - spart Platz',
        'Mein Urlaub: "Von"-Datum kann nicht mehr in der Vergangenheit gewählt werden - ausser für Admin (zur Korrektur)',
        'Sperrzeiten und PI & Sprints: "Bis"-Feld sperrt jetzt ebenfalls alle Tage vor dem gewählten "Von"-Datum',
      ],
      en: [
        'From/To date fields now sit side by side everywhere instead of stacked (My Leave, blocked periods, PI & sprints) - saves space',
        'My Leave: the "From" date can no longer be in the past - except for admin (for corrections)',
        'Blocked periods and PI & sprints: the "To" field now also blocks all days before the selected "From" date',
      ],
    },
  },
  {
    version: '1.16.3',
    date: '2026-08-23',
    changes: {
      de: [
        'Feiertage: Bearbeiten-Funktion ergänzt (bisher war nur Löschen möglich)',
        'Team-Kalender: Feiertags-Tooltip zeigt jetzt auch die Bemerkung, im Format "Bezeichnung - Bemerkung"',
      ],
      en: [
        'Holidays: added edit capability (previously only deletion was possible)',
        'Team calendar: holiday tooltip now also shows the note, formatted as "Name - Note"',
      ],
    },
  },
  {
    version: '1.16.2',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: Team-Kalender zeigte Sperrzeiten (und andere Datumsvergleiche) um einen Tag verschoben - Zeitzonen-Bug (Schweiz UTC+1/+2) in der Datumsberechnung behoben',
        'Betroffen und korrigiert: Team-Kalender, Feiertage, Sperrzeiten, Mein Urlaub (alle "heute/vergangen"-Vergleiche)',
        'Neue zentrale, zeitzonensichere Hilfsfunktion (localISO/todayISO) statt der fehleranfälligen toISOString()-Methode',
      ],
      en: [
        'Bug fix: team calendar showed blocked periods (and other date comparisons) shifted by one day - fixed a timezone bug (Switzerland UTC+1/+2) in date calculation',
        'Affected and fixed: team calendar, holidays, blocked periods, my leave (all "today/past" comparisons)',
        'New central, timezone-safe helper (localISO/todayISO) replacing the error-prone toISOString() approach',
      ],
    },
  },
  {
    version: '1.16.1',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: Stornierte/vergangene Anträge liessen sich nicht löschen (Fremdschlüssel-Konflikt mit Benachrichtigungen) - Datenbank-Regeln korrigiert',
        'Mein Urlaub: vergangene "Final gebucht"-Einträge werden jetzt grau hinterlegt dargestellt',
        'Mein Urlaub: stornierte Einträge können vom Mitarbeiter selbst im Nachhinein gelöscht werden',
      ],
      en: [
        'Bug fix: cancelled/past requests could not be deleted (foreign key conflict with notifications) - database rules corrected',
        'My Leave: past "final booked" entries are now shown greyed out',
        'My Leave: cancelled entries can now be deleted afterward by the employee themselves',
      ],
    },
  },
  {
    version: '1.16.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Team-Kalender: PI-Kopfzeile ist jetzt durchgehend, PI-Name erscheint nur einmal pro Vorkommen (auch bei Lücken zwischen Sprints derselben PI); zwei PIs im selben Monat erscheinen beide, je nur einmal',
        'Team-Kalender: PI- und Sprint-Zellen jetzt farbig markiert (Teal, bisher ungenutzte Farbe)',
        'Mein Urlaub: vergangene "Final gebucht"-Einträge kann der Mitarbeiter nicht mehr selbst stornieren - nur noch Admin',
        'Genehmigungen: Admin kann jetzt jeden Antrag jederzeit löschen oder stornieren (neue Admin-Aktionen in "Alle Anträge"), unabhängig von Status oder Datum',
      ],
      en: [
        'Team calendar: the PI header row is now continuous, the PI name appears only once per occurrence (even across gaps between sprints of the same PI); two PIs in the same month both appear, each only once',
        'Team calendar: PI and sprint cells are now color-coded (teal, a previously unused color)',
        'My Leave: employees can no longer cancel past "final booked" entries themselves - admin only',
        'Approvals: admin can now delete or cancel any request at any time (new admin actions in "All requests"), regardless of status or date',
      ],
    },
  },
  {
    version: '1.15.0',
    date: '2026-08-23',
    changes: {
      de: [
        '"Final bestätigen" darf jetzt ausschliesslich der Mitarbeiter selbst - manuelle Admin/Stufe-2-Funktion entfernt (auch auf Datenbank-Ebene korrigiert)',
        'Fehlende Berechtigung nachgetragen: Selbstbestätigung durch den Mitarbeiter hatte technisch noch gar keine passende Datenbank-Regel',
        'Neues Bestätigungs-Modal statt Browser-Dialog bei "Final bestätigen" (Text passt sich an intern/extern an) und bei "Stornieren"',
        'Genehmigungen: Zeilen wieder gleich hoch, kein Alignment-Versatz mehr (durch Entfernen der zu grossen Buttons)',
        'Team-Kalender: Wochenend-Spalten jetzt durchgehend eingefärbt, nicht nur im Kopf',
        'Team-Kalender: Status-Zellen zeigen zusätzlich Kürzel (BE/PL/FG)',
        'Team-Kalender: zwei neue Kopfzeilen zeigen PI und Sprint über dem sichtbaren Zeitraum',
      ],
      en: [
        '"Confirm final" is now exclusively the employee\'s own action - removed the manual admin/level-2 function (fixed at the database level too)',
        'Added a missing permission: the employee\'s own self-confirmation technically had no matching database rule yet',
        'New confirmation modal instead of the browser dialog for "Confirm final" (text adapts to internal/external) and for "Cancel"',
        'Approvals: rows are uniform height again, no more alignment offset (fixed by removing the oversized buttons)',
        'Team calendar: weekend columns are now shaded all the way down, not just in the header',
        'Team calendar: status cells now also show a short code (BE/PL/FG)',
        'Team calendar: two new header rows show the PI and sprint above the visible range',
      ],
    },
  },
  {
    version: '1.14.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Neuer Bereich "Team-Kalender" für alle Kollegen: Monatsübersicht, wer wann Urlaub hat (nach Team gruppiert), inkl. Feiertage und Sperrzeiten farbig markiert. Reine Ansicht, keine Einträge möglich',
        'Mein Urlaub: "Bis"-Datum sperrt jetzt automatisch alle Tage vor dem gewählten "Von"-Datum',
        'Genehmigungen: Sperrzeiten-Überschneidung wird jetzt auch dem Genehmiger direkt bei offenen Anträgen angezeigt',
      ],
      en: [
        'New "Team Calendar" area for everyone: monthly overview of who is on leave when (grouped by team), holidays and blocked periods color-coded. View-only, no entries possible',
        'My Leave: the "To" date now automatically blocks all days before the selected "From" date',
        'Approvals: blocked-period overlaps are now also shown directly to the approver on pending requests',
      ],
    },
  },
  {
    version: '1.13.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Urlaubs-Workflow grundlegend vereinfacht (gemeinsam am Whiteboard erarbeitet)',
        'Status "Bei RUAG Office" entfällt komplett - kein Zwischenschritt mehr nötig',
        'People Pool Manager: nur noch reine Leseansicht (alle Anträge, intern + extern), keine eigene Aktion mehr im System',
        'Mailto-Funktion und die zugehörige Einstellung "E-Mail People Pool Manager" entfernt, werden nicht mehr gebraucht',
        'Stornieren jetzt bereits ab "Genehmigt (Projektleitung)" möglich (nicht erst ab "Final gebucht") - sofort, ohne Genehmigung, mit Hinweis auf externe Stornierung (Fiori-SAP/RUAG Office)',
        '"Erneut beantragen"-Button bei abgelehnten Anträgen, übernimmt Start-/Enddatum in ein neues Antragsformular',
        'Harte Überlappungssperre: neue Anträge dürfen sich nicht mit eigenen bestehenden (aktiven) Anträgen überschneiden',
        'Genehmigungs-Ansicht hebt offene Anträge hervor, die 5 Werktage oder länger unbearbeitet sind (Schwellenwert einstellbar)',
        'Admin/Stufe-2-Genehmiger können "Final gebucht" jetzt auch manuell für einen Mitarbeiter setzen',
      ],
      en: [
        'Leave workflow fundamentally simplified (worked out together on a whiteboard)',
        'The "With RUAG Office" status is gone entirely - no more intermediate step',
        'People Pool Manager: now a pure read-only view (all requests, internal + external), no action in the system anymore',
        'Removed the mailto feature and the related "People Pool Manager email" setting, no longer needed',
        'Cancelling is now possible already from "Approved (project lead)" (not only from "Final booked") - immediate, no approval needed, with a hint about cancelling externally too (Fiori-SAP/RUAG Office)',
        '"Reapply" button on rejected requests, carries the start/end dates into a new request form',
        'Hard overlap block: new requests cannot overlap the employee\'s own existing active requests',
        'Approvals view highlights pending requests that have been open 5 business days or longer (threshold configurable)',
        'Admin/level-2 approvers can now also manually set "final booked" for an employee',
      ],
    },
  },
  {
    version: '1.12.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Erzwungener Passwortwechsel: Wer mit einem Admin-vergebenen Passwort (neu oder zurückgesetzt) einloggt, muss vor dem eigentlichen Login zuerst ein eigenes Passwort festlegen',
        'Jobbezeichnungen: neue verwaltbare Liste unter Einstellungen, als Dropdown bei Mitarbeitern auswählbar',
        'Traceability: Beim Genehmigen/Ablehnen wird jetzt korrekt gespeichert, wer entschieden hat ("Bearbeitet von") – war in der Datenbank vorbereitet, wurde aber nie befüllt. Sichtbar in Genehmigungen und in Mein Urlaub',
      ],
      en: [
        'Forced password change: anyone logging in with an admin-assigned password (new or reset) must first set their own password before accessing the app',
        'Job descriptions: new manageable list under settings, selectable as a dropdown on employees',
        'Traceability: approving/rejecting now correctly records who made the decision ("Processed by") – the database column existed but was never populated. Visible in Approvals and My Leave',
      ],
    },
  },
  {
    version: '1.11.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Angemeldeter Name + aktuelle Rolle(n) werden jetzt unten in der Seitenleiste angezeigt, auf jeder Seite sichtbar',
      ],
      en: [
        'Signed-in name + current role(s) are now shown at the bottom of the sidebar, visible on every page',
      ],
    },
  },
  {
    version: '1.10.1',
    date: '2026-08-21',
    changes: {
      de: [
        'Fehlerbehebung: Nicht-Admin-Nutzer sahen alle Navigationspunkte (inkl. Admin-Bereiche) – derselbe CSS-Bug-Typ wie beim allerersten Mal (eigene display-Regel überschrieb das hidden-Attribut), diesmal bei .nav-item statt bei der Login-Seite',
        'Globale CSS-Absicherung ergänzt, die diesen Fehlertyp dauerhaft für alle aktuellen und künftigen Elemente ausschliesst',
        'Fehlerbehebung: Beim Login-Erstellen/Passwort-Reset/E-Mail-Ändern erschien die kryptische Meldung "Edge Function returned a non-2xx status code" statt der eigentlichen Fehlermeldung (z. B. "Nur Admin darf Logins verwalten") – Frontend liest jetzt den echten Fehlertext korrekt aus',
      ],
      en: [
        'Bug fix: non-admin users could see every nav item (including admin areas) – same CSS bug class as the very first one (an element\'s own display rule overrode the hidden attribute), this time on .nav-item instead of the login screen',
        'Added a global CSS safeguard that permanently rules out this bug type for all current and future elements',
        'Bug fix: creating a login / resetting a password / changing an email showed the cryptic "Edge Function returned a non-2xx status code" instead of the actual error (e.g. "Only Admin may manage logins") – the frontend now correctly reads the real error text',
      ],
    },
  },
  {
    version: '1.10.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Neuer Bereich "Genehmigungen" für Stufe-2-Genehmiger, People Pool Manager und Admin',
        'Stufe 2: Anträge genehmigen (mit optionalem Kommentar) oder ablehnen (Kommentar Pflicht)',
        'People Pool Manager: externe, bereits von der Projektleitung genehmigte Anträge als "an RUAG Office gemeldet" markieren',
        'Mitarbeiter-Selbstbestätigung: nach Genehmigung kann intern direkt "Final bestätigen" geklickt werden, extern nach RUAG-Office-Meldung',
        'Externe Kollegen erhalten einen vorausgefüllten Mail-Entwurf an den People Pool Manager (Adresse in Einstellungen konfigurierbar)',
        'Phase 2 von 3 des Urlaubskalenders – Änderungs-/Stornoprozess für bereits final gebuchte Tage folgt als Phase 3',
      ],
      en: [
        'New "Approvals" area for level-2 approvers, the People Pool Manager, and Admin',
        'Level 2: approve requests (optional comment) or reject them (comment required)',
        'People Pool Manager: mark external requests already approved by the project lead as "forwarded to RUAG Office"',
        'Employee self-confirmation: internal staff can confirm "final" directly after approval, external staff after the RUAG Office step',
        'External colleagues get a pre-filled email draft to the People Pool Manager (address configurable in settings)',
        'Phase 2 of 3 for the leave calendar – the change/cancellation process for already final-booked days is Phase 3',
      ],
    },
  },
  {
    version: '1.9.1',
    date: '2026-08-21',
    changes: {
      de: [
        'Fehlerbehebung: Urlaubsantrag stellen scheiterte an einer Fremdschlüssel-Verletzung ("leave_status_history_changed_by_fkey")',
        'Ursache: Der Statusänderungs-Trigger nutzte noch die alte Login-ID (auth.uid()) statt der employees-ID – Datenbank-only-Fix, kein Datei-Update nötig',
      ],
      en: [
        'Bug fix: submitting a leave request failed with a foreign key violation ("leave_status_history_changed_by_fkey")',
        'Cause: the status-change trigger still used the old login ID (auth.uid()) instead of the employees ID – database-only fix, no file update needed',
      ],
    },
  },
  {
    version: '1.9.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Neuer Bereich "Mein Urlaub" für alle Kollegen mit App-Zugang (nicht mehr nur Admin)',
        'Login öffnet sich jetzt für jeden nicht gesperrten Mitarbeiter; Navigation passt sich automatisch an die Rolle an',
        'Urlaubsantrag stellen (Start-/Enddatum), mit Warnhinweis bei Überschneidung mit Sperrzeiten und Info bei enthaltenen Feiertagen',
        'Eigene Anträge mit Status-Badge und Kommentar einsehen; Anträge im Status "Beantragt" selbst zurückziehen',
        'Phase 1 von 2 des Urlaubskalenders – Genehmigungs-Workflow (Stufe 2) folgt als nächstes',
      ],
      en: [
        'New "My Leave" area for every colleague with app access (no longer admin-only)',
        'Login now opens for any non-blocked employee; navigation adapts automatically to the role',
        'Submit a leave request (start/end date), with a warning when overlapping blocked periods and info on included holidays',
        'View own requests with status badge and comment; withdraw requests still in "Requested" status',
        'Phase 1 of 2 for the leave calendar – the approval workflow (level 2) is next',
      ],
    },
  },
  {
    version: '1.8.1',
    date: '2026-08-21',
    changes: {
      de: [
        'Kritische Fehlerbehebung: Ein falsch escapter Apostroph in einem Changelog-Text (js/version.js) verursachte einen JavaScript-Syntaxfehler, der den Start der gesamten App verhinderte',
        'Alle Dateien nochmals als echte ES-Module getestet, um ähnliche Fehler auszuschliessen',
      ],
      en: [
        'Critical bug fix: an incorrectly escaped apostrophe in a changelog text (js/version.js) caused a JavaScript syntax error that prevented the entire app from starting',
        'Re-tested all files as real ES modules to rule out similar issues',
      ],
    },
  },
  {
    version: '1.8.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Angezeigte Daten in allen Listen zeigen jetzt Wochentag + Datum, z. B. "Fr 21.08.2026" (Feiertage, Sperrzeiten, PI & Sprints)',
        'Wochentag-Kürzel passt sich der gewählten Sprache an (DE/EN)',
        'Betrifft nur die Anzeige in Tabellen – Datums-Eingabefelder (Kalender-Picker) folgen weiterhin dem Browser-Format',
      ],
      en: [
        'Displayed dates in all lists now show weekday + date, e.g. "Fr 21.08.2026" (holidays, blocked periods, PI & sprints)',
        'Weekday abbreviation follows the selected language (DE/EN)',
        'Only affects table display – date input fields (calendar pickers) still follow the browser\'s own format',
      ],
    },
  },
  {
    version: '1.7.1',
    date: '2026-08-21',
    changes: {
      de: [
        'Fehlerbehebung: Sprints blieben dauerhaft bei "Lädt..." hängen (PI-Umbenennen/-Löschen-Buttons wurden mit falschem Selektor gesucht, Skript brach vorzeitig ab)',
        'Seitentitel "PI & Sprints" (vorher englisch "Program Increments & Sprints") konsistent mit der Navigation',
      ],
      en: [
        'Bug fix: sprints stayed stuck on "Loading..." forever (PI rename/delete buttons were queried with the wrong selector, causing the script to abort early)',
        'Page title "PI & Sprints" (previously English) now consistent with the navigation label',
      ],
    },
  },
  {
    version: '1.7.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Rollen & Zugriff: neue Übersichtskarte "Was dürfen die Rollen?" mit vollständiger Beschreibung pro Rolle',
        'Admin-Rolle zeigt automatisch "Beinhaltet auch: ..." für die Rollen, die sie mit abdeckt',
        'Rollen-Beschreibungen zentral in js/roleDefinitions.js ausgelagert – eine Änderung dort aktualisiert Tooltip und Übersichtskarte gleichzeitig',
      ],
      en: [
        'Roles & access: new overview card "What can each role do?" with a full description per role',
        'Admin role automatically shows "Also includes: ..." for the roles it covers',
        'Role descriptions centralized in js/roleDefinitions.js – one change there updates both the tooltip and the overview card',
      ],
    },
  },
  {
    version: '1.6.0',
    date: '2026-08-21',
    changes: {
      de: [
        'E-Mail-Adresse nachträglich änderbar: im ausgeklappten Bereich bei Rollen & Zugriff, aktualisiert Login (Supabase Auth) und Stammdaten gleichzeitig',
      ],
      en: [
        'Email address can now be changed later: in the expanded panel under roles & access, updates both the login (Supabase Auth) and the employee record',
      ],
    },
  },
  {
    version: '1.5.0',
    date: '2026-08-21',
    changes: {
      de: [
        'CORS-Fehler beim Login-Erstellen behoben (Edge Function "admin-users" serverseitig korrigiert)',
        'Alphabetische Sortierung (klickbare Spaltenköpfe mit Pfeil) in allen Listen: Teams, Mitarbeiter, Feiertage, Sperrzeiten, PI & Sprints, Rollen & Zugriff',
        'Rollen & Zugriff komplett neu gestaltet: ausklappbare Zeilen statt Checkbox-Raster, E-Mail-Adresse jetzt direkt sichtbar',
      ],
      en: [
        'Fixed CORS error when creating a login (server-side fix in the "admin-users" Edge Function)',
        'Alphabetical sorting (clickable column headers with arrow) added to all lists: teams, employees, holidays, blocked periods, PI & sprints, roles & access',
        'Roles & access redesigned: expandable rows instead of a checkbox grid, email address now visible directly',
      ],
    },
  },
  {
    version: '1.4.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Info-Icons neben Feldern hinzugefügt, die bei Hover/Fokus erklären, was das jeweilige Feld bewirkt',
        'Betrifft: Teams, Mitarbeiter, Feiertage, Sperrzeiten, PI & Sprints, Konfidenzband, Einstellungen, Rollen & Zugriff (inkl. Rollen-Spaltenköpfe)',
        'Wiederverwendbare Komponente (fieldLabel/infoIcon), damit künftige Felder das Muster einfach übernehmen können',
      ],
      en: [
        'Added info icons next to fields that explain what the field does on hover/focus',
        'Applies to: teams, employees, holidays, blocked periods, PI & sprints, confidence band, settings, roles & access (incl. role column headers)',
        'Reusable component (fieldLabel/infoIcon) so future fields can adopt the pattern easily',
      ],
    },
  },
  {
    version: '1.3.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Einheitliches Formular-Design auf allen Seiten: Label links, Feld rechts (zweispaltig)',
        'Betrifft: Teams, Mitarbeiter, Feiertage, Sperrzeiten, PI & Sprints, Konfidenzband, Einstellungen, Rollen & Zugriff',
        'Formulartitel wechselt automatisch zwischen "Hinzufügen" und "Bearbeiten"',
      ],
      en: [
        'Unified form design across all pages: label left, field right (two-column)',
        'Applies to: teams, employees, holidays, blocked periods, PI & sprints, confidence band, settings, roles & access',
        'Form title automatically switches between "Add" and "Edit"',
      ],
    },
  },
  {
    version: '1.2.0',
    date: '2026-08-21',
    changes: {
      de: [
        'Favicon hinzugefügt (im Browser-Tab sichtbar)',
        'Versionierung eingeführt (Haupt.Neben.Fehlerkorrektur)',
        'Change-Log-Ansicht im Admin-Bereich ergänzt',
      ],
      en: [
        'Added favicon (visible in the browser tab)',
        'Introduced versioning (major.minor.patch)',
        'Added change log view in the admin area',
      ],
    },
  },
  {
    version: '1.1.0',
    date: '2026-08-20',
    changes: {
      de: [
        'Bearbeiten-/Löschen-Icons statt Text in allen Tabellen',
        'Feiertage & Sperrzeiten: Sortierung Z-A, vergangene Einträge grau dargestellt',
        'PI- und Sprint-Namen frei editierbar (Sprint-Position bleibt struktureller Schlüssel)',
        'Rollen & Zugriff: Login-Erstellung (E-Mail + Startpasswort) über sichere Edge Function',
        'Rollen & Zugriff: Passwort-Reset für bestehende Accounts',
        'Rollen & Zugriff: Accounts sperren/entsperren ohne Löschen, inkl. Sperr-Meldung beim Login',
      ],
      en: [
        'Edit/delete icons instead of text in all tables',
        'Holidays & blocked periods: sorted Z-A, past entries greyed out',
        'PI and sprint names freely editable (sprint position stays the structural key)',
        'Roles & access: login creation (email + starting password) via secure Edge Function',
        'Roles & access: password reset for existing accounts',
        'Roles & access: block/unblock accounts without deleting, with block message on login',
      ],
    },
  },
  {
    version: '1.0.1',
    date: '2026-08-20',
    changes: {
      de: [
        'Fehlerbehebung: Login-Seite blieb wegen CSS-Konflikt (hidden-Attribut vs. display:flex) sichtbar',
        'Barrierefreiheit: Label-Zuordnung im Login-Formular korrigiert',
      ],
      en: [
        'Bug fix: login page stayed visible due to a CSS conflict (hidden attribute vs. display:flex)',
        'Accessibility: fixed label association in the login form',
      ],
    },
  },
  {
    version: '1.0.0',
    date: '2026-08-20',
    changes: {
      de: [
        'Erste Version des Admin-Bereichs: Teams, Mitarbeiter, Feiertage, Sperrzeiten, PI & Sprints, Konfidenzband, Einstellungen, Rollen & Zugriff',
        'Login mit Admin-Rollen-Prüfung',
        'Datenimport aus Excel: 4 Teams, 18 Mitarbeiter, Feiertage 2026, PI 2026.1 mit 5 Sprints',
      ],
      en: [
        'First version of the admin area: teams, employees, holidays, blocked periods, PI & sprints, confidence band, settings, roles & access',
        'Login with admin role check',
        'Data import from Excel: 4 teams, 18 employees, 2026 holidays, PI 2026.1 with 5 sprints',
      ],
    },
  },
];
