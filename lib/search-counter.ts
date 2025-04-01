export const SEARCH_LIMIT = 3;

export const getSearchCount = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const count = localStorage.getItem('searchCount');
  return count ? parseInt(count, 0) : 0;
};

export const incrementSearchCount = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const currentCount = getSearchCount();
  const newCount = currentCount + 1;
  localStorage.setItem('searchCount', newCount.toString());
  return newCount;
};

export const isSearchLimitReached = (): boolean => {
  return getSearchCount() >= SEARCH_LIMIT;
};

export const resetSearchCount = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('searchCount', '0');
};
