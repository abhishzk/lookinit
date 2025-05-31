import { auth } from '@/lib/firebase';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: number;
}

// Initialize Firestore
const db = getFirestore();

// Fetch search history
export async function fetchSearchHistory(): Promise<SearchHistoryItem[]> {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ No user authenticated for fetching history');
    return [];
  }
  
  try {
    const historyQuery = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(historyQuery);
    const history = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as SearchHistoryItem));
    
    console.log('✅ Fetched search history:', history.length, 'items');
    return history;
  } catch (error) {
    console.error('❌ Error fetching search history:', error);
    return [];
  }
}

// Delete search history item
export async function deleteSearchItem(id: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ No user authenticated for deleting item');
    return false;
  }
  
  try {
    await deleteDoc(doc(db, 'searchHistory', id));
    console.log('✅ Search item deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting search item:', error);
    return false;
  }
}

// Clear all search history
export async function clearSearchHistory(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ No user authenticated for clearing history');
    return false;
  }
  
  try {
    const historyItems = await fetchSearchHistory();
    
    if (historyItems.length === 0) {
      console.log('✅ No history items to clear');
      return true;
    }
    
    const deletePromises = historyItems.map(item => 
      deleteDoc(doc(db, 'searchHistory', item.id))
    );
    
    await Promise.all(deletePromises);
    console.log('✅ Search history cleared:', historyItems.length, 'items deleted');
    return true;
  } catch (error) {
    console.error('❌ Error clearing search history:', error);
    return false;
  }
}

// Get search history count for a user
export async function getSearchHistoryCount(): Promise<number> {
  const user = auth.currentUser;
  if (!user) return 0;
  
  try {
    const historyQuery = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid)
    );
    
    const snapshot = await getDocs(historyQuery);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error getting search history count:', error);
    return 0;
  }
}
