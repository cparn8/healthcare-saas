// frontend/src/features/providers/hooks/useCurrentProvider.ts
import { useEffect, useState } from "react";
import { providersApi, Provider } from "../services/providersApi";

interface UseCurrentProviderResult {
  provider: Provider | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
}

export const useCurrentProvider = (): UseCurrentProviderResult => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const data = await providersApi.getCurrent();
        if (!active) return;
        setProvider(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load current provider", err);
        if (active) setError("Failed to load provider context.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const isAdmin =
    !!provider &&
    !!(
      provider.is_admin === true ||
      provider.is_staff === true ||
      provider.is_superuser === true
    );

  return { provider, loading, error, isAdmin };
};
