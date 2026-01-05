// frontend/src/components/common/ConfirmDialog.tsx
import React from "react";
import { toastInfo } from "../../utils/toastUtils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * ConfirmDialog
 * Generic modal for confirming destructive or irreversible actions.
 * Shows consistent toast feedback for confirm/cancel.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const handleConfirm = () => {
    toastInfo(`✔️ ${confirmLabel} confirmed`);
    onConfirm();
  };

  const handleCancel = () => {
    toastInfo("Action canceled");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-darkPrimary">
            {title}
          </h2>
        </div>

        {/* Message */}
        <div className="px-6 py-4 text-sm text-text-primary dark:text-text-darkPrimary">
          {message}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-bg dark:border-bg-dark">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-reddel text-text-darkPrimary hover:bg-reddel-hover transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
