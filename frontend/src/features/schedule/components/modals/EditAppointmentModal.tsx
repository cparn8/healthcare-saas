// frontend/src/features/schedule/components/modals/EditAppointmentModal.tsx
import React, { useState, useEffect } from "react";
import Trash from "lucide-react/dist/esm/icons/trash";
import X from "lucide-react/dist/esm/icons/x";

import {
  appointmentsApi,
  AppointmentPayload,
  Appointment,
} from "../../services";

import {
  providersApi,
  Provider,
} from "../../../providers/services/providersApi";

import { toastError, toastSuccess } from "../../../../utils";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import OfficeSelect from "./forms/common/OfficeSelect";
import { LocationDTO } from "../../../locations/services/locationApi";
import AppointmentFormBase from "./forms/common/AppointmentFormBase";
import AppointmentTypeSelect from "./forms/common/AppointmentTypeSelect";
import DateTimeFields from "./forms/common/DateTimeFields";
import {
  handleOverlapDuringSave,
  detectOverlapError,
} from "../../logic/detectConflict";

interface EditAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdated: () => void;
  locations: LocationDTO[];
  appointmentTypes?: Array<{
    name: string;
    default_duration: number;
    color_code: string;
  }>;
  requestConfirm?: (message: string) => Promise<boolean>;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  onClose,
  onUpdated,
  locations,
  appointmentTypes = [],
  requestConfirm,
}) => {
  // ------------------ State ------------------
  const [formData, setFormData] = useState<AppointmentPayload>({
    ...appointment,
    office: appointment.office,
    repeat_days: appointment.repeat_days || [],
  });

  const officeSection = (
    <OfficeSelect
      value={formData.office}
      locations={locations}
      onChange={(office: string) =>
        setFormData((prev) => ({ ...prev, office }))
      }
    />
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ------------------ Providers ------------------
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setProvidersLoading(true);
        const list = await providersApi.list();
        if (!active) return;
        setProviders(list);
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
  }, []);

  // ------------------ Save ------------------
  const handleSave = async () => {
    setIsSaving(true);

    if (!formData.provider) {
      toastError("No provider selected.");
      setIsSaving(false);
      return;
    }

    if (
      formData.start_time &&
      formData.end_time &&
      formData.start_time >= formData.end_time
    ) {
      toastError("Start time must be before end time.");
      setIsSaving(false);
      return;
    }

    if (!formData.office) {
      toastError("Appointment location is missing.");
      setIsSaving(false);
      return;
    }

    try {
      // First attempt
      try {
        await appointmentsApi.update(appointment.id!, formData);
        toastSuccess("Updated successfully!");
        onUpdated();
        onClose();
        return;
      } catch (err) {
        console.error("❌ Appointment update failed (first attempt):", err);

        const allowed = await handleOverlapDuringSave(
          err,
          formData.office,
          requestConfirm
        );
        const overlapInfo = detectOverlapError(err);

        if (!allowed) {
          if (!overlapInfo.isOverlap) {
            const detail =
              (err as any)?.response?.data?.detail ||
              (err as any)?.response?.data?.provider ||
              null;

            if (detail) {
              toastError(
                typeof detail === "string"
                  ? detail
                  : "Invalid appointment data."
              );
            } else {
              toastError("Unexpected error.");
            }
          }
          return;
        }

        const overlapPayload: AppointmentPayload = {
          ...formData,
          allow_overlap: true,
        };

        await appointmentsApi.update(appointment.id!, overlapPayload);
        toastSuccess("Updated successfully (overlap allowed).");
        onUpdated();
        onClose();
      }
    } catch (finalErr) {
      console.error("❌ Appointment update failed (final):", finalErr);
      toastError("Unexpected error.");
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------ Delete ------------------
  const handleDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);

    try {
      await appointmentsApi.delete(appointment.id!);
      toastSuccess("Deleted.");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toastError("Unexpected error.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ------------------ Provider Section ------------------
  const providerSection = (
    <div>
      <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
        Provider
      </label>

      {providersLoading ? (
        <div className="border border-border dark:border-border-dark bg-input dark:bg-input-dark rounded p-2 text-text-secondary dark:text-text-darkSecondary">
          Loading providers…
        </div>
      ) : (
        <select
          className="w-full border border-border dark:border-top-dborder bg-grid-slot dark:bg-input-dlight rounded p-2"
          value={formData.provider ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              provider: Number(e.target.value) || null,
            })
          }
        >
          <option value="">Select provider</option>
          {providersError && <option disabled>{providersError}</option>}
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  // ------------------ Date/Time Section Override ------------------
  const dateTimeSection = (
    <DateTimeFields
      formData={formData}
      onChange={(patch) => setFormData({ ...formData, ...patch })}
    />
  );

  // ------------------ Extra Fields ------------------
  const extraFields = (
    <>
      {/* Appointment Type */}
      <AppointmentTypeSelect
        value={formData.appointment_type || ""}
        appointmentTypes={appointmentTypes}
        onChange={(typeObj) => {
          setFormData({
            ...formData,
            appointment_type: typeObj.name,
            color_code: typeObj.color_code,
            duration: typeObj.default_duration,
          });
        }}
      />

      {/* Chief Complaint */}
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
          Chief Complaint
        </label>
        <textarea
          className="w-full border border-border dark:border-border-dark bg-input-light dark:bg-input-dark rounded p-2"
          rows={2}
          value={formData.chief_complaint || ""}
          onChange={(e) =>
            setFormData({ ...formData, chief_complaint: e.target.value })
          }
        />
      </div>
    </>
  );

  return (
    <div className="fixed inset left-0 right-0 bottom-0 top-10 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-xl font-semibold">Edit Appointment</h2>
          <button
            className="text-text-secondary dark:text-text-darkSecondary hover:text-text-primary hover:dark:text-text-darkPrimary"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <AppointmentFormBase
            formData={formData}
            onChange={(patch) => setFormData({ ...formData, ...patch })}
            providerSection={providerSection}
            officeSection={officeSection}
            dateTimeSection={dateTimeSection}
            extraFields={extraFields}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-bg dark:border-bg-dark">
          {/* Delete */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className={`flex items-center gap-2 px-4 py-2 rounded text-input-lighter transition ${
              isDeleting
                ? "bg-gray-400 cursor-wait"
                : "bg-reddel hover:bg-reddel-hover"
            }`}
          >
            <Trash size={16} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>

          <ConfirmDialog
            open={showConfirm}
            title="Delete Appointment"
            message="Are you sure?"
            confirmLabel="Delete"
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded text-input-lighter transition ${
              isSaving
                ? "bg-bg dark:bg-bg-dark cursor-wait"
                : "bg-grncon hover:bg-grncon-hover"
            }`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
