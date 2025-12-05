import { useEffect, useState } from "react";
import { getPatients } from "../services/patients";
import { toastError } from "../../../utils/toastUtils";

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  prn: string;
  date_of_birth: string;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  profile_picture?: string | null;
}

export const usePatientsList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatients(query);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load patients", err);
      setError("Failed to load patients.");
      toastError("Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      await loadPatients(search);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const refresh = () => loadPatients(search);

  const addLocal = (p: Patient) => {
    setPatients((prev) => [...prev, p]);
  };

  const updateLocal = (p: Patient) => {
    setPatients((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  };

  const removeLocal = (id: number) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    patients,
    loading,
    error,
    search,
    setSearch,
    refresh,
    addLocal,
    updateLocal,
    removeLocal,
  };
};
