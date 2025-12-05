// frontend/src/features/providers/services/providersApi.ts
import API from "../../../services/api";
import { normalizeDRFErrors } from "../../../utils/apiErrors";

export interface Provider {
  id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  profile_picture?: string;
  created_at?: string;
  username?: string;
  password?: string;
  confirm_password?: string;
  is_admin?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

/**
 * Consistent provider API with full CRUD + DRF pagination support.
 * This merges old `providers.ts` and new `providersApi.ts` patterns.
 */
export const providersApi = {
  /** Get the currently authenticated provider (used for dashboards, etc.) */
  async getCurrent(): Promise<Provider> {
    const res = await API.get("auth/me/");
    return res.data;
  },

  /** List providers (optionally with ?search= query). Handles paginated and non-paginated DRF formats. */
  async list(search?: string): Promise<Provider[]> {
    const params = search ? { search } : {};
    const res = await API.get("providers/", { params });
    return res.data.results ?? res.data;
  },

  /** Retrieve one provider by ID */
  async retrieve(id: number): Promise<Provider> {
    const res = await API.get(`providers/${id}/`);
    return res.data;
  },

  /** Create a provider (admin use) */
  async create(data: Partial<Provider>): Promise<Provider> {
    try {
      const res = await API.post("providers/", data);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) throw normalizeDRFErrors(err.response.data);
      throw err;
    }
  },

  /** Update an existing provider */
  async update(id: number, data: Partial<Provider>): Promise<Provider> {
    try {
      const res = await API.put(`providers/${id}/`, data);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) throw normalizeDRFErrors(err.response.data);
      throw err;
    }
  },

  /** Delete a provider */
  async delete(id: number): Promise<void> {
    await API.delete(`providers/${id}/`);
  },
};
