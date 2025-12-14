// frontend/src/features/schedule/components/modals/forms/common/AppointmentFormBase.tsx

import React from "react";
import { AppointmentPayload } from "../../../../services";
import DateTimeFields from "./DateTimeFields";

interface AppointmentFormBaseProps {
  formData: AppointmentPayload;
  onChange: (patch: Partial<AppointmentPayload>) => void;

  /** Custom sections injected by the parent */
  providerSection?: React.ReactNode;
  officeSection?: React.ReactNode;
  dateTimeSection?: React.ReactNode;
  extraFields?: React.ReactNode;
}

/**
 * Shared layout wrapper for appointment workflows.
 * Structural only. No data assumptions.
 */
const AppointmentFormBase: React.FC<AppointmentFormBaseProps> = ({
  formData,
  onChange,
  providerSection,
  officeSection,
  dateTimeSection,
  extraFields,
}) => {
  return (
    <div className="space-y-6">
      {/* ---------------- Provider (optional) ---------------- */}
      {providerSection && <div>{providerSection}</div>}

      {/* ---------------- Office (MUST be injected) ---------------- */}
      {officeSection && <div>{officeSection}</div>}

      {/* ---------------- Date + Time ---------------- */}
      {dateTimeSection ?? (
        <DateTimeFields
          formData={formData}
          onChange={(patch) => onChange(patch)}
        />
      )}

      {/* ---------------- Extra Fields ---------------- */}
      {extraFields ? <div className="space-y-4">{extraFields}</div> : null}
    </div>
  );
};

export default AppointmentFormBase;
