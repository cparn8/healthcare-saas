import { useEffect, useState } from "react";
import { providersApi, Provider } from "../services/providersApi";

export const useProvidersList = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch providers with debounced search
  useEffect(() => {
    let active = true;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const list = await providersApi.list(search || undefined);
        if (!active) return;
        setProviders(list);
        setError(null);
      } catch (err) {
        if (!active) return;
        console.error("Error fetching providers:", err);
        setError("Failed to load providers.");
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [search]);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await providersApi.list(search || undefined);
      setProviders(list);
      setError(null);
    } catch (err) {
      console.error("Error refreshing providers:", err);
      setError("Failed to load providers.");
    } finally {
      setLoading(false);
    }
  };

  return {
    providers,
    setProviders,
    loading,
    error,
    search,
    setSearch,
    deletingId,
    setDeletingId,
    refresh,
  };
};
