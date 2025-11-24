import api from './api';
import { BodyImage } from '../types';

export const bodyImageService = {
  getAll: async (): Promise<BodyImage[]> => {
    const response = await api.get('/body-images');
    return response.data;
  },

  upload: async (file: File): Promise<BodyImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/body-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/body-images/${id}`);
  },
};
