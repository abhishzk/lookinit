// This file provides Firebase Admin-like functionality for Netlify
// using Netlify Functions instead of direct Firebase Admin SDK

/**
 * Get a user by ID
 */
export async function getUser(uid: string) {
  const response = await fetch('/.netlify/functions/firebase-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getUser', uid }),
  });
  
  return response.json();
}

/**
 * Verify a Firebase ID token
 */
export async function verifyIdToken(idToken: string) {
  const response = await fetch('/.netlify/functions/firebase-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'verifyToken', 
      data: { idToken } 
    }),
  });
  
  return response.json();
}

/**
 * Get a document from Firestore
 */
export async function getDocument(collection: string, docId: string) {
  const response = await fetch('/.netlify/functions/firestore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getDocument', collection, docId }),
  });
  
  return response.json();
}

/**
 * Set a document in Firestore
 */
export async function setDocument(collection: string, docId: string, data: any) {
  const response = await fetch('/.netlify/functions/firestore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'setDocument', collection, docId, data }),
  });
  
  return response.json();
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocument(collection: string, docId: string) {
  const response = await fetch('/.netlify/functions/firestore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'deleteDocument', collection, docId }),
  });
  
  return response.json();
}

/**
 * Query documents from Firestore
 */
export async function queryDocuments(collection: string, queryParams: {
  field?: string;
  operator?: string;
  value?: any;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
}) {
  const response = await fetch('/.netlify/functions/firestore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'query', 
      collection, 
      query: queryParams 
    }),
  });
  
  return response.json();
}
