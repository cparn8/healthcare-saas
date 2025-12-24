// frontend/src/features/locations/components/EditLocationModal.tsx

import React, { useEffect, useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import { LocationDTO } from "../services/locationApi";

interface EditLocationModalProps {
  open: boolean;
  location: LocationDTO | null;
  onClose: () => void;
  onSave: (id: number, patch: Partial<LocationDTO>) => Promise<void>;
  onRequestDelete: (location: LocationDTO) => void;
}

const EditLocationModal: React.FC<EditLocationModalProps> = ({
  open,
  location,
  onClose,
  onSave,
  onRequestDelete,
}) => {
  // SAFE INITIAL DEFAULTS
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // APPLY REAL VALUES WHEN location ARRIVES
  useEffect(() => {
    if (location) {
      setName(location.name);
      setPhone(location.phone);
      setEmail(location.email);
      setAddress(location.address);
      setActive(location.is_active);
    }
  }, [location]);

  // EARLY RETURN (legal because hooks are above)
  if (!open || !location) return null;

  if (!open || !location) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(location.id, {
        name,
        phone,
        email,
        address,
        is_active: active,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset left-0 right-0 bottom-0 top-4 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-lg font-semibold">Edit Location</h2>
          <button
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary"
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
              className="w-full border border-border dark:border-border-dark rounded bg-input dark:bg-input-dark p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* SLUG (read-only) */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
              Location Key (slug)
            </label>
            <input
              type="text"
              className="w-full border border-border dark:border-border-dark rounded bg-input dark:bg-input-dark p-2 text-text-secondary dark:text-text-darkSecondary cursor-not-allowed"
              value={location.slug}
              readOnly
            />
            <p className="text-xs text-text-muted dark:text-text-darkMuted mt-1">
              Used internally by scheduling and appointments. Not editable.
            </p>
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-darkPrimary mb-1">
              Phone
            </label>
            <input
              type="text"
              className="w-full border border-border dark:border-border-dark rounded bg-input dark:bg-input-dark p-2"
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
              className="w-full border border-border dark:border-border-dark rounded bg-input dark:bg-input-dark p-2"
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
              className="w-full border border-border dark:border-border-dark rounded bg-input dark:bg-input-dark p-2"
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
          {/* Save / Cancel */}
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded border border-mBorder dark:border-dButton-mborder bg-side dark:bg-dButton-mbg text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className={`px-4 py-2 rounded text-input-lighter transition ${
                !name.trim() || saving
                  ? "bg-top cursor-not-allowed"
                  : "bg-grncon hover:bg-grncon-hover"
              }`}
              onClick={handleSave}
              disabled={!name.trim() || saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLocationModal;
