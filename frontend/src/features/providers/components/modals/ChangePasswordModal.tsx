// frontend/src/features/providers/components/modals/ChangePasswordModal.tsx
import React, { useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import FormField from "../../../../components/ui/FormField";
import { providersApi, Provider } from "../../services/providersApi";
import { toastError, toastSuccess } from "../../../../utils/toastUtils";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  targetProvider: Provider | null;
  currentProvider: Provider | null;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
  targetProvider,
  currentProvider,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!open || !targetProvider) return null;

  const isAdmin =
    !!currentProvider &&
    !!(
      currentProvider.is_admin === true ||
      currentProvider.is_staff === true ||
      currentProvider.is_superuser === true
    );

  const isSelf = !!currentProvider && currentProvider.id === targetProvider.id;

  const canChange = isAdmin || isSelf;

  const PASSWORD_REQUIREMENTS =
    "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";

  function isPasswordValid(value: string): boolean {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    return value.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
  }

  const handleSave = async () => {
    if (!canChange) {
      toastError("You do not have permission to change this password.");
      return;
    }
    if (!targetProvider.id) {
      toastError("Invalid provider.");
      return;
    }
    if (password !== confirmPassword) {
      toastError("Password fields do not match.");
      return;
    }
    if (!isPasswordValid(password)) {
      toastError(PASSWORD_REQUIREMENTS);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      const payload: Partial<Provider> = {
        password,
        confirm_password: confirmPassword,
      };

      await providersApi.update(targetProvider.id, payload);
      toastSuccess("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: any) {
      console.error("Change password error", err);
      if (err && typeof err === "object") {
        setFieldErrors(err as Record<string, string>);
      } else {
        toastError("Failed to update password.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-darkPrimary">
            Change Password – {targetProvider.first_name}{" "}
            {targetProvider.last_name}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {!canChange && (
            <p className="text-sm text-reddel">
              You do not have permission to change this provider&apos;s
              password.
            </p>
          )}

          <FormField
            type="password"
            name="password"
            label="New Password"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            error={fieldErrors.password}
          />

          <FormField
            type="password"
            name="confirm_password"
            label="Confirm Password"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            error={fieldErrors.confirm_password}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-bg dark:border-bg-dark">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || !canChange}
            className={`px-4 py-2 rounded text-input-lighter transition ${
              submitting || !canChange
                ? "bg-top dark:bg-top-dark cursor-not-allowed"
                : "bg-grncon hover:bg-grncon-hover"
            }`}
          >
            {submitting ? "Saving..." : "Save Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
