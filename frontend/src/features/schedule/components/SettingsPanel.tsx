import React, { useState, useEffect } from "react";
import { toastSuccess, toastError, toastInfo } from "../../../utils/toastUtils";
import { scheduleSettingsApi } from "../services/scheduleSettingsApi";
import {
  ScheduleSettings,
  Weekday,
  AppointmentTypeDef,
  LocationKeyedHours,
} from "../types/scheduleSettings";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";

/* ----------------------- Constants ----------------------- */
const defaultDayHours = { open: true, start: "08:00", end: "17:00" };
const weekdays: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/* ----------------------- Helper ----------------------- */
function makeDefaultWeek(): Record<Weekday, typeof defaultDayHours> {
  return {
    mon: { ...defaultDayHours },
    tue: { ...defaultDayHours },
    wed: { ...defaultDayHours },
    thu: { ...defaultDayHours },
    fri: { ...defaultDayHours },
    sat: { ...defaultDayHours },
    sun: { ...defaultDayHours },
  };
}

/**
 * Ensures `settings.business_hours[location]` and all days exist.
 * Mutates in-place safely so you never hit undefined on render.
 */
function ensureBusinessHours(
  settings: ScheduleSettings,
  location: keyof ScheduleSettings["business_hours"]
) {
  if (!settings.business_hours[location]) {
    settings.business_hours[location] = makeDefaultWeek();
  } else {
    for (const day of weekdays) {
      if (!settings.business_hours[location][day]) {
        settings.business_hours[location][day] = { ...defaultDayHours };
      }
    }
  }
  return settings.business_hours[location];
}

/* ----------------------- Component ----------------------- */
const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* ----------------------- Load ----------------------- */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await scheduleSettingsApi.get();
        console.log("Loaded settings:", data);
        // Ensure all structures are present
        ensureBusinessHours(data, "north");
        ensureBusinessHours(data, "south");
        setSettings(data);
      } catch (error) {
        console.error("Settings load failed:", error);
        toastInfo("Using local settings");
      }
    };
    loadSettings();
  }, []);

  console.log("🧩 SettingsPanel mount:", settings);

  if (!settings) {
    console.log("⚙️ Creating default settings...");
    const defaultSettings: ScheduleSettings = {
      business_hours: {
        north: makeDefaultWeek(),
        south: makeDefaultWeek(),
      },
      appointment_types: [],
    };
    setSettings(defaultSettings);
    return <div>Loading defaults...</div>;
  }

  /* ----------------------- Handlers ----------------------- */
  const handleBusinessHoursChange = (
    location: keyof LocationKeyedHours,
    day: Weekday,
    field: keyof typeof defaultDayHours,
    value: string | boolean
  ) => {
    const updatedSettings: ScheduleSettings = JSON.parse(
      JSON.stringify(settings)
    );

    const locationHours = ensureBusinessHours(updatedSettings, location);
    const dayHours = locationHours[day];

    if (field === "open") {
      dayHours.open = value as boolean;
      if (!dayHours.open) {
        dayHours.start = "08:00";
        dayHours.end = "17:00";
      }
    } else {
      (dayHours as any)[field] = value;
    }

    updatedSettings.business_hours[location][day] = dayHours;
    setSettings(updatedSettings);
    setIsInvalid(!validateSettings(updatedSettings));
  };

  const handleAppointmentTypeChange = (
    index: number,
    field: keyof AppointmentTypeDef,
    value: string | number
  ) => {
    const updatedSettings: ScheduleSettings = JSON.parse(
      JSON.stringify(settings)
    );
    (updatedSettings.appointment_types[index] as any)[field] = value;
    setSettings(updatedSettings);
    setIsInvalid(!validateSettings(updatedSettings));
  };

  const addAppointmentType = () => {
    if (!settings) return;
    const updatedSettings: ScheduleSettings = JSON.parse(
      JSON.stringify(settings)
    );
    updatedSettings.appointment_types.push({
      name: "",
      default_duration: 30,
      color_code: "#000000",
    });
    setSettings(updatedSettings);
  };

  const removeAppointmentType = (index: number) => {
    if (!settings) return;
    const updatedSettings: ScheduleSettings = JSON.parse(
      JSON.stringify(settings)
    );
    updatedSettings.appointment_types.splice(index, 1);
    setSettings(updatedSettings);
  };

  const validateSettings = (cfg: ScheduleSettings): boolean => {
    for (const location of Object.keys(cfg.business_hours)) {
      for (const day of weekdays) {
        const { open, start, end } = cfg.business_hours[location][day];
        if (open && start >= end) return false;
      }
    }

    const names = cfg.appointment_types.map((t) => t.name.trim());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) return false;

    for (const t of cfg.appointment_types) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(t.color_code)) return false;
    }
    return true;
  };

  /**
   * Deep-validates and repairs ScheduleSettings before saving.
   * Ensures both office branches and all weekdays exist.
   */
  function normalizeSettingsBeforeSave(
    settings: ScheduleSettings
  ): ScheduleSettings {
    const normalized: ScheduleSettings = JSON.parse(JSON.stringify(settings));

    // Ensure business_hours structure
    if (!normalized.business_hours) {
      normalized.business_hours = {
        north: makeDefaultWeek(),
        south: makeDefaultWeek(),
      };
    }

    for (const office of ["north", "south"] as const) {
      if (!normalized.business_hours[office]) {
        normalized.business_hours[office] = makeDefaultWeek();
      } else {
        for (const day of weekdays) {
          if (!normalized.business_hours[office][day]) {
            normalized.business_hours[office][day] = { ...defaultDayHours };
          }
        }
      }
    }

    // Validate appointment types array
    if (!Array.isArray(normalized.appointment_types)) {
      normalized.appointment_types = [];
    } else {
      normalized.appointment_types = normalized.appointment_types.map((t) => ({
        name: t.name?.trim() || "Untitled",
        default_duration: t.default_duration || 30,
        color_code: /^#[0-9A-Fa-f]{6}$/.test(t.color_code)
          ? t.color_code
          : "#000000",
      }));
    }

    return normalized;
  }

  const saveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const cleanSettings = normalizeSettingsBeforeSave(settings);
      setSettings(cleanSettings); // reflect sanitized version
      await scheduleSettingsApi.save(cleanSettings);
      toastSuccess("Settings saved successfully.");
    } catch {
      toastError("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const restoreLastLoadedState = () => {
    const last = localStorage.getItem("scheduleSettings");
    if (last) setSettings(JSON.parse(last));
  };

  /* ----------------------- Render ----------------------- */
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(settings.business_hours).map((location) => {
          const locationHours = ensureBusinessHours(settings, location as any);

          return (
            <div key={location} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold capitalize">
                {location} Office Hours
              </h3>
              <div className="space-y-2">
                {weekdays.map((day) => {
                  const hours = locationHours[day];
                  if (!hours) return null; // Defensive safety

                  return (
                    <div
                      key={day}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                    >
                      <span className="capitalize">{day}</span>
                      <label>
                        <input
                          type="checkbox"
                          checked={hours.open}
                          onChange={(e) =>
                            handleBusinessHoursChange(
                              location as any,
                              day,
                              "open",
                              e.target.checked
                            )
                          }
                        />{" "}
                        Open
                      </label>
                      <input
                        type="time"
                        className="border rounded px-2"
                        disabled={!hours.open}
                        value={hours.start}
                        onChange={(e) =>
                          handleBusinessHoursChange(
                            location as any,
                            day,
                            "start",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="time"
                        className="border rounded px-2"
                        disabled={!hours.open}
                        value={hours.end}
                        onChange={(e) =>
                          handleBusinessHoursChange(
                            location as any,
                            day,
                            "end",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment Types */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Appointment Types</h3>
        <div className="space-y-2">
          {settings.appointment_types.map((type, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-4 items-center">
              <input
                type="text"
                className="border rounded px-2"
                value={type.name}
                onChange={(e) =>
                  handleAppointmentTypeChange(idx, "name", e.target.value)
                }
                placeholder="Type name"
              />
              <select
                className="border rounded px-2"
                value={type.default_duration}
                onChange={(e) =>
                  handleAppointmentTypeChange(
                    idx,
                    "default_duration",
                    Number(e.target.value)
                  )
                }
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
              <input
                type="color"
                className="w-full h-10"
                value={type.color_code}
                onChange={(e) =>
                  handleAppointmentTypeChange(idx, "color_code", e.target.value)
                }
              />
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => removeAppointmentType(idx)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mt-2"
            onClick={addAppointmentType}
          >
            <PlusCircle size={16} /> Add Appointment Type
          </button>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-gray-100 border-t flex justify-between items-center shadow-md">
        <button
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
          onClick={restoreLastLoadedState}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={saveSettings}
          disabled={isSaving || isInvalid}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
