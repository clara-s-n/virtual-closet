import api from './api';
import { Outfit } from '../types';

export const outfitService = {
  getAll: async (): Promise<Outfit[]> => {
    const response = await api.get('/outfits');
    return response.data;
  },

  getById: async (id: string): Promise<Outfit> => {
    const response = await api.get(`/outfits/${id}`);
    return response.data;
  },

  create: async (name: string, garmentIds: string[]): Promise<Outfit> => {
    const response = await api.post('/outfits', { name, garmentIds });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/outfits/${id}`);
  },
};
