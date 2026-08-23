// Wiederverwendbares Bestaetigungs-Modal (ersetzt window.confirm() fuer wichtige Aktionen).
// Nutzung: const ok = await showConfirmModal({ title, message, confirmLabel, cancelLabel });
export function showConfirmModal({ title, message, confirmLabel, cancelLabel }) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <h3 class="modal-title"></h3>
        <p class="modal-message"></p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary modal-cancel"></button>
          <button type="button" class="btn btn-primary modal-confirm"></button>
        </div>
      </div>
    `;
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-message').textContent = message;
    overlay.querySelector('.modal-cancel').textContent = cancelLabel;
    overlay.querySelector('.modal-confirm').textContent = confirmLabel;

    document.body.appendChild(overlay);

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    overlay.querySelector('.modal-cancel').addEventListener('click', () => close(false));
    overlay.querySelector('.modal-confirm').addEventListener('click', () => close(true));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(false); }
    });
  });
}

// Formular-Modal fuer "Hinzufuegen"/"Bearbeiten"-Dialoge. Der Aufrufer fuellt bodyHtml
// (typischerweise eine .form-grid), verdrahtet danach modal.body-Unterelemente selbst,
// und ruft modal.close() nach erfolgreichem Speichern/Abbrechen auf.
export function openFormModal({ title, bodyHtml, submitLabel, cancelLabel }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box modal-box-form">
      <h3 class="modal-title"></h3>
      <div class="modal-form-body"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary modal-form-cancel"></button>
        <button type="button" class="btn btn-primary modal-form-submit"></button>
      </div>
    </div>
  `;
  overlay.querySelector('.modal-title').textContent = title;
  overlay.querySelector('.modal-form-body').innerHTML = bodyHtml;
  overlay.querySelector('.modal-form-cancel').textContent = cancelLabel;
  overlay.querySelector('.modal-form-submit').textContent = submitLabel;

  document.body.appendChild(overlay);

  function close() {
    overlay.remove();
  }

  overlay.querySelector('.modal-form-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape' && document.body.contains(overlay)) { close(); }
  });

  return {
    body: overlay.querySelector('.modal-form-body'),
    submitBtn: overlay.querySelector('.modal-form-submit'),
    cancelBtn: overlay.querySelector('.modal-form-cancel'),
    close,
  };
}
