/**
 * Toast notification system
 * Supports success, error, info, and warning variants.
 * Toasts auto-dismiss after 3 seconds.
 */

const ICONS = {
  success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

/**
 * Show a toast notification.
 * @param {string} message - The message to display
 * @param {'success'|'error'|'info'|'warning'} type - Toast variant
 * @param {number} duration - Auto-dismiss duration in ms (default 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
    <span class="toast-message">${message}</span>
    <div class="toast-progress"></div>
  `;

  // Set progress bar animation duration
  const progressBar = toast.querySelector('.toast-progress');
  progressBar.style.animationDuration = `${duration}ms`;

  container.appendChild(toast);

  // Auto-dismiss
  const timer = setTimeout(() => {
    toast.classList.add('dismissing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);

  // Click to dismiss early
  toast.addEventListener('click', () => {
    clearTimeout(timer);
    toast.classList.add('dismissing');
    toast.addEventListener('animationend', () => toast.remove());
  });
}
