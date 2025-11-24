import api from './api';
import { TryOn } from '../types';

export const tryOnService = {
  getAll: async (): Promise<TryOn[]> => {
    const response = await api.get('/try-ons');
    return response.data;
  },

  getById: async (id: string): Promise<TryOn> => {
    const response = await api.get(`/try-ons/${id}`);
    return response.data;
  },

  create: async (bodyImageId: string, outfitId?: string, garmentIds?: string[]): Promise<TryOn> => {
    const response = await api.post('/try-ons', { bodyImageId, outfitId, garmentIds });
    return response.data;
  },
};
