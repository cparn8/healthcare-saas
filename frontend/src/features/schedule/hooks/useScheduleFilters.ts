// frontend/src/features/schedule/hooks/useScheduleFilters.ts

import { useEffect, useState } from "react";
import { ScheduleFilters as FilterState } from "../types";
import { providersApi, Provider } from "../../providers/services/providersApi";

/**
 * Centralizes:
 * - In-memory filter state (providers/types/statuses/etc)
 * - Provider list loading
 * - Default provider filter = current provider (when nothing chosen yet)
 *
 * NOTE:
 * Persistence (localStorage) is handled in ScheduleFilters.tsx via localFilters.
 * This hook simply exposes the current filters and a setter.
 */
export function useScheduleFilters(providerId: number | null) {
  const [filters, setFilters] = useState<FilterState>({
    providers: [],
    types: [],
    statuses: [],
    defaultView: "week",
    includeBlockedTimes: true,
    offices: ["north"], // still present in type but not used for filtering
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

  /**
   * Load persisted filters for this provider from localStorage
   * (runs when providerId becomes available).
   */
  useEffect(() => {
    if (!providerId || typeof window === "undefined") return;

    const key = `scheduleFilters_${providerId}`;
    const saved = window.localStorage.getItem(key);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<FilterState>;

      setFilters((prev) => ({
        ...prev,
        ...parsed,
        providers: Array.isArray(parsed.providers)
          ? parsed.providers
          : prev.providers,
        types: Array.isArray(parsed.types) ? parsed.types : prev.types,
        statuses: Array.isArray(parsed.statuses)
          ? (parsed.statuses as FilterState["statuses"])
          : prev.statuses,
        defaultView: parsed.defaultView ?? prev.defaultView,
        includeBlockedTimes:
          typeof parsed.includeBlockedTimes === "boolean"
            ? parsed.includeBlockedTimes
            : prev.includeBlockedTimes,
        // offices is ignored by filtering; we keep it for backward compatibility only
      }));
    } catch (err) {
      console.error("❌ Failed to parse saved schedule filters:", err);
    }
  }, [providerId]);

  /**
   * Default provider filter = current provider if none chosen
   * (only applies when nothing is loaded / chosen yet).
   */
  useEffect(() => {
    if (!providerId) return;
    setFilters((prev) => {
      if (prev.providers.length > 0) return prev;
      return { ...prev, providers: [providerId] };
    });
  }, [providerId]);

  /**
   * Persist current filters per provider whenever they change.
   */
  useEffect(() => {
    if (!providerId || typeof window === "undefined") return;

    const key = `scheduleFilters_${providerId}`;
    window.localStorage.setItem(key, JSON.stringify(filters));
  }, [providerId, filters]);

  return { filters, setFilters, providersList };
}
