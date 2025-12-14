import { useEffect, useState } from "react";

const STORAGE_KEY_PREFIX = "selectedLocations";

interface UseOfficePersistenceResult {
  primaryOffice: string | null;
  selectedOffices: string[];
  setSelectedOffices: (slugs: string[]) => void;
}

/**
 * Encapsulates:
 * - Loading selected location slugs per provider from localStorage
 * - Persisting changes
 * - Deriving a primary office from the first selected location
 */
export function useOfficePersistence(
  providerId: number | null
): UseOfficePersistenceResult {
  const [selectedOffices, setSelectedOfficesState] = useState<string[]>([]);

  // Restore from localStorage when providerId changes
  useEffect(() => {
    if (!providerId || typeof window === "undefined") return;

    const key = `${STORAGE_KEY_PREFIX}_${providerId}`;
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      setSelectedOfficesState([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSelectedOfficesState(parsed.filter((v) => typeof v === "string"));
      } else {
        setSelectedOfficesState([]);
      }
    } catch {
      // ignore malformed data
      setSelectedOfficesState([]);
    }
  }, [providerId]);

  // Persist selected offices
  const setSelectedOffices = (slugs: string[]) => {
    setSelectedOfficesState(slugs);

    if (!providerId || typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}_${providerId}`;
    window.localStorage.setItem(key, JSON.stringify(slugs));
  };

  const primaryOffice = selectedOffices.length > 0 ? selectedOffices[0] : null;

  return {
    primaryOffice,
    selectedOffices,
    setSelectedOffices,
  };
}
