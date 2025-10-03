// Normalizes Django REST Framework validation errors to { field: "message" }
export function normalizeDRFErrors(data: any): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data || typeof data !== 'object') return errors;
  Object.keys(data).forEach((k) => {
    const v = (data as any)[k];
    if (Array.isArray(v)) errors[k] = String(v[0]);
    else if (typeof v === 'string') errors[k] = v;
    else errors[k] = 'Invalid value';
  });
  return errors;
}
