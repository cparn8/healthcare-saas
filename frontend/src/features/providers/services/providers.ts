// frontend/src/features/providers/services/providers.ts
import API from "../../../services/api";
import { normalizeDRFErrors } from "../../../utils/apiErrors";
import type { Provider } from "./providersApi";

export const getProviders = async (search?: string): Promise<Provider[]> => {
  const params = search ? { search } : {};
  const res = await API.get("providers/", { params });
  return res.data.results ?? res.data;
};

export const getProvider = async (id: number): Promise<Provider> => {
  const res = await API.get(`providers/${id}/`);
  return res.data;
};

export const createProvider = async (
  data: Partial<Provider>
): Promise<Provider> => {
  try {
    const res = await API.post("providers/", data);
    return res.data;
  } catch (err: any) {
    if (err.response?.data) throw normalizeDRFErrors(err.response.data);
    throw err;
  }
};

export const updateProvider = async (
  id: number,
  data: Partial<Provider>
): Promise<Provider> => {
  try {
    const res = await API.put(`providers/${id}/`, data);
    return res.data;
  } catch (err: any) {
    if (err.response?.data) throw normalizeDRFErrors(err.response.data);
    throw err;
  }
};

export const deleteProvider = async (id: number): Promise<void> => {
  await API.delete(`providers/${id}/`);
};
