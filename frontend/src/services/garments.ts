import api from './api';
import { Garment } from '../types';

export const garmentService = {
  getAll: async (category?: string): Promise<Garment[]> => {
    const params = category ? { category } : {};
    const response = await api.get('/garments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Garment> => {
    const response = await api.get(`/garments/${id}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<Garment> => {
    const response = await api.post('/garments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/garments/${id}`);
  },
};
