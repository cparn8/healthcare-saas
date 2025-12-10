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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Add Location</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="e.g., North Office"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="Optional"
              value={phone ?? ""}
              onChange={(e) => setPhone(e.target.value || null)}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded p-2"
              placeholder="Optional"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value || null)}
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              className="w-full border rounded p-2"
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
            <span className="text-sm text-gray-700">Location is active</span>
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
              !name.trim() || saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
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
