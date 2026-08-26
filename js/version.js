// Zentrale Versionsverwaltung.
// Schema: MAJOR.MINOR.PATCH
//   MAJOR  -> nur auf ausdruecklichen Wunsch von Andrei erhoehen
//   MINOR  -> neue Funktionen
//   PATCH  -> Fehlerbehebungen / kleine Korrekturen
//
// Bei jeder Aenderung: APP_VERSION anpassen UND einen neuen Eintrag oben in CHANGELOG ergaenzen.

export const APP_VERSION = '2.2.0';

export const CHANGELOG = [
  {
    version: '2.2.0',
    date: '2026-08-25',
    changes: {
      de: [
        'Genehmigungen: neue Spalte "Art" in der Antrags-Historie unterscheidet Urlaub von Krankheit',
        '"Team nicht informiert"-Badge erscheint nicht mehr bei Krankheitseinträgen (die Frage macht dort keinen Sinn)',
        'Team-Kalender: eigene genehmigte (noch nicht final gebuchte) Anträge lassen sich jetzt direkt per Klick "Final bestätigen" - ohne Umweg über "Mein Urlaub"',
        'Team-Kalender: Genehmigen/Ablehnen und Final-Bestätigen respektieren jetzt den "E-Mail-Benachrichtigungen"-Schalter aus den Einstellungen',
      ],
      en: [
        'Approvals: new "Type" column in the request history distinguishes leave from sick leave',
        'The "Team not informed" badge no longer appears on sick-leave entries (the question doesn\'t apply there)',
        'Team calendar: your own approved (not yet final-booked) requests can now be confirmed as final with a single click - no detour via "My Leave" needed',
        'Team calendar: approve/reject and final-confirm now respect the "Email notifications" toggle in Settings',
      ],
    },
  },
  {
    version: '2.1.0',
    date: '2026-08-25',
    changes: {
      de: [
        'Feiertage & Sperrzeiten: aktuelles Jahr startet jetzt aufgeklappt, alle anderen Jahre bleiben zugeklappt',
        '"Krankheit melden"-Button hat jetzt dieselbe Farbe wie das "K" im Team-Kalender',
        'Neu: Genehmigen/Ablehnen direkt aus dem Team-Kalender - Klick auf einen "Beantragt"-Eintrag (nur für Projekt Approver/Admin) öffnet ein Pop-up mit Mitarbeiter, Zeitraum, Kommentarfeld und Genehmigen/Ablehnen/Abbrechen',
        'Genehmigen-Buttons überall grün eingefärbt (Genehmigungen, Team-Kalender, "Final bestätigen" in Mein Urlaub)',
        'PI-Auswahl auf der Übersicht optisch aufgewertet (grösser, farblich hervorgehoben)',
        '"Berechnen"- und "Story Points"-Buttons in PI & Sprints eingefärbt',
        'Hilfe-Seite um den neuen Kalender-Genehmigungsweg ergänzt',
      ],
      en: [
        'Holidays & blocked periods: the current year now starts expanded, all other years stay collapsed',
        '"Report sick leave" button now matches the color of the "K" marker in the team calendar',
        'New: approve/reject directly from the team calendar - clicking a "Submitted" entry (project approvers/admin only) opens a pop-up with employee, period, comment field, and approve/reject/cancel',
        'Approve buttons colored green throughout (Approvals, team calendar, "Confirm final" in My Leave)',
        'PI selector on the Overview visually upgraded (larger, color-highlighted)',
        '"Calculate" and "Story Points" buttons in PI & Sprints now colored',
        'Help page updated with the new calendar-based approval path',
      ],
    },
  },
  {
    version: '2.0.0',
    date: '2026-08-25',
    changes: {
      de: [
        'Icons vor allen Menüpunkten in der Seitenleiste',
        'Eigener Name in der Seitenleiste jetzt heller/fetter hervorgehoben',
        'Versionsnummer steht jetzt direkt unter dem Titel statt ganz unten',
        'Neue Seite "Hilfe" mit rollenbasierter Kurzanleitung (jeder sieht nur, was zu seinen Rollen passt)',
        'Übersicht komplett umgebaut: PI-Auswahl statt Sprint-Dropdown, darunter Sprint-Kacheln zum Anklicken, zusätzlich "Alle Sprints"-Ansicht als Team-×-Sprint-Tabelle',
        'Teams: neues Flag "Story-Point-Planung" - deaktivierte Teams (z. B. Leadership) erscheinen nicht mehr in Übersicht und Story-Points-Erfassung, werden auch von der Kapazitätsberechnung ausgenommen',
        'Neu: Krankheitstage - eigene Karte in "Mein Urlaub", läuft komplett ohne Genehmigung, sofort final erfasst, erscheint im Team-Kalender mit "K" in eigener Farbe, fliesst automatisch in die Kapazitätsberechnung ein',
        'Datenbank-Regel geschärft: Urlaub muss weiterhin bei "Beantragt" starten, nur Krankheit darf direkt final erfasst werden (schliesst nebenbei eine bisher offene Lücke)',
      ],
      en: [
        'Icons in front of every sidebar menu item',
        'Own name in the sidebar now highlighted brighter/bolder',
        'Version number now sits directly under the title instead of at the very bottom',
        'New "Help" page with a role-based quick guide (everyone only sees what matches their roles)',
        'Overview completely rebuilt: PI selector instead of a sprint dropdown, sprint tiles underneath to click through, plus an "All Sprints" view as a team × sprint table',
        'Teams: new "Story point planning" flag - disabled teams (e.g. Leadership) no longer appear in the overview or story-points entry, and are excluded from capacity calculation too',
        'New: sick leave - its own card in "My Leave", runs entirely without approval, entered as final immediately, appears in the team calendar as "K" in its own color, automatically factored into capacity calculation',
        'Tightened database rule: leave must still start as "Submitted", only sick leave may be entered directly as final (closes a previously open gap along the way)',
      ],
    },
  },
  {
    version: '1.36.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Sicherheit: Rollen-Vergabe/-Entzug sowie Sperren/Entsperren, Aktivieren/Deaktivieren und Löschen von Mitarbeitern werden jetzt im Audit-Log protokolliert (bisher nur Urlaubsanträge)',
        'Sicherheit: Der letzte aktive Admin kann nicht mehr entfernt, gesperrt oder deaktiviert werden - auf Datenbank-Ebene erzwungen, nicht nur im Frontend versteckt',
        'Rollen & Zugriff: eigene Admin-Rolle und eigenes "Gesperrt"-Häkchen sind für die eigene Zeile jetzt ausgegraut, mit erklärendem Hinweis',
      ],
      en: [
        'Security: role grants/revokes as well as blocking/unblocking, activating/deactivating, and deleting employees are now recorded in the audit log (previously only leave requests)',
        'Security: the last active admin can no longer be removed, blocked, or deactivated - enforced at the database level, not just hidden in the UI',
        'Roles & Access: your own admin role and your own "Blocked" checkbox are now greyed out on your own row, with an explanatory tooltip',
      ],
    },
  },
  {
    version: '1.35.0',
    date: '2026-08-23',
    changes: {
      de: [
        'PI & Sprints: Abschliessen-Häkchen berechnet die Kapazität jetzt automatisch neu (in beide Richtungen, jederzeit reversibel - keine echte Sperre, nur eine Auffrischung der Zahlen)',
        'Seitenleiste: die bisher neun flachen Punkte unter "Verwaltung" sind jetzt in drei kleinere Gruppen aufgeteilt - Stammdaten, Kapazität & Sprints, System',
      ],
      en: [
        'PI & Sprints: the "Closed" checkbox now automatically recalculates capacity (in either direction, always reversible - not a real lock, just a refresh of the numbers)',
        'Sidebar: the previous nine flat items under "Administration" are now split into three smaller groups - Master Data, Capacity & Sprints, System',
      ],
    },
  },
  {
    version: '1.34.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Kapazitäts-Engine (Teil 5, letzter Baustein): "Übersicht" zeigt jetzt pro Team zusätzlich zur Kapazität auch die SP-Prognose (Von-Bis) für den gewählten Sprint direkt auf einen Blick, ohne extra Klicks',
        'Damit ist die ursprünglich geplante Kapazitäts-/Story-Points-Funktionalität komplett: Kapazität berechnen → Story Points erfassen → Prognose anzeigen',
      ],
      en: [
        'Capacity engine (part 5, final piece): "Overview" now also shows the SP forecast (range) per team for the selected sprint directly at a glance, no extra clicks needed',
        'This completes the originally planned capacity/story points functionality: calculate capacity → record story points → show forecast',
      ],
    },
  },
  {
    version: '1.33.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Kapazitäts-Engine (Teil 4): "Story Points"-Pop-up zeigt jetzt pro Team einen empfohlenen Von-Bis-Bereich, basierend auf historischer Team-Velocity (Ø SP/PT der letzten Sprints), der berechneten Sprint-Kapazität und dem passenden Konfidenzband',
        'Neue Datenbank-Funktion "get_team_velocity" berechnet die durchschnittliche Velocity der letzten N abgeschlossenen Sprints eines Teams',
        'Hinweis statt erfundener Zahl, falls für ein Team noch keine ausreichende Historie vorliegt',
      ],
      en: [
        'Capacity engine (part 4): the "Story Points" pop-up now shows a recommended range per team, based on historical team velocity (avg. SP/PT of recent sprints), the calculated sprint capacity, and the matching confidence band',
        'New database function "get_team_velocity" calculates the average velocity of a team\'s last N completed sprints',
        'Shows a hint instead of a made-up number if a team does not yet have enough history',
      ],
    },
  },
  {
    version: '1.32.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Kapazitäts-Engine (Teil 3): "PI & Sprints" hat jetzt einen "Story Points"-Button pro Sprint, öffnet ein Pop-up mit geplanten/erreichten SP pro Team',
        'Kapazität pro Team (aus der zuletzt berechneten Sprint-Kapazität) wird dabei automatisch übernommen, kein manuelles Eintragen nötig',
        'SP pro Personentag (Velocity) wird automatisch berechnet, sobald geplante/erreichte Werte gespeichert werden',
      ],
      en: [
        'Capacity engine (part 3): "PI & Sprints" now has a "Story Points" button per sprint, opens a pop-up with planned/completed SP per team',
        'Capacity per team (from the most recently calculated sprint capacity) is picked up automatically, no manual entry needed',
        'SP per person-day (velocity) is calculated automatically once planned/completed values are saved',
      ],
    },
  },
  {
    version: '1.31.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Kapazitäts-Engine (Teil 2): "Übersicht" zeigt jetzt die echte, berechnete Kapazität pro Team für einen wählbaren Sprint (statt nur einem groben Durchschnittswert)',
        'Sprint-Auswahl springt standardmässig auf den aktuell laufenden bzw. nächsten Sprint',
        'Zeigt pro Team: Personenzahl, Kapazität in Personentagen, Abwesenheit durch Urlaub',
        'Hinweis, falls für den gewählten Sprint noch keine Kapazität berechnet wurde',
      ],
      en: [
        'Capacity engine (part 2): "Overview" now shows real, calculated capacity per team for a selectable sprint (instead of just a rough average)',
        'Sprint selector defaults to the currently running or next upcoming sprint',
        'Shows per team: headcount, capacity in person-days, absence due to leave',
        'Hint shown if capacity has not been calculated yet for the selected sprint',
      ],
    },
  },
  {
    version: '1.30.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Kapazitäts-Engine (Teil 1): Neue Datenbank-Funktion berechnet die Kapazität in Personentagen pro Sprint und Mitarbeiter - berücksichtigt Werktage, Feiertage, Beschäftigungsgrad, Reduktionsfaktor und erstmals auch final gebuchten Urlaub (Halbtage zählen 0.5)',
        '"PI & Sprints": neue Kapazitäts-Spalte mit "Berechnen"-Button pro Sprint',
      ],
      en: [
        'Capacity engine (part 1): new database function calculates capacity in person-days per sprint and employee - accounts for working days, holidays, employment percentage, reduction factor, and now also final-booked leave (half-days count as 0.5)',
        '"PI & Sprints": new capacity column with a "Calculate" button per sprint',
      ],
    },
  },
  {
    version: '1.29.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Neue Einstellung "E-Mail-Benachrichtigungen": schaltet alle automatischen Mails (Beantragen, Genehmigen, Ablehnen) sowie die zugehörigen Buttons ("Erinnerung senden", "Mail erneut senden") global ein oder aus',
        'Standard: aktiviert, damit sich am bisherigen Verhalten nichts ändert, bis bewusst deaktiviert wird',
      ],
      en: [
        'New "Email notifications" setting: globally turns all automatic emails (submission, approval, rejection) and their related buttons ("Send reminder", "Resend email") on or off',
        'Default: enabled, so existing behavior stays unchanged until deliberately turned off',
      ],
    },
  },
  {
    version: '1.28.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung (wichtig): PPM-Weiterleitungs-Mail bei genehmigten externen Anträgen öffnete sich weiterhin nicht - Browser lassen offenbar pro Klick nur eine mailto-Auslösung zu, unabhängig vom Timing. Statt zwei getrennter Mails wird jetzt eine einzige Mail an den Mitarbeiter (An) mit dem PPM in CC verschickt, mit beiden Hinweisen im selben Text (entspricht dem ursprünglichen Whiteboard-Design)',
      ],
      en: [
        'Bug fix (important): the PPM forwarding email for approved external requests still did not open - browsers apparently only allow one mailto trigger per click, regardless of timing. Instead of two separate emails, a single email now goes to the employee (To) with the PPM in Cc, with both notes in the same text (matches the original whiteboard design)',
      ],
    },
  },
  {
    version: '1.27.4',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung (wichtig): PPM-Weiterleitungs-Mail bei genehmigten externen Anträgen öffnete sich weiterhin nicht - diesmal lag ein "await" (Datenbankabfrage) zwischen den beiden mailto-Aufrufen, was denselben Blockier-Effekt wie das frühere setTimeout hatte. Alle Abfragen laufen jetzt VOR dem ersten Mail-Aufruf, danach feuern beide Mails ohne Verzögerung dazwischen',
      ],
      en: [
        'Bug fix (important): the PPM forwarding email for approved external requests still did not open - this time an "await" (database query) sat between the two mailto calls, causing the same blocking effect as the earlier setTimeout. All lookups now run BEFORE the first email call, after which both emails fire with no gap in between',
      ],
    },
  },
  {
    version: '1.27.3',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung (wichtig): Normale Mitarbeitende und Projekt Approver (nicht-Admin) konnten die E-Mail-Adressen der Genehmiger/Admin/PPM nicht abfragen (Berechtigungs-Einschränkung), wodurch "Kein Empfänger gefunden" erschien und Genehmigungs- sowie PPM-Weiterleitungs-Mails ausblieben',
        'Neue, eng begrenzte Datenbank-Funktion erlaubt nur diese eine sichere Abfrage, ohne die generelle Einschränkung auf Rollen-Daten aufzuweichen',
      ],
      en: [
        'Bug fix (important): regular employees and project approvers (non-admin) could not look up the email addresses of approvers/admin/PPM (permission restriction), causing "no recipients found" and preventing approval and PPM-forwarding emails from being sent',
        'New, narrowly scoped database function allows only this one safe lookup, without loosening the general restriction on role data',
      ],
    },
  },
  {
    version: '1.27.2',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung (wichtig): Bei Genehmigung eines externen Antrags öffnete sich die PPM-Mail nicht - ein bewusst eingebautes setTimeout hat den zweiten mailto-Aufruf ausserhalb des direkten Klick-Kontexts ausgelöst, was Browser oft lautlos blockieren. Beide Mails feuern jetzt synchron im selben Klick',
      ],
      en: [
        'Bug fix (important): the PPM email did not open when approving an external request - a deliberately added setTimeout triggered the second mailto call outside the direct click context, which browsers often block silently. Both emails now fire synchronously within the same click',
      ],
    },
  },
  {
    version: '1.27.1',
    date: '2026-08-23',
    changes: {
      de: [
        'Admin kann eigene abgelehnte Anträge jetzt auch direkt in "Mein Urlaub" löschen (bisher nur in "Genehmigungen" möglich)',
      ],
      en: [
        'Admin can now also delete their own rejected requests directly in "My Leave" (previously only possible in "Approvals")',
      ],
    },
  },
  {
    version: '1.27.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung (wichtig): Bei fehlender CC-Adresse (z.B. Ablehnungs-Mail) landete der Betreff fälschlich im CC-Feld statt im Betreff - lag an einem leeren "cc="-Parameter, den manche Mail-Programme falsch interpretieren. cc= wird jetzt nur noch angehängt, wenn wirklich eine Adresse vorhanden ist',
        'Beantragungs-Mail (und Erinnerung) zeigt jetzt auch an, ob mit dem Team abgesprochen wurde',
        'Neu: Bei externen Kollegen wird der People Pool Manager jetzt auch schon beim Beantragen (nicht nur bei Genehmigung) per Mail informiert',
      ],
      en: [
        'Bug fix (important): when there was no CC address (e.g. rejection email), the subject incorrectly ended up in the CC field instead of the subject line - caused by an empty "cc=" parameter that some mail clients misparse. cc= is now only appended when an address is actually present',
        'Submission email (and reminder) now also shows whether the team was consulted',
        'New: for external colleagues, the People Pool Manager is now also notified by email at submission time (not just on approval)',
      ],
    },
  },
  {
    version: '1.26.2',
    date: '2026-08-23',
    changes: {
      de: [
        'Beantragungs-Mail (und Erinnerung) zeigt jetzt eine Warnung, falls sich der Zeitraum mit einer Sperrzeit überschneidet - direkt sichtbar für den Genehmiger, ohne die App öffnen zu müssen',
      ],
      en: [
        'The submission email (and reminder) now shows a warning if the period overlaps a blocked period - directly visible to the approver without opening the app',
      ],
    },
  },
  {
    version: '1.26.1',
    date: '2026-08-23',
    changes: {
      de: [
        'App-Link in allen Mails korrigiert auf https://newcargo.github.io/plan/',
        'Kommentar-Zeile erscheint jetzt immer in den Genehmigt/Abgelehnt-Mails, auch ohne Kommentar (dann mit "-")',
      ],
      en: [
        'Fixed the app link in all emails to https://newcargo.github.io/plan/',
        'The comment line now always appears in the approved/rejected emails, even without a comment (shown as "-")',
      ],
    },
  },
  {
    version: '1.26.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Genehmigt/Abgelehnt-Benachrichtigung: Beim Genehmigen oder Ablehnen eines Antrags öffnet sich automatisch eine vorausgefüllte Mail an den Antragsteller',
        'Bei genehmigten Anträgen externer Kollegen geht zusätzlich eine separate Mail an alle People Pool Manager (Weiterleitung an RUAG Office)',
        'Mail-Texte unterscheiden intern/extern und weisen deutlich (GROSSBUCHSTABEN + Sternchen) darauf hin, welche Schritte der Mitarbeiter noch SELBST erledigen muss',
        '"Mail erneut senden"-Button bei bereits entschiedenen Anträgen in Genehmigungen',
        'Neue Abfrage vor dem Beantragen: "Mit dem Team abgesprochen?" (Ja/Nein, blockiert nichts), Antwort wird dem Genehmiger als Badge angezeigt',
      ],
      en: [
        'Approved/rejected notification: approving or rejecting a request automatically opens a pre-filled email to the requester',
        'For approved requests from external colleagues, a separate email additionally goes to all People Pool Managers (forwarding to RUAG Office)',
        'Email texts differ between internal/external and clearly flag (CAPS + asterisks) which steps the employee still needs to do THEMSELVES',
        '"Resend email" button on already-decided requests in Approvals',
        'New prompt before submitting a request: "Discussed with the team?" (Yes/No, does not block), the answer is shown to the approver as a badge',
      ],
    },
  },
  {
    version: '1.25.1',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: Beim Löschen eines Mitarbeiters blieb ein bestehender Login-Account bei Supabase Auth bestehen ("verwaist") und blockierte die spätere Neuvergabe derselben E-Mail-Adresse',
        'Löschen eines Mitarbeiters entfernt jetzt automatisch auch einen eventuell vorhandenen Login-Account mit',
        'Betroffenen Testfall (andrei.sicoe@gmail.com) direkt bereinigt',
      ],
      en: [
        'Bug fix: deleting an employee left an existing Supabase Auth login account behind ("orphaned"), blocking that email from being reassigned later',
        'Deleting an employee now also automatically removes any existing login account',
        'Cleaned up the affected test case (andrei.sicoe@gmail.com) directly',
      ],
    },
  },
  {
    version: '1.25.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Neue Passwort-Regeln für selbst gesetzte Passwörter (Erst-Login und "Mein Konto"): mindestens 12 Zeichen, mindestens eine Zahl, mindestens ein Sonderzeichen',
        'Sichtbarer Hinweis zu den Regeln unter dem Passwort-Feld, klare Fehlermeldung listet genau auf, was noch fehlt',
        'Admin-vergebene Start-/Reset-Passwörter bleiben bewusst unbeschränkt (auch serverseitig), da der Mitarbeiter sie beim nächsten Login ohnehin ersetzen muss',
      ],
      en: [
        'New password rules for self-set passwords (first login and "My account"): at least 12 characters, at least one number, at least one special character',
        'Visible hint about the rules under the password field, clear error message lists exactly what is still missing',
        'Admin-assigned starting/reset passwords remain deliberately unrestricted (server-side too), since the employee has to replace them at their next login anyway',
      ],
    },
  },
  {
    version: '1.24.1',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlerbehebung: Nach dem Festlegen des neuen Passworts beim erzwungenen Erst-Login blieb der Passwort-Bildschirm unsichtbar über der bereits geladenen App liegen - showApp() blendete ihn nicht aus',
      ],
      en: [
        'Bug fix: after setting the new password during the forced first-login flow, the password screen stayed invisibly on top of the already-loaded app - showApp() never hid it',
      ],
    },
  },
  {
    version: '1.24.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Beim Stellen eines Urlaubsantrags öffnet sich automatisch ein vorausgefüllter Mail-Entwurf (Outlook) an alle Projekt Approver (An) und Admins (Cc) mit hinterlegter E-Mail-Adresse',
        'E-Mail enthält Name, Zeitraum, Ganztag/Halbtag-Angabe, Link zur App und eine kurze Anleitung, wo der Genehmiger in der App hin muss',
        'Neuer "Erinnerung senden"-Button bei offenen Anträgen, falls der Genehmiger noch nicht reagiert hat',
        'Falls niemand mit passender Rolle eine E-Mail hinterlegt hat, erscheint ein Hinweis statt eines Mail-Entwurfs',
      ],
      en: [
        'Submitting a leave request automatically opens a pre-filled email draft (Outlook) to all project approvers (To) and admins (Cc) with an email on file',
        'Email includes name, period, full-day/half-day info, a link to the app, and brief instructions on where the approver needs to go',
        'New "Send reminder" button on open requests in case the approver has not responded yet',
        'If nobody with the relevant role has an email on file, a hint is shown instead of a mail draft',
      ],
    },
  },
  {
    version: '1.23.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Audit-Log: Einträge jetzt nach Jahr und Monat gruppiert (beide auf-/zuklappbar, standardmässig alle zugeklappt)',
        'Audit-Log: Suchfeld ergänzt, durchsucht Wer/Tabelle/Aktion/Details gleichzeitig - Treffer klappen ihre Jahr/Monat-Gruppe automatisch auf',
        'Audit-Log: "Mehr laden"-Button statt starrem 200er-Limit, lädt bei Bedarf in 300er-Schritten weitere ältere Einträge nach',
      ],
      en: [
        'Audit log: entries are now grouped by year and month (both collapsible, all collapsed by default)',
        'Audit log: added a search field, searches who/table/action/details at once - matches automatically expand their year/month group',
        'Audit log: "Load more" button instead of a fixed 200-entry limit, loads further older entries in batches of 300 on demand',
      ],
    },
  },
  {
    version: '1.22.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Feiertage und Sperrzeiten sind jetzt nach Jahr gruppiert, jede Jahres-Gruppe auf-/zuklappbar, standardmässig alle zugeklappt, neueste Jahre oben',
        'Neu angelegte Einträge klappen ihr Jahr automatisch auf',
        'Hinweis: Die klickbare Spalten-Sortierung (A-Z/Z-A) ist bei diesen beiden Seiten dadurch weggefallen, da die Jahres-Gruppierung diese Funktion ersetzt (innerhalb eines Jahres chronologisch sortiert). Bei allen anderen Listen bleibt die Sortierung unverändert bestehen',
      ],
      en: [
        'Holidays and blocked periods are now grouped by year, each year collapsible, all collapsed by default, newest years on top',
        'Newly created entries automatically expand their year',
        'Note: the clickable column sorting (A-Z/Z-A) is gone on these two pages since the year grouping replaces it (chronological within each year). All other lists keep sorting unchanged',
      ],
    },
  },
  {
    version: '1.21.2',
    date: '2026-08-23',
    changes: {
      de: [
        'Audit-Log in der Navigation zu "Sonstiges" verschoben, direkt neben Change-Log',
      ],
      en: [
        'Moved Audit log in the navigation to "Other", right next to Change log',
      ],
    },
  },
  {
    version: '1.21.1',
    date: '2026-08-23',
    changes: {
      de: [
        'Fehlende Lücke geschlossen: E-Mail-Feld im Mitarbeiter-Formular ergänzt (bisher liess sich eine E-Mail nur zusammen mit einem Passwort über "Login erstellen" setzen)',
        'Solange noch kein App-Zugang besteht, ist die E-Mail dort frei erfassbar/änderbar; sobald ein Login existiert, ist sie schreibgeschützt (Änderung dann nur über "Rollen & Zugriff", damit Login und Stammdaten synchron bleiben)',
        'Neue E-Mail-Spalte in der Mitarbeiter-Tabelle',
      ],
      en: [
        'Closed a real gap: added an email field to the employee form (previously an email could only be set together with a password via "Create login")',
        'As long as no app access exists yet, the email can be freely entered/changed there; once a login exists, it becomes read-only (changes then go through "Roles & Access" to keep login and records in sync)',
        'New email column in the employees table',
      ],
    },
  },
  {
    version: '1.21.0',
    date: '2026-08-23',
    changes: {
      de: [
        'Halbtags-Urlaub gilt jetzt auch für mehrtägige Zeiträume, nicht mehr nur für einzelne Tage - z. B. eine ganze Woche lang jeden Tag nur vormittags',
        'Team-Kalender zeigt das automatisch korrekt an (jeder Tag im Zeitraum als Halbtag-Zelle), ohne dass dafür etwas geändert werden musste',
        '"Ganzer Tag / Vormittag / Nachmittag" ist jetzt immer wählbar, unabhängig von der Zeitraum-Länge',
      ],
      en: [
        'Half-day leave now also applies to multi-day periods, not just single days - e.g. mornings only for an entire week',
        'The team calendar automatically displays this correctly (every day in the range as a half-day cell), no changes needed there',
        '"Full day / Morning / Afternoon" is now always selectable, regardless of the period length',
      ],
    },
  },
  {
    version: '1.20.5',
    date: '2026-08-23',
    changes: {
      de: [
        'Klarstellung: Das Verschwinden des Halbtag-Felds bei mehrtägigen Anträgen war eigentlich beabsichtigtes Verhalten (Halbtage sind nur für eintägige Anträge gedacht), wirkte aber verwirrend',
        'UX-Verbesserung: Feld bleibt jetzt immer sichtbar, wird bei mehrtägigen Anträgen stattdessen ausgegraut und auf "Ganzer Tag" gesperrt, statt komplett zu verschwinden',
      ],
      en: [
        'Clarification: the half-day field disappearing for multi-day requests was actually intended behavior (half-days are only meant for single-day requests), but it felt confusing',
        'UX improvement: the field now always stays visible, but is greyed out and locked to "full day" for multi-day requests instead of disappearing entirely',
      ],
    },
  },
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
