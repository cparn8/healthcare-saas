// frontend/src/features/schedule/hooks/useScheduleFilters.ts

import { useEffect, useState } from "react";
import { ScheduleFilters as FilterState } from "../types";
import { providersApi, Provider } from "../../providers/services/providersApi";

/**
 * Centralizes:
 * - Filter state (providers/types/statuses/etc)
 * - Provider list loading
 * - Default provider filter = current provider
 */
export function useScheduleFilters(providerId: number | null) {
  const [filters, setFilters] = useState<FilterState>({
    providers: [],
    types: [],
    statuses: [],
    defaultView: "day",
    includeBlockedTimes: true,
    offices: ["north"],
  });

  const [providersList, setProvidersList] = useState<Provider[]>([]);

  // Load all providers for filter dropdowns
  useEffect(() => {
    (async () => {
      try {
        const list = await providersApi.list();
        setProvidersList(list);
      } catch (err) {
        console.error("❌ Provider list failed:", err);
        setProvidersList([]);
      }
    })();
  }, []);

  // Default provider filter = current provider if none chosen
  useEffect(() => {
    if (!providerId) return;
    setFilters((prev) => {
      if (prev.providers.length > 0) return prev;
      return { ...prev, providers: [providerId] };
    });
  }, [providerId]);

  return { filters, setFilters, providersList };
}
