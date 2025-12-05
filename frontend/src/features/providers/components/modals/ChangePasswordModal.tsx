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

  const handleSave = async () => {
    if (!canChange) {
      toastError("You do not have permission to change this password.");
      return;
    }
    if (!targetProvider.id) {
      toastError("Invalid provider.");
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Change Password – {targetProvider.first_name}{" "}
            {targetProvider.last_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {!canChange && (
            <p className="text-sm text-red-600">
              You do not have permission to change this provider&apos;s
              password.
            </p>
          )}

          <FormField
            type="password"
            name="password"
            label="New Password"
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
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            error={fieldErrors.confirm_password}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || !canChange}
            className={`px-4 py-2 rounded text-white transition ${
              submitting || !canChange
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
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
