// frontend/src/features/locations/hooks/useBusinessSettings.ts
import { useEffect, useState, useCallback } from "react";
import {
  getBusinessSettings,
  updateBusinessSettings,
  BusinessSettingsDTO,
} from "../services/locationApi";
import { toastError, toastSuccess } from "../../../utils";

interface UseBusinessSettingsResult {
  businessSettings: BusinessSettingsDTO | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  save: (patch: Partial<BusinessSettingsDTO>) => Promise<void>;
}

export function useBusinessSettings(): UseBusinessSettingsResult {
  const [businessSettings, setBusinessSettings] =
    useState<BusinessSettingsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBusinessSettings();
      setBusinessSettings(data);
    } catch (err) {
      console.error("❌ Failed to load business settings:", err);
      setError("Failed to load business settings.");
      toastError("Failed to load business settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (patch: Partial<BusinessSettingsDTO>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateBusinessSettings(patch);
      setBusinessSettings(updated);
      toastSuccess("Business settings updated.");
    } catch (err) {
      console.error("❌ Failed to update business settings:", err);
      setError("Failed to update business settings.");
      toastError("Failed to update business settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { businessSettings, loading, error, reload, save };
}
