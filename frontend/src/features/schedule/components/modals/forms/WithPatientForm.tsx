// frontend/src/features/schedule/components/modals/forms/WithPatientForm.tsx
import React, { useState, useEffect } from "react";
import Search from "lucide-react/dist/esm/icons/search";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";

import API from "../../../../../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  providersApi,
  Provider,
} from "../../../../providers/services/providersApi";

import { AppointmentPayload } from "../../../services";
import { usePrefilledAppointmentFields } from "../../../hooks";
import { LocationDTO } from "../../../../locations/services/locationApi";

import ProviderSelect from "./common/ProviderSelect";
import AppointmentTypeSelect from "./common/AppointmentTypeSelect";
import RepeatSection from "./common/RepeatSection";
import OfficeSelect from "./common/OfficeSelect";

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
  onCancel?: () => void;
  onGetFormData?: (data: AppointmentPayload) => void;
  providerId?: number | null;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  primaryOfficeSlug?: string | null;
  locations: LocationDTO[];
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
  primaryOfficeSlug,
  locations,
  initialPatient,
  appointmentTypes = [],
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /** Prefill from slot selection */
  const prefilled = usePrefilledAppointmentFields({
    initialDate,
    initialStartTime,
    initialEndTime,
    appointmentTypes,
    initialTypeName: appointmentTypes[0]?.name,
  });

  /** ----------------------------- State ----------------------------- */
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    initialPatient ?? null
  );

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  /** Providers */
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);

  /** Core appointment form data */
  const [formData, setFormData] = useState<AppointmentPayload>({
    patient: initialPatient?.id ?? null,
    provider: providerId ?? null,
    office: primaryOfficeSlug ?? "",
    appointment_type: appointmentTypes[0]?.name ?? "",
    color_code: appointmentTypes[0]?.color_code ?? "#FF6B6B",
    chief_complaint: "",
    notes: "",
    date: prefilled.date,
    start_time: prefilled.start_time,
    end_time: prefilled.end_time,
    duration: prefilled.duration,
    is_recurring: false,
    repeat_days: [],
    repeat_interval_weeks: 1,
    repeat_end_date: "",
    repeat_occurrences: 1,
    is_block: false,
    send_intake_form: false,
  });

  /** ----------------------------- Effects ----------------------------- */

  /** Fetch providers */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setProvidersLoading(true);
        const list = await providersApi.list();
        if (!active) return;
        setProviders(list);
      } catch (err) {
        setProvidersError("Failed to load providers.");
        console.error(err);
      } finally {
        if (active) setProvidersLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!primaryOfficeSlug) return;

    setFormData((prev) => {
      // Only auto-set if the user hasn’t manually changed it
      if (prev.office && prev.office !== primaryOfficeSlug) return prev;

      return {
        ...prev,
        office: primaryOfficeSlug,
      };
    });
  }, [primaryOfficeSlug]);

  /** Prefill from initial slot */
  useEffect(() => {
    setFormData((p) => ({
      ...p,
      date: prefilled.date,
      start_time: prefilled.start_time,
      end_time: prefilled.end_time,
    }));
  }, [prefilled]);

  /** Handle patient selection → update patient id */
  useEffect(() => {
    if (selectedPatient) {
      setFormData((p) => ({ ...p, patient: selectedPatient.id }));
    }
  }, [selectedPatient]);

  /** Bubble form data upward */
  useEffect(() => {
    onGetFormData?.(formData);
  }, [formData, onGetFormData]);

  /** Debounced patient search */
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
        console.error("Patient search error", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  /** Redirect-to-new-patient support */
  useEffect(() => {
    const newId = searchParams.get("newPatientId");
    if (!newId) return;
    (async () => {
      try {
        const res = await API.get(`/patients/${newId}/`);
        setSelectedPatient(res.data);
      } catch (err) {
        console.error("Failed to load new patient", err);
      }
    })();
  }, [searchParams]);

  /** ----------------------------- Helpers ----------------------------- */

  const handleChange = (patch: Partial<AppointmentPayload>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  /** ----------------------------- Render ----------------------------- */

  const patientSection = (
    <div className="space-y-4">
      {!selectedPatient ? (
        <div className="relative">
          <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
            Search Patient
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-border dark:border-border-dark bg-input-light dark:bg-input-dark rounded p-2 pl-8"
              placeholder="Search by name, phone, PRN, or DOB"
            />
            <Search
              className="absolute left-2 top-2.5 text-text-muted dark:text-text-darkMuted"
              size={18}
            />
          </div>

          {loading && (
            <div className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1">
              Searching...
            </div>
          )}

          {results.length > 0 && (
            <div className="absolute bg-input dark:bg-input-dark border border-border dark:border-border-dark rounded w-full shadow-md mt-1 max-h-56 overflow-y-auto z-20">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient(p);
                    setQuery("");
                    setResults([]);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-bg hover:dark:bg-bg-dark text-sm"
                >
                  <div className="font-medium">
                    {p.first_name} {p.last_name}
                  </div>
                  <div className="text-xs text-text-muted dark:text-text-darkMuted">
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
            className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition"
          >
            <UserPlus size={16} /> Add New Patient
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="font-semibold text-text-primary dark:text-text-darkPrimary text-sm">
              {selectedPatient.first_name} {selectedPatient.last_name}
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-reddel hover:underline text-sm"
            >
              Remove
            </button>
          </div>
          <div className="text-xs text-text-secondary dark:text-text-darkSecondary">
            PRN: {selectedPatient.prn} • DOB: {selectedPatient.date_of_birth}
            {selectedPatient.phone && <> • Phone: {selectedPatient.phone}</>}
          </div>
        </div>
      )}
    </div>
  );

  const providerSection = (
    <ProviderSelect
      providers={providers}
      loading={providersLoading}
      error={providersError}
      value={formData.provider ?? null}
      onChange={(providerId) => handleChange({ provider: providerId })}
    />
  );

  const officeSection = (
    <OfficeSelect
      value={formData.office}
      locations={locations}
      onChange={(office: string) => handleChange({ office })}
    />
  );

  const dateTimeRow = (
    <div className="grid grid-cols-4 gap-4 items-end">
      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
          Date
        </label>
        <input
          type="date"
          value={formData.date || ""}
          onChange={(e) => handleChange({ date: e.target.value })}
          className="w-full border border-border dark:border-border-dark bg-input-light dark:bg-input-dark rounded p-2"
        />
      </div>

      {/* Start Time */}
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
          Start Time
        </label>
        <input
          type="time"
          step="60"
          value={formData.start_time || ""}
          onChange={(e) => handleChange({ start_time: e.target.value })}
          className="w-full border border-border dark:border-border-dark bg-input-light dark:bg-input-dark rounded p-2"
        />
      </div>

      {/* End Time */}
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
          End Time
        </label>
        <input
          type="time"
          step="60"
          value={formData.end_time || ""}
          onChange={(e) => handleChange({ end_time: e.target.value })}
          className="w-full border border-border dark:border-border-dark bg-input-light dark:bg-input-dark rounded p-2"
        />
      </div>

      {/* Repeat toggle */}
      <label className="flex items-center gap-2 mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.is_recurring || false}
          onChange={(e) => handleChange({ is_recurring: e.target.checked })}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-text-primary dark:text-text-darkPrimary">
          Repeat
        </span>
      </label>
    </div>
  );

  return (
    <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Patient search / selection */}
      {patientSection}

      <hr className="border-border dark:border-border-dark" />

      {/* Provider + Office on same row */}
      <div className="grid grid-cols-2 gap-4">
        {providerSection}
        {officeSection}
      </div>

      {/* Date / Time / Repeat toggle row */}
      {dateTimeRow}

      {/* Repeat configuration section, directly under date/time row */}
      {formData.is_recurring && (
        <RepeatSection
          enabled={!!formData.is_recurring}
          formData={formData}
          onToggle={(checked) => handleChange({ is_recurring: checked })}
          onChange={(patch) => handleChange(patch)}
          hideHeaderToggle={true}
        />
      )}

      {/* Appointment type */}
      <AppointmentTypeSelect
        appointmentTypes={appointmentTypes}
        value={formData.appointment_type}
        onChange={(t) =>
          handleChange({
            appointment_type: t.name,
            color_code: t.color_code,
            duration: t.default_duration,
          })
        }
      />

      {/* Chief Complaint */}
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
          Chief Complaint
        </label>
        <textarea
          className="w-full border border-border dark:border-border-dark bg-input-light dark:bg-input-dark rounded p-2"
          rows={2}
          value={formData.chief_complaint ?? ""}
          onChange={(e) => handleChange({ chief_complaint: e.target.value })}
        />
      </div>
    </div>
  );
};

export default WithPatientForm;
