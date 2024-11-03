import { getMoniteInstance } from './config';
import type { EntityResponse } from '@monite/sdk-api';

export class MoniteEntityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoniteEntityError';
  }
}

export async function getEntityDetails(): Promise<EntityResponse> {
  try {
    const monite = getMoniteInstance();
    const entity = await monite.entity.getEntity();
    return entity;
  } catch (error) {
    throw new MoniteEntityError('Failed to fetch entity details');
  }
}

export async function updateEntitySettings(settings: Partial<EntityResponse>): Promise<EntityResponse> {
  try {
    const monite = getMoniteInstance();
    const updatedEntity = await monite.entity.updateEntity(settings);
    return updatedEntity;
  } catch (error) {
    throw new MoniteEntityError('Failed to update entity settings');
  }
}