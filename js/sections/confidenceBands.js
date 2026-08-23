import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { openFormModal } from '../modal.js';

export async function renderBands(container) {
  container.innerHTML = `
    <header>
      <h1>${t('bands.title')}</h1>
      <p>${t('bands.subtitle')}</p>
    </header>
    <div class="card">
      <div class="toolbar">
        <div></div>
        <button type="button" class="btn btn-primary" id="open-add-btn">${t('common.add')}</button>
      </div>
      <table>
        <thead><tr>
          <th>${t('bands.position')}</th><th class="num">${t('bands.lower')}</th><th class="num">${t('bands.upper')}</th><th></th>
        </tr></thead>
        <tbody id="band-tbody"><tr><td colspan="4" class="empty-state">${t('common.loading')}</td></tr></tbody>
      </table>
    </div>
  `;

  function formBody(b) {
    return `
      <div class="form-grid">
        ${fieldLabel(t('bands.position'), 'Position des Sprints innerhalb der PI (1 = direkt nach PI Planning). Muss mit der Sprint-Position bei "PI & Sprints" übereinstimmen.')}
        <input type="number" id="mf-pos" min="1" required ${b ? 'readonly' : ''} value="${b ? b.sprint_position : ''}">

        ${fieldLabel(t('bands.lower'), 'Wie viel Prozent der berechneten Kapazität mindestens erwartet wird.')}
        <input type="number" id="mf-lower" min="0" max="1" step="0.01" required value="${b ? b.lower_pct : ''}">

        ${fieldLabel(t('bands.upper'), 'Wie viel Prozent der berechneten Kapazität höchstens erwartet wird, meist 100%.')}
        <input type="number" id="mf-upper" min="0" max="1" step="0.01" required value="${b ? b.upper_pct : ''}">
      </div>
    `;
  }

  function openAdd() {
    const modal = openFormModal({ title: t('common.add'), bodyHtml: formBody(null), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        sprint_position: modal.body.querySelector('#mf-pos').value,
        lower_pct: modal.body.querySelector('#mf-lower').value,
        upper_pct: modal.body.querySelector('#mf-upper').value,
      };
      const { error } = await supabase.from('confidence_bands').upsert(payload, { onConflict: 'sprint_position' });
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      load();
    });
  }

  function openEdit(b) {
    const modal = openFormModal({ title: t('common.edit'), bodyHtml: formBody(b), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        sprint_position: b.sprint_position,
        lower_pct: modal.body.querySelector('#mf-lower').value,
        upper_pct: modal.body.querySelector('#mf-upper').value,
      };
      const { error } = await supabase.from('confidence_bands').upsert(payload, { onConflict: 'sprint_position' });
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      load();
    });
  }

  document.getElementById('open-add-btn').addEventListener('click', openAdd);

  async function load() {
    const tbody = document.getElementById('band-tbody');
    const { data, error } = await supabase.from('confidence_bands').select('*').order('sprint_position');
    if (error) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('common.error')}</td></tr>`; return; }
    if (!data.length) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('common.none')}</td></tr>`; return; }

    tbody.innerHTML = data.map(b => `
      <tr data-pos="${b.sprint_position}">
        <td class="mono">${b.sprint_position}</td>
        <td class="num mono">${Math.round(Number(b.lower_pct) * 100)}%</td>
        <td class="num mono">${Math.round(Number(b.upper_pct) * 100)}%</td>
        <td class="row-actions">
          ${iconButton(ICON_EDIT, t('common.edit'), 'edit-btn')}
          ${iconButton(ICON_DELETE, t('common.delete'), 'delete-btn')}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pos = btn.closest('tr').dataset.pos;
        openEdit(data.find(x => String(x.sprint_position) === pos));
      });
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('common.confirmDelete'))) return;
        const pos = btn.closest('tr').dataset.pos;
        const { error } = await supabase.from('confidence_bands').delete().eq('sprint_position', pos);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        load();
      });
    });
  }

  load();
}
