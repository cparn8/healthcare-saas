// frontend/src/features/schedule/hooks/useOfficePersistence.ts

import { useEffect, useState } from "react";

export type OfficeKey = "north" | "south";

interface UseOfficePersistenceResult {
  office: OfficeKey;
  selectedOffices: OfficeKey[];
  setOffice: React.Dispatch<React.SetStateAction<OfficeKey>>;
  setSelectedOffices: React.Dispatch<React.SetStateAction<OfficeKey[]>>;
}

function isOfficeKey(value: unknown): value is OfficeKey {
  return value === "north" || value === "south";
}

/**
 * Encapsulates:
 * - Loading last office per provider from localStorage
 * - Loading multi-select offices per provider
 * - Persisting changes
 * - Keeping legacy `office` in sync with first selected office
 */
export function useOfficePersistence(
  providerId: number | null,
  initialOffice: OfficeKey = "north"
): UseOfficePersistenceResult {
  const [office, setOffice] = useState<OfficeKey>(initialOffice);
  const [selectedOffices, setSelectedOffices] = useState<OfficeKey[]>([
    initialOffice,
  ]);

  // Restore from localStorage when providerId changes
  useEffect(() => {
    if (!providerId || typeof window === "undefined") return;

    // Base office
    const officeKey = `lastOffice_${providerId}`;
    const storedOffice = window.localStorage.getItem(officeKey);
    let baseOffice: OfficeKey = initialOffice;

    if (isOfficeKey(storedOffice)) {
      baseOffice = storedOffice;
    }

    setOffice(baseOffice);

    // Selected offices
    const selectedKey = `selectedOffices_${providerId}`;
    const raw = window.localStorage.getItem(selectedKey);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(isOfficeKey);
          if (valid.length > 0) {
            setSelectedOffices(valid);
            return;
          }
        }
      } catch {
        // ignore malformed data
      }
    }

    // Fallback: just the base office
    setSelectedOffices([baseOffice]);
  }, [providerId, initialOffice]);

  // Persist office
  useEffect(() => {
    if (!providerId || typeof window === "undefined") return;
    const key = `lastOffice_${providerId}`;
    window.localStorage.setItem(key, office);
  }, [providerId, office]);

  // Persist selected offices
  useEffect(() => {
    if (!providerId || typeof window === "undefined") return;
    const key = `selectedOffices_${providerId}`;
    window.localStorage.setItem(key, JSON.stringify(selectedOffices));
  }, [providerId, selectedOffices]);

  // Keep legacy `office` aligned with first selected office
  useEffect(() => {
    if (selectedOffices.length === 0) return;
    const first = selectedOffices[0];
    if (first !== office) {
      setOffice(first);
    }
  }, [selectedOffices, office]);

  return { office, selectedOffices, setOffice, setSelectedOffices };
}
