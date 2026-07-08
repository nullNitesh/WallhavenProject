/**
 * Wallpaper card component
 * Creates a card DOM element for the wallpaper grid.
 */

import { downloadWallpaper } from '../api.js';
import { showToast } from './toast.js';

// Download icon SVG
const DOWNLOAD_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

// Loading spinner SVG
const SPINNER_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`;

/**
 * Create a wallpaper card element.
 * @param {Object} wallpaper - Wallpaper data from the API
 * @param {Function} onCardClick - Callback when card body is clicked (opens modal)
 * @returns {HTMLElement}
 */
export function createWallpaperCard(wallpaper, onCardClick) {
  const card = document.createElement('div');
  card.className = 'wallpaper-card';
  card.dataset.id = wallpaper.id;

  // Thumbnail image
  const thumbUrl = wallpaper.thumbs?.large || wallpaper.thumbs?.original || wallpaper.thumbs?.small;

  card.innerHTML = `
    <img
      class="card-thumbnail"
      src="${thumbUrl}"
      alt="Wallpaper ${wallpaper.id}"
      loading="lazy"
    />
    <div class="card-overlay">
      <div class="card-info">
        <span class="card-resolution">${wallpaper.resolution}</span>
        <div class="card-meta">
          <span class="card-category">${wallpaper.category}</span>
          <span class="card-purity ${wallpaper.purity}">${wallpaper.purity}</span>
        </div>
      </div>
    </div>
    <button class="card-download-btn" title="Download to ~/Downloads/Wallpaper/" aria-label="Download wallpaper">
      ${DOWNLOAD_ICON}
    </button>
  `;

  // Click on card body → open detail modal
  card.addEventListener('click', (e) => {
    // Don't open modal if download button was clicked
    if (e.target.closest('.card-download-btn')) return;
    onCardClick(wallpaper);
  });

  // Quick download button
  const downloadBtn = card.querySelector('.card-download-btn');
  downloadBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await handleQuickDownload(downloadBtn, wallpaper);
  });

  return card;
}

/**
 * Handle the quick download from the card's download button.
 * @param {HTMLButtonElement} btn
 * @param {Object} wallpaper
 */
async function handleQuickDownload(btn, wallpaper) {
  if (btn.classList.contains('downloading')) return;

  btn.classList.add('downloading');
  btn.innerHTML = SPINNER_ICON;

  try {
    const result = await downloadWallpaper(wallpaper.path, wallpaper.id);

    if (result.alreadyExists) {
      showToast(result.message, 'warning');
    } else {
      showToast(result.message, 'success');
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btn.classList.remove('downloading');
    btn.innerHTML = DOWNLOAD_ICON;
  }
}
