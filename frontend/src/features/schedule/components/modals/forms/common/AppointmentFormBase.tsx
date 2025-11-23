// frontend/src/features/schedule/components/modals/forms/common/AppointmentFormBase.tsx

import React from "react";
import { AppointmentPayload } from "../../../../services";

import OfficeSelect from "./OfficeSelect";
import DateTimeFields from "./DateTimeFields";

interface AppointmentFormBaseProps {
  formData: AppointmentPayload;
  onChange: (patch: Partial<AppointmentPayload>) => void;
  onCancel?: () => void;

  /** Custom sections injected by the parent */
  providerSection?: React.ReactNode;
  officeSection?: React.ReactNode;
  dateTimeSection?: React.ReactNode;
  extraFields?: React.ReactNode;
}

/**
 * Shared layout wrapper for appointment workflows.
 * Neutral, minimal, and responsible only for structure.
 * Parents inject actual content.
 */
const AppointmentFormBase: React.FC<AppointmentFormBaseProps> = ({
  formData,
  onChange,
  onCancel,
  providerSection,
  officeSection,
  dateTimeSection,
  extraFields,
}) => {
  return (
    <div className="space-y-6">
      {/* ---------------- Provider (optional) ---------------- */}
      {providerSection && <div>{providerSection}</div>}

      {/* ---------------- Office ---------------- */}
      {officeSection ?? (
        <OfficeSelect
          value={formData.office}
          onChange={(office) => onChange({ office })}
        />
      )}

      {/* ---------------- Date + Time ---------------- */}
      {dateTimeSection ?? (
        <DateTimeFields
          formData={formData}
          onChange={(patch) => onChange(patch)}
        />
      )}

      {/* ---------------- Extra Fields ---------------- */}
      {extraFields ? <div className="space-y-4">{extraFields}</div> : null}

      {/* ---------------- Optional Cancel Button ---------------- */}
      {onCancel && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentFormBase;
