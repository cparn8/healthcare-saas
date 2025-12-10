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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Edit Business Name</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
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
            <span className="text-sm text-gray-700">
              Show in navigation bar
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center px-6 py-4 border-t bg-gray-50 gap-3">
          <button
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className={`px-4 py-2 rounded text-white transition ${
              saving
                ? "bg-gray-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
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
