// frontend/src/features/schedule/components/grid/logic/labels.ts
import { Appointment } from "../../../services";

export interface ProviderLike {
  id?: number;
  first_name: string;
  last_name: string;
}

export function formatOfficeLabel(
  offices: string[],
  fallbackOffice: string
): string {
  return offices.length > 1 ? offices.join(", ") : fallbackOffice;
}

export function formatProviderLabel(
  providers: ProviderLike[],
  providerFilter: number[]
): string {
  if (providerFilter.length > 0 && providerFilter.length === providers.length) {
    return "All Providers";
  }
  const selected = providers.filter(
    (p) => p.id && providerFilter.includes(p.id)
  );

  if (selected.length === 0) {
    return "No Providers";
  }

  return selected.map((p) => `${p.first_name} ${p.last_name}`).join(", ");
}

export function buildAppointmentTooltip(appt: Appointment): string | undefined {
  if (appt.is_block) return undefined;

  const parts: string[] = [];

  // Line 1 – patient (already includes PRN formatting in patient_name)
  parts.push(appt.patient_name || "(No Patient)");

  // Line 2 – appointment type
  if (appt.appointment_type) {
    parts.push(appt.appointment_type);
  }

  // Line 3 – provider + office
  const meta: string[] = [];

  if (appt.provider_name) {
    meta.push(`Provider: ${appt.provider_name}`);
  }

  if (appt.office) {
    meta.push(`Office: ${appt.office}`);
  }

  if (meta.length > 0) {
    parts.push(meta.join(" • "));
  }

  return parts.join("\n");
}
