export type PatientPayload = {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // ISO yyyy-mm-dd
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+\-\s()]{7,20}$/;

export function validatePatient(p: PatientPayload) {
  const errors: Record<string, string> = {};
  if (!p.first_name?.trim()) errors.first_name = 'First name is required';
  if (!p.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!p.date_of_birth) errors.date_of_birth = 'DOB is required';
  if (p.email && !emailRe.test(p.email)) errors.email = 'Invalid email';
  if (p.phone && !phoneRe.test(p.phone)) errors.phone = 'Invalid phone';
  return errors;
}
