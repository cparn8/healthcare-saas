// labels.ts
// Shared label helpers for Day & Week grids.

export function formatOfficeLabel(
  offices: string[],
  fallbackOffice: string
): string {
  const toLabel = (k: string) =>
    k === "south" ? "South Office" : k === "north" ? "North Office" : k;

  return offices.length > 1
    ? offices.map(toLabel).join(", ")
    : toLabel(fallbackOffice);
}
