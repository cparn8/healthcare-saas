import API from './api';

export const getPatients = async (search?: string) => {
  const params = search ? { search } : {};
  const res = await API.get('patients/', { params });
  return res.data.results ?? res.data;
};

export const getPatient = async (id: number) => {
  const res = await API.get(`patients/${id}/`);
  return res.data;
};

export const createPatient = async (data: any) => {
  const res = await API.post('patients/', data);
  return res.data;
};

export const updatePatient = async (id: number, data: any) => {
  const res = await API.put(`patients/${id}/`, data);
  return res.data;
};

export const deletePatient = async (id: number) => {
  await API.delete(`patients/${id}/`);
};
