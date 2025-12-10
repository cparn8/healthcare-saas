import React, { useEffect, useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import {
  LocationDTO,
  getLocationHours,
  updateLocationHours,
  LocationHoursDTO,
} from "../services/locationApi";

import LocationHoursEditor from "./LocationHoursEditor";
import { toastError, toastSuccess } from "../../../utils";

interface Props {
  open: boolean;
  location: LocationDTO | null;
  onClose: () => void;
  onUpdated: () => Promise<void>; // triggers reloadLocations
}

const EditLocationHoursModal: React.FC<Props> = ({
  open,
  location,
  onClose,
  onUpdated,
}) => {
  const [hours, setHours] = useState<LocationHoursDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !location) return;

    const load = async () => {
      setLoading(true);
      try {
        const h = await getLocationHours(location.id);
        setHours(h);
      } catch (err) {
        console.error("Failed to load hours", err);
        toastError("Failed to load business hours.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, location]);

  const handleSave = async () => {
    if (!location) return;

    setSaving(true);
    try {
      await updateLocationHours(location.id, hours);
      toastSuccess("Business hours updated.");
      await onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update hours", err);
      toastError("Failed to update hours.");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Edit Hours – {location.name}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <p className="text-gray-600">Loading hours…</p>
          ) : (
            <LocationHoursEditor hours={hours} onChange={setHours} />
          )}
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
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLocationHoursModal;
