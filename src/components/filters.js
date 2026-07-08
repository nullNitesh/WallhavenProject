/**
 * Filter bar controller
 * Reads and manages the state of category, purity, sorting, and topRange filters.
 * Emits a callback whenever filters change.
 */

/**
 * Initialize filter event listeners.
 * @param {Function} onFilterChange - Called with the current filter state whenever a filter changes
 */
export function initFilters(onFilterChange) {
  const categoryChips = document.querySelectorAll('#filter-categories .chip');
  const purityChips = document.querySelectorAll('#filter-purity .chip');
  const sortingSelect = document.getElementById('sorting-select');
  const toprangeSelect = document.getElementById('toprange-select');
  const toprangeGroup = document.getElementById('filter-toprange');

  // Category chip toggles
  categoryChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      // Ensure at least one category is active
      const anyActive = [...categoryChips].some((c) => c.classList.contains('active'));
      if (!anyActive) chip.classList.add('active');
      onFilterChange(getFilterState());
    });
  });

  // Purity chip toggles
  purityChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      // Ensure at least one purity is active
      const anyActive = [...purityChips].some((c) => c.classList.contains('active'));
      if (!anyActive) chip.classList.add('active');
      onFilterChange(getFilterState());
    });
  });

  // Sorting dropdown
  sortingSelect.addEventListener('change', () => {
    // Show/hide topRange when sorting is "toplist"
    if (sortingSelect.value === 'toplist') {
      toprangeGroup.classList.remove('hidden');
    } else {
      toprangeGroup.classList.add('hidden');
    }
    onFilterChange(getFilterState());
  });

  // Top range dropdown
  toprangeSelect.addEventListener('change', () => {
    onFilterChange(getFilterState());
  });
}

/**
 * Read the current filter state from the DOM.
 * @returns {Object} Filter state with categories, purity, sorting, topRange
 */
export function getFilterState() {
  // Categories: 3-digit binary string (general/anime/people)
  const general = document.getElementById('chip-general').classList.contains('active') ? '1' : '0';
  const anime = document.getElementById('chip-anime').classList.contains('active') ? '1' : '0';
  const people = document.getElementById('chip-people').classList.contains('active') ? '1' : '0';
  const categories = `${general}${anime}${people}`;

  // Purity: 3-digit binary string (sfw/sketchy/nsfw)
  const sfw = document.getElementById('chip-sfw').classList.contains('active') ? '1' : '0';
  const sketchy = document.getElementById('chip-sketchy').classList.contains('active') ? '1' : '0';
  const nsfw = '0'; // NSFW requires API key — not exposed in UI for now
  const purity = `${sfw}${sketchy}${nsfw}`;

  const sorting = document.getElementById('sorting-select').value;
  const topRange = document.getElementById('toprange-select').value;

  return { categories, purity, sorting, topRange };
}
