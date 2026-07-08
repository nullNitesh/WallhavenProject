/**
 * Wallhaven Downloader — Main Application
 * Initializes the app, manages state, and wires everything together.
 */

import { searchWallpapers } from './api.js';
import { createWallpaperCard } from './components/wallpaperCard.js';
import { openModal } from './components/modal.js';
import { initFilters, getFilterState } from './components/filters.js';
import { renderPagination, clearPagination } from './components/pagination.js';
import { showToast } from './components/toast.js';

// --- DOM References ---
const searchInput = document.getElementById('search-input');
const wallpaperGrid = document.getElementById('wallpaper-grid');
const skeletonGrid = document.getElementById('skeleton-grid');
const emptyState = document.getElementById('empty-state');
const resultsCount = document.getElementById('results-count');
const logo = document.getElementById('logo');

// --- App State ---
let state = {
  query: '',
  page: 1,
  meta: null,
  seed: null, // For random sorting pagination
  isLoading: false,
};

// --- Debounce utility ---
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- Initialize ---
function init() {
  // Initial load — show latest wallpapers
  performSearch();

  // Search input with debounce
  searchInput.addEventListener('input', debounce(() => {
    state.query = searchInput.value.trim();
    state.page = 1;
    state.seed = null;
    performSearch();
  }, 400));

  // Search on Enter
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      state.query = searchInput.value.trim();
      state.page = 1;
      state.seed = null;
      performSearch();
    }
  });

  // Keyboard shortcut: "/" to focus search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Initialize filter bar
  initFilters(() => {
    state.page = 1;
    state.seed = null;
    performSearch();
  });

  // Logo click → go home (reset everything)
  logo.addEventListener('click', () => {
    searchInput.value = '';
    state.query = '';
    state.page = 1;
    state.seed = null;
    // Reset filters to defaults
    document.getElementById('chip-general').classList.add('active');
    document.getElementById('chip-anime').classList.add('active');
    document.getElementById('chip-people').classList.remove('active');
    document.getElementById('chip-sfw').classList.add('active');
    document.getElementById('chip-sketchy').classList.remove('active');
    document.getElementById('sorting-select').value = 'date_added';
    document.getElementById('filter-toprange').classList.add('hidden');
    performSearch();
  });

  // Listen for tag clicks from the modal
  window.addEventListener('search-tag', (e) => {
    const tagName = e.detail;
    searchInput.value = tagName;
    state.query = tagName;
    state.page = 1;
    state.seed = null;
    performSearch();
  });
}

/**
 * Perform a search with current state and filters.
 */
async function performSearch() {
  if (state.isLoading) return;
  state.isLoading = true;

  // Show loading state
  showLoading(true);

  const filters = getFilterState();

  // Build search params
  const params = {
    categories: filters.categories,
    purity: filters.purity,
    sorting: filters.sorting,
    order: 'desc',
    page: state.page,
  };

  // Add query if present
  if (state.query) {
    params.q = state.query;
  }

  // Add topRange if sorting is toplist
  if (filters.sorting === 'toplist') {
    params.topRange = filters.topRange;
  }

  // Add seed for random sorting pagination
  if (filters.sorting === 'random' && state.seed) {
    params.seed = state.seed;
  }

  try {
    const result = await searchWallpapers(params);
    state.meta = result.meta;

    // Capture seed for random sorting
    if (result.meta?.seed) {
      state.seed = result.meta.seed;
    }

    renderResults(result.data, result.meta);
  } catch (error) {
    showToast(error.message, 'error');
    showEmptyState(true);
    clearPagination();
  } finally {
    state.isLoading = false;
    showLoading(false);
  }
}

/**
 * Render wallpaper grid from API results.
 * @param {Array} wallpapers
 * @param {Object} meta
 */
function renderResults(wallpapers, meta) {
  wallpaperGrid.innerHTML = '';

  if (!wallpapers || wallpapers.length === 0) {
    showEmptyState(true);
    clearPagination();
    updateResultsInfo(0, 0);
    return;
  }

  showEmptyState(false);

  // Create and append cards
  wallpapers.forEach((wp) => {
    const card = createWallpaperCard(wp, onCardClick);
    wallpaperGrid.appendChild(card);
  });

  // Update pagination
  renderPagination(meta, (page) => {
    state.page = page;
    performSearch();
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Update results info
  updateResultsInfo(meta.total, meta.current_page);
}

/**
 * Handle wallpaper card click — open detail modal.
 * @param {Object} wallpaper
 */
function onCardClick(wallpaper) {
  openModal(wallpaper);
}

/**
 * Show/hide loading skeleton.
 * @param {boolean} show
 */
function showLoading(show) {
  if (show) {
    wallpaperGrid.classList.add('hidden');
    skeletonGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
  } else {
    skeletonGrid.classList.add('hidden');
    wallpaperGrid.classList.remove('hidden');
  }
}

/**
 * Show/hide empty state.
 * @param {boolean} show
 */
function showEmptyState(show) {
  if (show) {
    emptyState.classList.remove('hidden');
    wallpaperGrid.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    wallpaperGrid.classList.remove('hidden');
  }
}

/**
 * Update the results info text.
 * @param {number} total
 * @param {number} page
 */
function updateResultsInfo(total, page) {
  if (total > 0) {
    const start = (page - 1) * 24 + 1;
    const end = Math.min(page * 24, total);
    resultsCount.textContent = `Showing ${start}–${end} of ${total.toLocaleString()} wallpapers`;
  } else {
    resultsCount.textContent = '';
  }
}

// --- Boot ---
document.addEventListener('DOMContentLoaded', init);
