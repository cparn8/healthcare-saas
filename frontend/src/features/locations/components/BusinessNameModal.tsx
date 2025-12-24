// frontend/src/features/locations/components/BusinessNameModal.tsx
import React, { useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import { BusinessSettingsDTO } from "../services/locationApi";

interface BusinessNameModalProps {
  open: boolean;
  initial: BusinessSettingsDTO;
  onClose: () => void;
  onSave: (patch: Partial<BusinessSettingsDTO>) => Promise<void>;
}

const BusinessNameModal: React.FC<BusinessNameModalProps> = ({
  open,
  initial,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initial.name || "");
  const [showName, setShowName] = useState(initial.show_name_in_nav);
  const [saving, setSaving] = useState(false);
  if (!open) return null;

  const handleSubmit = async () => {
    setSaving(true);
    await onSave({
      name,
      show_name_in_nav: showName,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset left-0 right-0 bottom-0 top-4 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-lg font-semibold">Edit Business Name</h2>
          <button
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary hover:dark:text-text-darkPrimary"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
              Business Name
            </label>
            <input
              type="text"
              className="w-full bg-surface dark:bg-surface-dark  border border-border dark:border-border-dark rounded p-2"
              placeholder="Enter business name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Toggle visibility */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showName}
              onChange={(e) => setShowName(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-text-primary dark:text-text-darkPrimary">
              Show in navigation bar
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center px-6 py-4 border-t border-bg dark:border-bg-dark gap-3">
          <button
            className="px-4 py-2 rounded border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary bg-side dark:bg-dButton-mbg hover:bg-top hover:dark:bg-dButton-mhover transition"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className={`px-4 py-2 rounded text-input-lighter transition ${
              saving
                ? "bg-gray-400 cursor-wait"
                : "bg-primary hover:bg-primary-hover"
            }`}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessNameModal;
