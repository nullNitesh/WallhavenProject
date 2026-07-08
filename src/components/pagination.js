/**
 * Pagination component
 * Renders page navigation based on API meta data.
 */

const paginationContainer = document.getElementById('pagination');

/**
 * Render pagination controls.
 * @param {Object} meta - API meta object with current_page, last_page, total
 * @param {Function} onPageChange - Called with the new page number
 */
export function renderPagination(meta, onPageChange) {
  if (!meta || meta.last_page <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  const { current_page: current, last_page: last } = meta;

  let html = '';

  // Previous button
  html += `<button class="page-btn" data-page="${current - 1}" ${current === 1 ? 'disabled' : ''}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  </button>`;

  // Page numbers — show smart range
  const pages = getPageRange(current, last);
  pages.forEach((page) => {
    if (page === '...') {
      html += `<span class="page-info">…</span>`;
    } else {
      html += `<button class="page-btn ${page === current ? 'active' : ''}" data-page="${page}">${page}</button>`;
    }
  });

  // Next button
  html += `<button class="page-btn" data-page="${current + 1}" ${current === last ? 'disabled' : ''}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  </button>`;

  // Page info
  html += `<span class="page-info">Page ${current} of ${last}</span>`;

  paginationContainer.innerHTML = html;

  // Event delegation
  paginationContainer.querySelectorAll('.page-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page) && page >= 1 && page <= last && page !== current) {
        onPageChange(page);
      }
    });
  });
}

/**
 * Generate a smart page range with ellipsis.
 * Shows: 1, ..., current-1, current, current+1, ..., last
 * @param {number} current
 * @param {number} last
 * @returns {Array<number|string>}
 */
function getPageRange(current, last) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  let prev = null;
  for (const page of range) {
    if (prev !== null && page - prev > 1) {
      rangeWithDots.push('...');
    }
    rangeWithDots.push(page);
    prev = page;
  }

  return rangeWithDots;
}

/**
 * Clear pagination.
 */
export function clearPagination() {
  paginationContainer.innerHTML = '';
}
