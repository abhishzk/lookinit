import { auth } from '@/lib/firebase';

// This is a simple implementation using localStorage
// For production, you might want to use a database

export const SEARCH_LIMIT = 3; // Free searches per day

// Helper to get current date string (YYYY-MM-DD)
function getDateString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getSearchCount(userId?: string): number {
  if (!userId || typeof window === 'undefined') return 0;
  
  const key = `search_count_${userId}_${getDateString()}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

export function incrementSearchCount(userId?: string): number {
  if (!userId || typeof window === 'undefined') return 0;
  
  const key = `search_count_${userId}_${getDateString()}`;
  const currentCount = getSearchCount(userId);
  const newCount = currentCount + 1;
  
  localStorage.setItem(key, newCount.toString());
  return newCount;
}

export function isSearchLimitReached(userId?: string): boolean {
  if (!userId) return false;
  
  const currentCount = getSearchCount(userId);
  return currentCount >= SEARCH_LIMIT;
}

export const resetSearchCount = (userId?: string | null): void => {
  if (typeof window === 'undefined') return;
  const key = userId ? `search_count_${userId}_${getDateString()}` : `search_count_anonymous_${getDateString()}`;
  localStorage.setItem(key, '0');
};
