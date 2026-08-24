import { supabase } from '../supabaseClient.js';
import { t } from '../i18n.js';
import { ICON_EDIT, ICON_DELETE, iconButton, fieldLabel } from '../icons.js';
import { formatDate, todayISO } from '../dateFormat.js';
import { openFormModal } from '../modal.js';

export async function renderBlocked(container) {
  let bpData = [];
  const expandedYears = new Set();

  container.innerHTML = `
    <header><h1>${t('nav.blocked')}</h1></header>
    <div class="card">
      <div class="toolbar">
        <div></div>
        <button type="button" class="btn btn-primary" id="open-add-btn">${t('common.add')}</button>
      </div>
      <div id="bp-groups"><p class="empty-state">${t('common.loading')}</p></div>
    </div>
  `;

  function formBody(bp) {
    return `
      <div class="form-grid">
        ${fieldLabel(t('blocked.start') + ' – ' + t('blocked.end'), 'Zeitraum der Sperrzeit.')}
        <div class="date-range-inline">
          <input type="date" id="mf-start" required value="${bp ? bp.start_date : todayISO()}">
          <span>–</span>
          <input type="date" id="mf-end" required value="${bp ? bp.end_date : todayISO()}">
        </div>

        ${fieldLabel(t('blocked.label'), 'Grund der Sperrzeit, z. B. "Betriebsferien" oder "Wartungsfenster".')}
        <input type="text" id="mf-label" required value="${bp ? escapeHtml(bp.label) : ''}">

        ${fieldLabel(t('blocked.capacityImpact'), 'Aktiv: wirkt wie eine Firmenschliessung und wird von der verfügbaren Kapazität abgezogen. Inaktiv: dient nur als Genehmigungshinweis im Urlaubskalender, ohne die Kapazität zu verändern.')}
        <input type="checkbox" id="mf-impact" ${!bp || bp.capacity_impact ? 'checked' : ''}>
      </div>
    `;
  }

  function wireDateLink(modal) {
    modal.body.querySelector('#mf-start').addEventListener('change', e => {
      modal.body.querySelector('#mf-end').min = e.target.value;
    });
  }

  function openAdd() {
    const modal = openFormModal({ title: t('common.add'), bodyHtml: formBody(null), submitLabel: t('common.add'), cancelLabel: t('common.cancel') });
    wireDateLink(modal);
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        start_date: modal.body.querySelector('#mf-start').value,
        end_date: modal.body.querySelector('#mf-end').value,
        label: modal.body.querySelector('#mf-label').value.trim(),
        capacity_impact: modal.body.querySelector('#mf-impact').checked,
      };
      const { error } = await supabase.from('blocked_periods').insert(payload);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      expandedYears.add(payload.start_date.slice(0, 4));
      modal.close();
      load();
    });
  }

  function openEdit(bp) {
    const modal = openFormModal({ title: t('common.edit'), bodyHtml: formBody(bp), submitLabel: t('common.save'), cancelLabel: t('common.cancel') });
    wireDateLink(modal);
    modal.submitBtn.addEventListener('click', async () => {
      const payload = {
        start_date: modal.body.querySelector('#mf-start').value,
        end_date: modal.body.querySelector('#mf-end').value,
        label: modal.body.querySelector('#mf-label').value.trim(),
        capacity_impact: modal.body.querySelector('#mf-impact').checked,
      };
      const { error } = await supabase.from('blocked_periods').update(payload).eq('id', bp.id);
      if (error) { alert(t('common.error') + '\n' + error.message); return; }
      modal.close();
      load();
    });
  }

  document.getElementById('open-add-btn').addEventListener('click', openAdd);

  async function load() {
    const container = document.getElementById('bp-groups');
    const { data, error } = await supabase.from('blocked_periods').select('*');
    if (error) { container.innerHTML = `<p class="empty-state">${t('common.error')}</p>`; return; }
    bpData = data || [];
    renderGroups();
  }

  function renderGroups() {
    const container = document.getElementById('bp-groups');
    if (!bpData.length) { container.innerHTML = `<p class="empty-state">${t('common.none')}</p>`; return; }

    const grouped = new Map();
    bpData.forEach(bp => {
      const year = bp.start_date.slice(0, 4);
      if (!grouped.has(year)) grouped.set(year, []);
      grouped.get(year).push(bp);
    });
    const years = [...grouped.keys()].sort((a, b) => b.localeCompare(a));
    const today = todayISO();

    container.innerHTML = years.map(year => {
      const items = grouped.get(year).sort((a, b) => a.start_date.localeCompare(b.start_date));
      const isOpen = expandedYears.has(year);
      return `
        <div class="year-group">
          <div class="year-group-header" data-year="${year}">
            <span class="year-chevron">${isOpen ? '▾' : '▸'}</span>
            <span>${year}</span>
            <span class="year-count">(${items.length})</span>
          </div>
          <div class="year-group-body" ${isOpen ? '' : 'hidden'}>
            <table>
              <thead><tr>
                <th>${t('blocked.start')}</th><th>${t('blocked.end')}</th><th>${t('blocked.label')}</th><th>${t('blocked.capacityImpact')}</th><th></th>
              </tr></thead>
              <tbody>
                ${items.map(bp => `
                  <tr data-id="${bp.id}" class="${bp.end_date < today ? 'row-past' : ''}">
                    <td class="mono">${formatDate(bp.start_date)}</td>
                    <td class="mono">${formatDate(bp.end_date)}</td>
                    <td>${escapeHtml(bp.label)}</td>
                    <td>${bp.capacity_impact
                      ? `<span class="badge badge-danger">ja</span>`
                      : `<span class="badge badge-muted">nein</span>`}</td>
                    <td class="row-actions">
                      ${iconButton(ICON_EDIT, t('common.edit'), 'edit-btn')}
                      ${iconButton(ICON_DELETE, t('common.delete'), 'delete-btn')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.year-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const year = header.dataset.year;
        if (expandedYears.has(year)) expandedYears.delete(year); else expandedYears.add(year);
        renderGroups();
      });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.closest('tr').dataset.id;
        openEdit(bpData.find(x => x.id === id));
      });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm(t('common.confirmDelete'))) return;
        const id = btn.closest('tr').dataset.id;
        const { error } = await supabase.from('blocked_periods').delete().eq('id', id);
        if (error) { alert(t('common.error') + '\n' + error.message); return; }
        load();
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
