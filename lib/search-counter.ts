import { auth } from '@/lib/firebase';

export const SEARCH_LIMIT = 3;

export const getSearchCount = (userId?: string | null): number => {
  if (typeof window === 'undefined') return 0;
  
  // Use user ID as part of the key if available
  const key = userId ? `searchCount_${userId}` : 'searchCount_anonymous';
  const count = localStorage.getItem(key);
  return count ? parseInt(count, 0) : 0;
};

export const incrementSearchCount = (userId?: string | null): number => {
  if (typeof window === 'undefined') return 0;
  
  const key = userId ? `searchCount_${userId}` : 'searchCount_anonymous';
  const currentCount = getSearchCount(userId);
  const newCount = currentCount + 1;
  localStorage.setItem(key, newCount.toString());
  return newCount;
};

export const isSearchLimitReached = (userId?: string | null): boolean => {
  return getSearchCount(userId) >= SEARCH_LIMIT;
};

export const resetSearchCount = (userId?: string | null): void => {
  if (typeof window === 'undefined') return;
  const key = userId ? `searchCount_${userId}` : 'searchCount_anonymous';
  localStorage.setItem(key, '0');
};
