import { initializeMoniteSDK } from './config';

export class MoniteAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoniteAuthError';
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const sdk = await initializeMoniteSDK();
    const entity = await sdk.entities.getEntity();
    
    // For development/testing, accept test credentials
    if (email === 'mitch@thewonderlandstudio.co' && password === 'password123') {
      return {
        user: {
          email,
          name: 'Mitch Eisner',
          entity: entity,
        },
        token: sdk.token,
      };
    }

    throw new MoniteAuthError('Invalid credentials');
  } catch (error) {
    console.error('Authentication error:', error);
    throw new MoniteAuthError('Authentication failed');
  }
}