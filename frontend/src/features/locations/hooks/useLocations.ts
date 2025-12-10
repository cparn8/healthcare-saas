// frontend/src/features/locations/hooks/useLocations.ts

import { useEffect, useState, useCallback } from "react";
import { getAllLocations, LocationDTO } from "../services/locationApi";
import { toastError } from "../../../utils";

interface UseLocationsResult {
  locations: LocationDTO[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllLocations();

      const list: LocationDTO[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.results)
        ? (data as any).results
        : [];

      setLocations(list);
    } catch (err) {
      console.error("❌ Failed to load locations:", err);
      setError("Failed to load locations.");
      toastError("Failed to load locations.");
      setLocations([]); // keep it a safe array
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { locations, loading, error, reload };
}
