// frontend/src/features/schedule/components/WithPatientForm.tsx
import React, { useState, useEffect } from "react";
import Search from "lucide-react/dist/esm/icons/search";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import API from "../../../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { providersApi, Provider } from "../../providers/services/providersApi";
import { usePrefilledAppointmentFields } from "../hooks/usePrefilledAppointmentFields";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  prn: string;
  date_of_birth: string;
  phone?: string;
  gender?: string;
}

interface WithPatientFormProps {
  onCancel: () => void;
  onGetFormData?: (data: any) => void;
  providerId?: number | null;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  defaultOffice?: string;
  initialPatient?: any;
  appointmentTypes?: {
    id?: number;
    name: string;
    default_duration: number;
    color_code: string;
  }[];
}

const WithPatientForm: React.FC<WithPatientFormProps> = ({
  onCancel,
  onGetFormData,
  providerId,
  initialDate,
  initialStartTime,
  initialEndTime,
  defaultOffice,
  initialPatient,
  appointmentTypes,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilled = usePrefilledAppointmentFields({
    initialDate,
    initialStartTime,
    initialEndTime,
    appointmentTypes,
    initialTypeName: appointmentTypes?.[0]?.name,
  });

  // --- Patient selection & search ---
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    initialPatient || null
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Providers (for dropdown) ---
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);

  // --- Repeat toggle ---
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  // --- Form state ---
  const [formData, setFormData] = useState({
    patient: null as number | null,
    provider: providerId ?? null,
    office: defaultOffice ?? "north",
    appointment_type: appointmentTypes?.[0]?.name || "",
    color_code: appointmentTypes?.[0]?.color_code || "#FF6B6B",
    duration: prefilled.duration,
    chief_complaint: "",
    date: prefilled.date,
    start_time: prefilled.start_time,
    end_time: prefilled.end_time,
    is_recurring: false,
    repeat_days: [] as string[],
    repeat_interval_weeks: 1,
    repeat_end_date: "",
    repeat_occurrences: 1,
    send_intake_form: false,
  });

  // -------------------------------
  // Generic field handler
  // -------------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let next: string | number | boolean = value;

    if (e.target instanceof HTMLInputElement && type === "checkbox") {
      next = e.target.checked;
    }

    if (name === "duration") next = Number(next);

    setFormData((prev) => ({
      ...prev,
      [name]: next,
    }));
  };

  // -------------------------------
  // Fetch provider list
  // -------------------------------
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setProvidersLoading(true);
        const list = await providersApi.list();
        if (!active) return;
        setProviders(list);
        if (formData.provider == null && providerId) {
          setFormData((prev) => ({ ...prev, provider: providerId }));
        }
      } catch (err) {
        if (active) {
          console.error("❌ Provider fetch error:", err);
          setProvidersError("Failed to load providers.");
        }
      } finally {
        if (active) setProvidersLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------
  // Prefill from modal-provided values
  // -------------------------------
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: prefilled.date,
      start_time: prefilled.start_time,
      end_time: prefilled.end_time,
    }));
  }, [prefilled]);

  // -------------------------------
  // Sync provider if parent prop changes later
  // -------------------------------
  useEffect(() => {
    if (providerId && formData.provider == null) {
      setFormData((p) => ({ ...p, provider: providerId }));
    }
  }, [providerId, formData.provider]);

  // -------------------------------
  // Restore new patient from sessionStorage
  // -------------------------------
  useEffect(() => {
    const stored = sessionStorage.getItem("newPatient");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSelectedPatient(parsed);
      sessionStorage.removeItem("newPatient");
    }
  }, []);

  // -------------------------------
  // Update patient id when selected
  // -------------------------------
  useEffect(() => {
    if (selectedPatient)
      setFormData((p) => ({ ...p, patient: selectedPatient.id }));
  }, [selectedPatient]);

  // -------------------------------
  // Bubble up form data
  // -------------------------------
  useEffect(() => {
    onGetFormData?.(formData);
  }, [formData, onGetFormData]);

  // -------------------------------
  // Debounced patient search
  // -------------------------------
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await API.get(
          `/patients/?search=${encodeURIComponent(query)}`
        );
        const list = res.data?.results ?? res.data ?? [];
        setResults(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("❌ Patient search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [query]);

  // -------------------------------
  // Load new patient by ID from search params
  // -------------------------------
  useEffect(() => {
    const newPatientId = searchParams.get("newPatientId");
    if (!newPatientId) return;
    (async () => {
      try {
        const res = await API.get(`/patients/${newPatientId}/`);
        setSelectedPatient(res.data);
      } catch (err) {
        console.error("❌ Failed to load new patient", err);
      }
    })();
  }, [searchParams]);

  const providerFullName = (p: Provider) =>
    `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || `Provider #${p.id}`;

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="max-h-[70vh] overflow-y-auto space-y-6 p-4">
      {/* --- Patient Section --- */}
      {!selectedPatient ? (
        <section className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Patient
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded p-2 pl-8"
              placeholder="Search by name, phone, PRN, or DOB"
            />
            <Search
              className="absolute left-2 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          {loading && (
            <div className="text-xs text-gray-500 mt-1">Searching...</div>
          )}

          {results.length > 0 && (
            <div className="absolute z-20 bg-white border rounded w-full shadow-md mt-1 max-h-56 overflow-y-auto">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient(p);
                    setQuery("");
                    setResults([]);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-blue-50 text-sm"
                >
                  <div className="font-medium">
                    {p.first_name} {p.last_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    PRN: {p.prn} • DOB: {p.date_of_birth}
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              localStorage.setItem("afterAddPatient", "/doctor/schedule");
              sessionStorage.setItem("prefillSlot", JSON.stringify(formData));
              navigate("/doctor/manage-users/patients");
            }}
            className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition"
          >
            <UserPlus size={16} /> Add New Patient
          </button>
        </section>
      ) : (
        <section>
          <div className="flex justify-between items-center mb-2 text-sm">
            <div className="font-semibold text-gray-800">
              {selectedPatient.first_name} {selectedPatient.last_name}
            </div>
            <button
              className="text-red-500 hover:underline"
              onClick={() => setSelectedPatient(null)}
            >
              Remove patient
            </button>
          </div>
          <div className="text-xs text-gray-600">
            PRN: {selectedPatient.prn} • DOB: {selectedPatient.date_of_birth}
            {selectedPatient.phone && <> • Phone: {selectedPatient.phone}</>}
          </div>
        </section>
      )}

      <hr className="border-gray-200" />

      {/* --- Appointment Details --- */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Appointment details</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Provider Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>

            {providersLoading ? (
              <div className="flex items-center gap-2 border rounded p-2 text-gray-500 bg-gray-50">
                <svg
                  className="animate-spin h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Loading providers…
              </div>
            ) : (
              <select
                name="provider"
                value={formData.provider ?? ""}
                onChange={(e) => {
                  const newProviderId = Number(e.target.value) || null;
                  setFormData((p) => ({ ...p, provider: newProviderId }));
                  onGetFormData?.({ ...formData, provider: newProviderId });
                }}
                className="w-full border rounded p-2"
              >
                <option value="">Select a provider</option>
                {providersError && <option disabled>{providersError}</option>}
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {providerFullName(p)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Office */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Office
            </label>
            <select
              name="office"
              value={formData.office}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="north">North Office</option>
              <option value="south">South Office</option>
            </select>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chief Complaint
          </label>
          <textarea
            name="chief_complaint"
            value={formData.chief_complaint}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Brief description of symptoms or reason for visit"
            rows={2}
          />
        </div>

        {/* Appointment Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Type
          </label>
          <select
            name="appointment_type"
            value={formData.appointment_type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">Select type</option>
            {appointmentTypes?.length ? (
              appointmentTypes.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.default_duration} min)
                </option>
              ))
            ) : (
              <option disabled>No types configured</option>
            )}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-4 gap-4 items-end mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Repeat Toggle */}
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={repeatEnabled}
              onChange={(e) => {
                setRepeatEnabled(e.target.checked);
                setFormData((prev) => ({
                  ...prev,
                  is_recurring: e.target.checked,
                }));
              }}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium text-gray-700">Repeat</span>
          </label>
        </div>

        {/* Repeat Section */}
        {repeatEnabled && (
          <div className="w-full mt-4 border-t border-gray-200 pt-4 text-[15px] space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-gray-800 whitespace-nowrap">
                Occurs On:
              </span>
              <div className="flex flex-row items-center gap-4 flex-wrap w-full">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <label
                      key={day}
                      className="flex items-center gap-1 text-[15px] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.repeat_days.includes(day)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.repeat_days, day]
                            : formData.repeat_days.filter((d) => d !== day);
                          setFormData((prev) => ({
                            ...prev,
                            repeat_days: updated,
                          }));
                        }}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="font-medium">{day}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-row flex-wrap items-center gap-3">
              <span className="font-semibold text-gray-800">Every</span>
              <select
                value={formData.repeat_interval_weeks}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    repeat_interval_weeks: Number(e.target.value),
                  }))
                }
                className="border rounded px-2 py-1 text-sm w-20"
              >
                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-gray-800">week(s)</span>

              <div className="h-5 border-l border-gray-300 mx-2" />

              <span className="font-semibold text-gray-800">Ends On</span>
              <input
                type="date"
                value={formData.repeat_end_date || ""}
                onChange={handleChange}
                name="repeat_end_date"
                className="border rounded px-2 py-1 text-sm"
              />

              <span className="font-semibold text-gray-800">after</span>
              <input
                type="number"
                min={1}
                name="repeat_occurrences"
                value={formData.repeat_occurrences}
                onChange={handleChange}
                className="border rounded w-20 px-2 py-1 text-sm"
              />
              <span className="text-gray-800">appointment(s)</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default WithPatientForm;
