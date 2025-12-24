import React from "react";
import FormField from "../../../../components/ui/FormField";

export interface ProviderFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specialty?: string;
  password?: string;
  confirm_password?: string;
}

interface ProviderFormProps {
  values: ProviderFormValues;
  errors?: Record<string, string>;
  includePasswordFields?: boolean;
  onChange: (patch: Partial<ProviderFormValues>) => void;
}

/**
 * Pure presentational Provider form.
 * - No API calls
 * - No submit button
 * - Parent (modal) owns state, validation, and submit handling.
 */
const ProviderForm: React.FC<ProviderFormProps> = ({
  values,
  errors = {},
  includePasswordFields = false,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          type="text"
          label="First Name"
          className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark "
          value={values.first_name}
          error={errors.first_name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ first_name: e.target.value })
          }
        />
        <FormField
          type="text"
          label="Last Name"
          className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
          value={values.last_name}
          error={errors.last_name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ last_name: e.target.value })
          }
        />
      </div>

      {/* Contact row */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          type="email"
          label="Email"
          className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
          value={values.email}
          error={errors.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ email: e.target.value })
          }
        />
        <FormField
          type="text"
          label="Phone"
          className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
          value={values.phone ?? ""}
          error={errors.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ phone: e.target.value })
          }
        />
      </div>

      {/* Specialty */}
      <FormField
        type="text"
        label="Specialty"
        className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
        value={values.specialty ?? ""}
        error={errors.specialty}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ specialty: e.target.value })
        }
      />

      {/* Password fields (for Add Provider and admin resets if desired) */}
      {includePasswordFields && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            type="password"
            label="Password"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={values.password ?? ""}
            error={errors.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({ password: e.target.value })
            }
          />
          <FormField
            type="password"
            label="Confirm Password"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={values.confirm_password ?? ""}
            error={errors.confirm_password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({ confirm_password: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
};

export default ProviderForm;
