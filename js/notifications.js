import { supabase } from './supabaseClient.js';
import { t } from './i18n.js';
import { formatDate } from './dateFormat.js';

let currentEmployeeId = null;
let onNavigate = null;

export function initNotifications(employeeId, navigateCallback) {
  currentEmployeeId = employeeId;
  onNavigate = navigateCallback;

  const btn = document.getElementById('notif-bell-btn');
  const dropdown = document.getElementById('notif-dropdown');

  btn.addEventListener('click', async e => {
    e.stopPropagation();
    const isOpen = !dropdown.hidden;
    if (isOpen) {
      dropdown.hidden = true;
      return;
    }
    await renderDropdown();
    dropdown.hidden = false;
  });

  document.addEventListener('click', e => {
    if (!dropdown.hidden && !dropdown.contains(e.target) && e.target !== btn) {
      dropdown.hidden = true;
    }
  });

  refreshBadge();
}

export async function refreshBadge() {
  if (!currentEmployeeId) return;
  const badge = document.getElementById('notif-badge');
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', currentEmployeeId)
    .eq('read', false);

  if (count && count > 0) {
    badge.textContent = count > 9 ? '9+' : String(count);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

async function renderDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  dropdown.innerHTML = `<div class="notif-empty">${t('common.loading')}</div>`;

  const { data, error } = await supabase
    .from('notifications')
    .select('id, message, read, created_at, link_leave_request_id, target_route')
    .eq('user_id', currentEmployeeId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data || !data.length) {
    dropdown.innerHTML = `<div class="notif-empty">${t('notifications.empty')}</div>`;
    return;
  }

  dropdown.innerHTML = data.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}" data-route="${n.target_route || 'my-leave'}">
      <div>${escapeHtml(n.message)}</div>
      <div class="notif-date">${formatDate(n.created_at.slice(0, 10))}</div>
    </div>
  `).join('');

  dropdown.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', async () => {
      const id = item.dataset.id;
      const route = item.dataset.route || 'my-leave';
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      dropdown.hidden = true;
      refreshBadge();
      if (onNavigate) onNavigate(route);
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}
