// frontend/src/features/locations/components/ConfirmDeleteLocationModal.tsx

import React, { useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import { LocationDTO } from "../services/locationApi";

interface ConfirmDeleteLocationModalProps {
  open: boolean;
  location: LocationDTO | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const ConfirmDeleteLocationModal: React.FC<ConfirmDeleteLocationModalProps> = ({
  open,
  location,
  onCancel,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!open || !location) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset left-0 right-0 bottom-0 top-5 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-bg dark:bg-bg-dark
 rounded-lg shadow-xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-lg font-semibold text-reddel">Delete Location</h2>
          <button
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary"
            onClick={onCancel}
            disabled={deleting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm text-text-primary dark:text-text-darkPrimary">
          <p className="font-medium">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold">&quot;{location.name}&quot;</span>?
          </p>

          <p>
            This action is <span className="font-semibold">permanent</span> and
            cannot be undone.
          </p>

          <p>
            Before continuing, you must ensure that all{" "}
            <span className="font-semibold">
              Protected Health Information (PHI)
            </span>
            , patient records, appointment history, and any other EHR data
            associated with this location have been{" "}
            <span className="font-semibold">
              securely archived, transferred, or retained
            </span>{" "}
            according to applicable{" "}
            <span className="font-semibold">
              HIPAA requirements, state retention laws, and practice policies
            </span>
            .
          </p>

          <p className="font-medium">By proceeding, you confirm that:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              You have securely exported or migrated all required clinical and
              billing data related to this location.
            </li>
            <li>
              No active patient care, scheduling, or billing workflows depend on
              this location.
            </li>
            <li>
              You understand that this deletion is permanent and may affect
              historical reporting.
            </li>
          </ul>

          <p className="text-text-primary dark:text-text-darkPrimary">
            If any appointments still reference this location, deletion will be{" "}
            <span className="font-semibold">blocked</span> and you will be
            notified.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-bg dark:border-bg-dark">
          <button
            className="px-4 py-2 rounded border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary bg-side dark:bg-dButton-mbg hover:bg-top hover:dark:bg-dButton-mhover transition"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            className={`px-4 py-2 rounded text-input-lighter transition ${
              deleting
                ? "bg-red-400 cursor-wait"
                : "bg-reddel dark:bg-reddel-dark border border-reddel-border dark:border-reddel-dborder hover:bg-reddel-hover dark:hover:bg-reddel-dhover"
            }`}
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, Delete Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteLocationModal;
