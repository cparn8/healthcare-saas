// frontend/src/features/locations/components/AddLocationModal.tsx

import React, { useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import { LocationDTO } from "../services/locationApi";

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: Partial<LocationDTO>) => Promise<void>;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSaving(true);
    await onCreate({
      name,
      phone,
      email,
      address,
      is_active: active,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset left-0 right-0 bottom-0 top-4 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-bg dark:bg-bg-dark
 rounded-lg shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-lg font-semibold">Add Location</h2>
          <button
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary hover:dark:text-text-darkPrimary"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
              Location Name
            </label>
            <input
              type="text"
              className="w-full border border-border dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
              placeholder="e.g., North Office"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
              Phone
            </label>
            <input
              type="text"
              className="w-full border border-border dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
              placeholder="Optional"
              value={phone ?? ""}
              onChange={(e) => setPhone(e.target.value || null)}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-border dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
              placeholder="Optional"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value || null)}
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
              Address
            </label>
            <textarea
              className="w-full border border-border dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
              placeholder="Optional"
              rows={2}
              value={address ?? ""}
              onChange={(e) => setAddress(e.target.value || null)}
            />
          </div>

          {/* ACTIVE TOGGLE */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-text-primary dark:text-text-darkPrimary">
              Location is active
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center px-6 py-4 border-t border-bg dark:border-bg-dark gap-3">
          <button
            className="px-4 py-2 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className={`px-4 py-2 rounded transition ${
              !name.trim() || saving
                ? "bg-top-darker text-text-primary dark:text-text-darkPrimary cursor-not-allowed"
                : "bg-primary text-text-darkPrimary hover:bg-primary-hover"
            }`}
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
          >
            {saving ? "Saving…" : "Create Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;
