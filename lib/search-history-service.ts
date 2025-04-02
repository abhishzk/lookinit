import { auth } from '@/lib/firebase';
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';

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
  if (!user) return [];
  
  try {
    const historyQuery = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(historyQuery);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as SearchHistoryItem));
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
}

// Save search to history
export async function saveSearch(query: string): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const historyItem = {
      userId: user.uid,
      query,
      timestamp: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'searchHistory'), historyItem);
    return docRef.id;
  } catch (error) {
    console.error('Error saving search:', error);
    return null;
  }
}

// Delete search history item
export async function deleteSearchItem(id: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    await deleteDoc(doc(db, 'searchHistory', id));
    return true;
  } catch (error) {
    console.error('Error deleting search item:', error);
    return false;
  }
}

// Clear search history
export async function clearSearchHistory(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    const historyItems = await fetchSearchHistory();
    
    // Delete each item one by one
    const deletePromises = historyItems.map(item => 
      deleteDoc(doc(db, 'searchHistory', item.id))
    );
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    return false;
  }
}
