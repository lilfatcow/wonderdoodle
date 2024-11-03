import { MoniteSDK } from '@monite/sdk-api';

export const MONITE_CONFIG = {
  apiUrl: 'https://api.sandbox.monite.com/v1',
  entityId: 'c8eb06b3-706e-4f71-8c7c-38b9dcd16d0f',
  clientId: 'c8eb06b3-706e-4f71-8c7c-38b9dcd16d0f',
  clientSecret: '3157626c-e99d-47ba-8be9-a06d538c5df5',
  apiVersion: '2024-01-31'
};

let moniteInstance: MoniteSDK | null = null;

export async function initializeMoniteSDK(): Promise<MoniteSDK> {
  if (moniteInstance) {
    return moniteInstance;
  }

  try {
    // First, get the access token
    const tokenResponse = await fetch(`${MONITE_CONFIG.apiUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-monite-version': MONITE_CONFIG.apiVersion
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: MONITE_CONFIG.clientId,
        client_secret: MONITE_CONFIG.clientSecret
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    // Initialize SDK with token refresh function
    moniteInstance = new MoniteSDK({
      entityId: MONITE_CONFIG.entityId,
      fetchToken: async () => {
        const response = await fetch(`${MONITE_CONFIG.apiUrl}/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-monite-version': MONITE_CONFIG.apiVersion
          },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: MONITE_CONFIG.clientId,
            client_secret: MONITE_CONFIG.clientSecret
          })
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        return {
          access_token: data.access_token,
          token_type: 'Bearer',
          expires_in: data.expires_in
        };
      },
      apiUrl: MONITE_CONFIG.apiUrl,
      headers: {
        'x-monite-version': MONITE_CONFIG.apiVersion
      }
    });

    // Set initial token
    await moniteInstance.setToken({
      access_token: tokenData.access_token,
      token_type: 'Bearer',
      expires_in: tokenData.expires_in
    });

    return moniteInstance;
  } catch (error) {
    console.error('Failed to initialize Monite SDK:', error);
    moniteInstance = null;
    throw error;
  }
}

export function getMoniteInstance(): MoniteSDK | null {
  return moniteInstance;
}

export function clearMoniteSDK(): void {
  moniteInstance = null;
}