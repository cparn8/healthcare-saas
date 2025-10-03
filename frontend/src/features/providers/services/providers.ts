import API from '../../../services/api';

export const getProviders = async (search?: string) => {
  const params = search ? { search } : {};
  const res = await API.get('providers/', { params });
  return res.data.results ?? res.data;
};

export const createProvider = async (data: any) => {
  const res = await API.post('providers/', data);
  return res.data;
};

export const updateProvider = async (id: number, data: any) => {
  const res = await API.put(`providers/${id}/`, data);
  return res.data;
};

export const deleteProvider = async (id: number) => {
  await API.delete(`providers/${id}/`);
};
