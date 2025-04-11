import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Initialize the Secret Manager client
const secretManagerClient = new SecretManagerServiceClient();

/**
 * Fetches a secret from Google Secret Manager
 * @param secretName The name of the secret to fetch
 * @returns The secret payload as a string
 */
export async function getSecret(secretName: string): Promise<string> {
  try {
    // Format the resource name
    const name = `projects/${process.env.GOOGLE_PROJECT_ID}/secrets/${secretName}/versions/latest`;
    
    // Access the secret
    const [version] = await secretManagerClient.accessSecretVersion({ name });
    
    // Extract the payload
    const payload = version.payload?.data?.toString() || '';
    return payload;
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error);
    throw new Error(`Failed to fetch secret: ${secretName}`);
  }
}

/**
 * Fetches and parses a JSON secret from Google Secret Manager
 * @param secretName The name of the secret to fetch
 * @returns The parsed JSON object
 */
export async function getJsonSecret<T>(secretName: string): Promise<T> {
  const secretValue = await getSecret(secretName);
  try {
    return JSON.parse(secretValue) as T;
  } catch (error) {
    console.error(`Error parsing JSON secret ${secretName}:`, error);
    throw new Error(`Failed to parse JSON secret: ${secretName}`);
  }
}
