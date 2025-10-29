import API from '../../../services/api';

export interface Provider {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialty: string;
  phone?: string;
  profile_picture?: string;
}

export const providersApi = {
  async getCurrent(): Promise<Provider> {
    const res = await API.get('/auth/me/');
    return res.data;
  },

  async list(): Promise<Provider[]> {
    const res = await API.get('/providers/');
    return res.data;
  },
};
