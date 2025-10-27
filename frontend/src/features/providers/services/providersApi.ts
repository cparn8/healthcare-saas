import api from '../../../services/api';

export const providersApi = {
  async getMe() {
    const res = await api.get('/auth/me/');
    return res.data;
  },
};
