// frontend/src/features/settings/components/AppointmentTypesModal.tsx
import React, { useEffect, useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";

import { toastError, toastSuccess } from "../../../utils";
import { scheduleSettingsApi } from "../../schedule/services";
import {
  ScheduleSettings,
  AppointmentTypeDef,
} from "../../schedule/types/scheduleSettings";

interface AppointmentTypesModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional: let parent refresh anything that depends on settings */
  onSaved?: (settings: ScheduleSettings) => void;
}

const defaultType: AppointmentTypeDef = {
  name: "",
  default_duration: 30 as 15 | 30 | 60,
  color_code: "#000000",
};

const AppointmentTypesModal: React.FC<AppointmentTypesModalProps> = ({
  open,
  onClose,
  onSaved,
}) => {
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [types, setTypes] = useState<AppointmentTypeDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (!open) return;

    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await scheduleSettingsApi.get();
        if (!active) return;
        setSettings(data);
        setTypes(
          Array.isArray(data.appointment_types) ? data.appointment_types : []
        );
      } catch (err) {
        console.error("Failed to load schedule settings", err);
        if (active) toastError("Failed to load appointment types.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  const updateType = (index: number, patch: Partial<AppointmentTypeDef>) => {
    setTypes((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );
  };

  const addType = () => {
    setTypes((prev) => [...prev, { ...defaultType }]);
  };

  const removeType = (index: number) => {
    setTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const sanitizeTypes = (
    incoming: AppointmentTypeDef[]
  ): AppointmentTypeDef[] => {
    return incoming.map((t) => {
      const name = (t.name || "").trim() || "Untitled";
      let dur = t.default_duration || 30;
      if (![15, 30, 60].includes(dur)) dur = 30;

      let color = t.color_code || "#000000";
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        color = "#000000";
      }

      return { name, default_duration: dur as 15 | 30 | 60, color_code: color };
    });
  };

  const validateTypes = (list: AppointmentTypeDef[]): boolean => {
    const names = list.map((t) => t.name.trim());
    const unique = new Set(names);
    if (names.length !== unique.size) {
      toastError("Appointment type names must be unique.");
      return false;
    }
    for (const t of list) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(t.color_code)) {
        toastError("One or more colors are invalid. Use a valid hex color.");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!settings) return;

    const cleanTypes = sanitizeTypes(types);
    if (!validateTypes(cleanTypes)) return;

    setSaving(true);
    try {
      const updated: ScheduleSettings = {
        ...settings,
        appointment_types: cleanTypes,
      };
      const saved = await scheduleSettingsApi.save(updated);
      setSettings(saved);
      setTypes(saved.appointment_types || []);
      toastSuccess("Appointment types updated.");
      onSaved?.(saved);
      onClose();
    } catch (err) {
      console.error("Failed to save appointment types", err);
      toastError("Failed to save appointment types.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Appointment Types</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <>
              {types.length === 0 && (
                <p className="text-gray-500 text-sm mb-4">
                  No appointment types defined yet. Add one below.
                </p>
              )}

              <div className="space-y-3">
                {types.map((type, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-gray-50 rounded-md p-3"
                  >
                    {/* Name */}
                    <input
                      type="text"
                      className="border rounded px-2 py-1 text-sm"
                      placeholder="Type name"
                      value={type.name}
                      onChange={(e) =>
                        updateType(idx, { name: e.target.value })
                      }
                    />

                    {/* Duration */}
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={type.default_duration}
                      onChange={(e) =>
                        updateType(idx, {
                          default_duration: Number(e.target.value) as
                            | 15
                            | 30
                            | 60,
                        })
                      }
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={60}>60 min</option>
                    </select>

                    {/* Color */}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 border rounded"
                        value={type.color_code}
                        onChange={(e) =>
                          updateType(idx, { color_code: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        className="border rounded px-2 py-1 text-xs w-24"
                        value={type.color_code}
                        onChange={(e) =>
                          updateType(idx, { color_code: e.target.value })
                        }
                      />
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 justify-end"
                      onClick={() => removeType(idx)}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add */}
              <button
                type="button"
                onClick={addType}
                className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <PlusCircle size={16} />
                Add Appointment Type
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !settings}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTypesModal;
