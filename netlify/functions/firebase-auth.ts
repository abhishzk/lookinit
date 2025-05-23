import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const FIREBASE_API_KEY = process.env.APP_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.APP_FIREBASE_PROJECT_ID;

const handler: Handler = async (event) => {
  try {
    const { action, uid, data } = JSON.parse(event.body || '{}');
    
    if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing Firebase configuration' }),
      };
    }
    
    // Handle different Firebase Auth operations
    switch (action) {
      case 'getUser':
        if (!uid) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing user ID' }) };
        }
        
        // Get user by ID using Firebase Auth REST API
        const getUserResponse = await fetch(
          `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/accounts:lookup?key=${FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ localId: [uid] }),
          }
        );
        
        const userData = await getUserResponse.json();
        return { statusCode: 200, body: JSON.stringify(userData) };
      
      case 'verifyToken':
        const idToken = data?.idToken;
        if (!idToken) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing ID token' }) };
        }
        
        // Verify ID token using Firebase Auth REST API
        const verifyResponse = await fetch(
          `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/accounts:lookup?key=${FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }
        );
        
        const verifyData = await verifyResponse.json();
        return { statusCode: 200, body: JSON.stringify(verifyData) };
        
      default:
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
    };
  }
};

export { handler };
