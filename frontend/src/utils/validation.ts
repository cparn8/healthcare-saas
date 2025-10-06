export type PatientPayload = {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // ISO yyyy-mm-dd
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type ProviderPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+\-\s()]{7,20}$/;

export function validatePatient(p: PatientPayload) {
  const errors: Record<string, string> = {};

  if (!p.first_name?.trim()) errors.first_name = 'First name is required';
  if (!p.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!p.date_of_birth) errors.date_of_birth = 'Date of birth is required';
  if (p.email && !emailRe.test(p.email)) errors.email = 'Invalid email';
  if (p.phone && !phoneRe.test(p.phone)) errors.phone = 'Invalid phone number';

  return errors;
}

export function validateProvider(p: ProviderPayload) {
  const errors: Record<string, string> = {};

  if (!p.first_name?.trim()) errors.first_name = 'First name is required';
  if (!p.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!p.specialty?.trim()) errors.specialty = 'Specialty is required';
  if (p.email && !emailRe.test(p.email)) errors.email = 'Invalid email';
  if (p.phone && !phoneRe.test(p.phone)) errors.phone = 'Invalid phone number';

  return errors;
}
