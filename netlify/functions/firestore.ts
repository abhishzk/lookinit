import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const FIREBASE_API_KEY = process.env.APP_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.APP_FIREBASE_PROJECT_ID;

const handler: Handler = async (event) => {
  try {
    const { action, collection, docId, data, query } = JSON.parse(event.body || '{}');
    
    if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing Firebase configuration' }),
      };
    }
    
    // Handle different Firestore operations
    switch (action) {
      case 'getDocument':
        if (!collection || !docId) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing collection or document ID' }) };
        }
        
        // Get document using Firestore REST API
        const getDocResponse = await fetch(
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        
        const docData = await getDocResponse.json();
        return { statusCode: 200, body: JSON.stringify(docData) };
        
      case 'setDocument':
        if (!collection || !docId || !data) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing collection, document ID, or data' }) };
        }
        
        // Set document using Firestore REST API
        const setDocResponse = await fetch(
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: convertToFirestoreFields(data),
            }),
          }
        );
        
        const setDocData = await setDocResponse.json();
        return { statusCode: 200, body: JSON.stringify(setDocData) };
      
      case 'deleteDocument':
        if (!collection || !docId) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing collection or document ID' }) };
        }
        
        // Delete document using Firestore REST API
        const deleteDocResponse = await fetch(
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        
        // Check if the response is empty (successful delete returns empty response)
        if (deleteDocResponse.status === 200 || deleteDocResponse.status === 204) {
          return { statusCode: 200, body: JSON.stringify({ success: true }) };
        } else {
          const deleteError = await deleteDocResponse.json();
          return { statusCode: deleteDocResponse.status, body: JSON.stringify(deleteError) };
        }
      
      case 'query':
        if (!collection || !query) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing collection or query parameters' }) };
        }
        
        // Build the structured query
        const structuredQuery = buildStructuredQuery(collection, query);
        
        // Run the query using Firestore REST API
        const queryResponse = await fetch(
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ structuredQuery }),
          }
        );
        
        const queryData = await queryResponse.json();
        return { statusCode: 200, body: JSON.stringify(queryData) };
        
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

// Helper function to build a structured query for Firestore
function buildStructuredQuery(collection: string, queryParams: any) {
  const { field, operator, value, orderBy, orderDirection, limit } = queryParams;
  
  const structuredQuery: any = {
    from: [{ collectionId: collection }],
  };
  
  // Add where clause if field, operator, and value are provided
  if (field && operator && value !== undefined) {
    structuredQuery.where = {
      fieldFilter: {
        field: { fieldPath: field },
        op: mapOperator(operator),
        value: convertToFirestoreValue(value),
      },
    };
  }
  
  // Add order by clause if orderBy is provided
  if (orderBy) {
    structuredQuery.orderBy = [
      {
        field: { fieldPath: orderBy },
        direction: orderDirection === 'desc' ? 'DESCENDING' : 'ASCENDING',
      },
    ];
  }
  
  // Add limit if provided
  if (limit && !isNaN(parseInt(limit))) {
    structuredQuery.limit = parseInt(limit);
  }
  
  return structuredQuery;
}

// Map JavaScript operators to Firestore operators
function mapOperator(operator: string) {
  const operatorMap: Record<string, string> = {
    '==': 'EQUAL',
    '!=': 'NOT_EQUAL',
    '<': 'LESS_THAN',
    '<=': 'LESS_THAN_OR_EQUAL',
    '>': 'GREATER_THAN',
    '>=': 'GREATER_THAN_OR_EQUAL',
    'array-contains': 'ARRAY_CONTAINS',
    'in': 'IN',
    'array-contains-any': 'ARRAY_CONTAINS_ANY',
  };
  
  return operatorMap[operator] || 'EQUAL';
}

// Helper function to convert JavaScript objects to Firestore field format
function convertToFirestoreFields(data: any) {
  const fields: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value === null) {
      fields[key] = { nullValue: null };
    } else if (Array.isArray(value)) {
      fields[key] = { arrayValue: { values: value.map(item => convertToFirestoreValue(item)) } };
    } else if (typeof value === 'object') {
      if (value instanceof Date) {
        fields[key] = { timestampValue: value.toISOString() };
      } else {
        fields[key] = { mapValue: { fields: convertToFirestoreFields(value) } };
      }
    }
  }
  
  return fields;
}


function convertToFirestoreValue(value: any): { [key: string]: any } {
  if (typeof value === 'string') {
    return { stringValue: value };
  } else if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() };
    } else {
      return { doubleValue: value };
    }
  } else if (typeof value === 'boolean') {
    return { booleanValue: value };
  } else if (value === null) {
    return { nullValue: null };
  } else if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(item => convertToFirestoreValue(item)) } };
  } else if (typeof value === 'object') {
    if (value instanceof Date) {
      return { timestampValue: value.toISOString() };
    } else {
      return { mapValue: { fields: convertToFirestoreFields(value) } };
    }
  }
  return { nullValue: null };

}
export { handler };
