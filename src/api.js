/**
 * Wallhaven API client module
 * Handles all communication with the Wallhaven API (via local proxy to avoid CORS)
 * and the local Express backend (downloads).
 */

// All Wallhaven API calls go through our Express proxy to avoid CORS issues
const WALLHAVEN_API = '/api/wallhaven';

/**
 * Search wallpapers on Wallhaven.
 * @param {Object} params - Search parameters
 * @param {string} [params.q] - Search query
 * @param {string} [params.categories] - 3-digit binary (general/anime/people)
 * @param {string} [params.purity] - 3-digit binary (sfw/sketchy/nsfw)
 * @param {string} [params.sorting] - Sorting method
 * @param {string} [params.order] - Sort order (asc/desc)
 * @param {string} [params.topRange] - Top range (when sorting=toplist)
 * @param {number} [params.page] - Page number
 * @param {string} [params.seed] - Random seed
 * @returns {Promise<{data: Array, meta: Object}>}
 */
export async function searchWallpapers(params = {}) {
  // Build query string manually (can't use URL constructor with relative paths)
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  const url = `${WALLHAVEN_API}/search${queryString ? '?' + queryString : ''}`;

  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }

  if (!response.ok) {
    throw new Error(`Wallhaven API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get detailed info for a single wallpaper.
 * @param {string} id - Wallpaper ID
 * @returns {Promise<{data: Object}>}
 */
export async function getWallpaperDetails(id) {
  const url = `${WALLHAVEN_API}/w/${id}`;
  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }

  if (response.status === 401) {
    throw new Error('This wallpaper requires authentication (NSFW). Add your API key in settings.');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch wallpaper details: ${response.status}`);
  }

  return response.json();
}

/**
 * Download a wallpaper via the local Express backend.
 * The backend saves the file to ~/Downloads/Wallpaper/
 * @param {string} imageUrl - Full-resolution image URL from Wallhaven
 * @param {string} id - Wallpaper ID
 * @returns {Promise<{success: boolean, alreadyExists: boolean, message: string, filename: string}>}
 */
export async function downloadWallpaper(imageUrl, id) {
  const response = await fetch('/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, id }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Download failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Format file size from bytes to human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
}
