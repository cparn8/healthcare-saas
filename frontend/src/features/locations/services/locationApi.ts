// frontend/src/features/locations/services/locationApi.ts
import API from "../../../services/api"; // USE THE EXISTING CLIENT

export interface LocationHoursDTO {
  weekday: string; // "mon" ..."sun"
  open: boolean;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface LocationDTO {
  id: number;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  hours: LocationHoursDTO[];
}

export interface BusinessSettingsDTO {
  id: number;
  name: string | null;
  show_name_in_nav: boolean;
}

/* -------------------- Locations API ---------------------- */

export async function getAllLocations(): Promise<LocationDTO[]> {
  const res = await API.get("/locations/");
  return res.data;
}

export async function getLocationHours(
  id: number
): Promise<LocationHoursDTO[]> {
  const res = await API.get(`/locations/${id}/`);
  return res.data.hours || [];
}

export async function createLocation(
  payload: Partial<LocationDTO>
): Promise<LocationDTO> {
  const res = await API.post("/locations/", payload);
  return res.data;
}

export async function updateLocation(
  id: number,
  payload: Partial<LocationDTO>
): Promise<LocationDTO> {
  const res = await API.patch(`/locations/${id}/`, payload);
  return res.data;
}

export async function updateLocationHours(
  id: number,
  hours: LocationHoursDTO[]
): Promise<LocationDTO> {
  const res = await API.patch(`/locations/${id}/hours/`, { hours });
  return res.data;
}

export async function deleteLocation(id: number): Promise<void> {
  await API.delete(`/locations/${id}/`);
}

/* -------------------- Business Settings API ---------------------- */

export async function getBusinessSettings(): Promise<BusinessSettingsDTO> {
  const res = await API.get("/business/settings/");
  return res.data;
}

export async function updateBusinessSettings(
  payload: Partial<BusinessSettingsDTO>
): Promise<BusinessSettingsDTO> {
  const res = await API.patch("/business/settings/", payload);
  return res.data;
}
