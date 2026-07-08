/**
 * Wallpaper detail modal component
 * Shows full wallpaper preview, metadata, tags, and download button.
 */

import { getWallpaperDetails, downloadWallpaper, formatFileSize } from '../api.js';
import { showToast } from './toast.js';

// SVG icons
const DOWNLOAD_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const SPINNER_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`;

const overlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.getElementById('modal-close');

/** Currently displayed wallpaper data (with full details) */
let currentWallpaper = null;

// --- Event listeners ---

// Close modal on backdrop click
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

// Close button
closeBtn.addEventListener('click', closeModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
    closeModal();
  }
});

/**
 * Open the detail modal for a wallpaper.
 * First renders with basic data from the search results,
 * then fetches full details (tags, uploader, etc.) and updates.
 * @param {Object} wallpaper - Basic wallpaper data from search results
 */
export async function openModal(wallpaper) {
  currentWallpaper = wallpaper;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Render with basic data first (fast)
  renderModalContent(wallpaper, false);

  // Then fetch full details
  try {
    const { data } = await getWallpaperDetails(wallpaper.id);
    currentWallpaper = data;
    renderModalContent(data, true);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/**
 * Close the modal.
 */
export function closeModal() {
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
  currentWallpaper = null;
}

/**
 * Render modal body content.
 * @param {Object} wp - Wallpaper data
 * @param {boolean} hasFullDetails - Whether we have tags/uploader info
 */
function renderModalContent(wp, hasFullDetails) {
  const imageUrl = wp.path;
  const fileSize = wp.file_size ? formatFileSize(wp.file_size) : '—';
  const fileType = wp.file_type ? wp.file_type.split('/')[1].toUpperCase() : '—';
  const createdAt = wp.created_at ? new Date(wp.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : '—';

  // Color swatches
  const colorsHtml = (wp.colors || []).map(
    (color) => `<div class="color-swatch" style="background: ${color}" title="${color}"></div>`
  ).join('');

  // Tags (only available in full details)
  const tagsHtml = hasFullDetails && wp.tags
    ? wp.tags.map((tag) => `<span class="tag" data-tag="${tag.name}">#${tag.name}</span>`).join('')
    : '<span class="meta-value" style="color: var(--text-tertiary)">Loading tags…</span>';

  // Uploader info
  const uploaderHtml = hasFullDetails && wp.uploader
    ? wp.uploader.username
    : '—';

  modalBody.innerHTML = `
    <div class="modal-image-wrapper">
      <img class="modal-image" src="${imageUrl}" alt="Wallpaper ${wp.id}" />
    </div>
    <div class="modal-details">
      <div class="modal-title">
        Wallpaper
        <span class="wallpaper-id">#${wp.id}</span>
        <span class="card-purity ${wp.purity}" style="margin-left: auto;">${wp.purity}</span>
      </div>

      <div class="modal-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Resolution</span>
          <span class="meta-value">${wp.resolution}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">File Size</span>
          <span class="meta-value">${fileSize}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Format</span>
          <span class="meta-value">${fileType}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Category</span>
          <span class="meta-value" style="text-transform: capitalize;">${wp.category}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Views</span>
          <span class="meta-value">${wp.views?.toLocaleString() || '—'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Favorites</span>
          <span class="meta-value">${wp.favorites?.toLocaleString() || '—'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Uploaded</span>
          <span class="meta-value">${createdAt}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Uploader</span>
          <span class="meta-value">${uploaderHtml}</span>
        </div>
      </div>

      ${colorsHtml ? `
        <div class="meta-label" style="margin-bottom: 6px;">Colors</div>
        <div class="modal-colors">${colorsHtml}</div>
      ` : ''}

      <div class="meta-label" style="margin-bottom: 6px;">Tags</div>
      <div class="modal-tags">${tagsHtml}</div>

      <button class="modal-download-btn" id="modal-download-action">
        ${DOWNLOAD_ICON}
        <span>Download to Wallpaper Folder</span>
      </button>
    </div>
  `;

  // Wire up download button
  const downloadBtn = modalBody.querySelector('#modal-download-action');
  downloadBtn.addEventListener('click', () => handleModalDownload(downloadBtn));

  // Wire up tag clicks → search for that tag
  modalBody.querySelectorAll('.tag').forEach((tagEl) => {
    tagEl.addEventListener('click', () => {
      const tagName = tagEl.dataset.tag;
      closeModal();
      // Dispatch custom event so main.js can handle the search
      window.dispatchEvent(new CustomEvent('search-tag', { detail: tagName }));
    });
  });
}

/**
 * Handle download from the modal's download button.
 * @param {HTMLButtonElement} btn
 */
async function handleModalDownload(btn) {
  if (btn.classList.contains('downloading') || !currentWallpaper) return;

  btn.classList.add('downloading');
  btn.querySelector('span').textContent = 'Downloading…';
  btn.querySelector('svg').outerHTML = SPINNER_ICON;

  try {
    const result = await downloadWallpaper(currentWallpaper.path, currentWallpaper.id);

    if (result.alreadyExists) {
      showToast(result.message, 'warning');
    } else {
      showToast(result.message, 'success');
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btn.classList.remove('downloading');
    btn.querySelector('span').textContent = 'Download to Wallpaper Folder';
    // Restore download icon
    const svgContainer = btn.querySelector('svg');
    if (svgContainer) svgContainer.outerHTML = DOWNLOAD_ICON;
  }
}
