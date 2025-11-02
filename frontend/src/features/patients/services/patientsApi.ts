// frontend/src/features/patients/services/patientsApi.ts
import API from '../../../services/api';

export const patientsApi = {
  async search(query: string) {
    const response = await API.get('/patients/', { params: { search: query } });
    return response.data;
  },

  async list() {
    const response = await API.get('/patients/');
    return response.data;
  },

  async get(id: number) {
    const response = await API.get(`/patients/${id}/`);
    return response.data;
  },
};
