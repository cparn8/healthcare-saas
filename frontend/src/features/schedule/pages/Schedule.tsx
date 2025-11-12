// frontend/src/features/schedule/pages/Schedule.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { startOfWeek, addDays } from "date-fns";

import DayViewGrid from "../components/DayViewGrid";
import WeekViewGrid from "../components/WeekViewGrid";
import { useVisibleAppointments } from "../hooks/useVisibleAppointments";
import NewAppointmentModal from "../components/NewAppointmentModal";
import EditAppointmentModal from "../components/EditAppointmentModal";
import SettingsPanel from "../components/SettingsPanel";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import { appointmentsApi, Appointment } from "../services/appointmentsApi";
import { providersApi, Provider } from "../../providers/services/providersApi";
import { scheduleSettingsApi } from "../services/scheduleSettingsApi";
import {
  ScheduleSettings,
  AppointmentTypeDef,
} from "../types/scheduleSettings";
import {
  parseLocalDate,
  formatShortDate,
  formatYMDLocal,
  safeDate,
} from "../../../utils/dateUtils";

type TabKey = "appointments" | "day" | "week" | "settings";
type OfficeKey = "north" | "south";
type SlotSize = 15 | 30 | 60;
type OfficeKeyStrict = keyof ScheduleSettings["business_hours"];
type WeekdayKeyStrict = keyof ScheduleSettings["business_hours"]["north"];

const TABS = [
  { key: "appointments", label: "Appointments" },
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "settings", label: "Settings" },
] as const;

const SLOT_OPTIONS: SlotSize[] = [15, 30, 60];

/**
 * Given any date string (YYYY-MM-DD),
 * returns a readable Mon–Fri week range (local-safe).
 */
function formatWeekRange(input: string | Date): string {
  const start =
    typeof input === "string"
      ? parseLocalDate(input)
      : parseLocalDate(input.toISOString().split("T")[0]);

  // Normalize to local midnight
  const localStart = safeDate(formatYMDLocal(start));

  // Find Monday of that week (assuming Sunday=0)
  const diff = (localStart.getDay() + 6) % 7;
  localStart.setDate(localStart.getDate() - diff);

  const end = safeDate(formatYMDLocal(localStart));
  end.setDate(localStart.getDate() + 4); // Mon → Fri

  const sameMonth = localStart.getMonth() === end.getMonth();

  const startFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(localStart);

  const endFmt = new Intl.DateTimeFormat("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  }).format(end);

  return `${startFmt} – ${endFmt}`;
}

const SchedulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "day"
  );
  const [office, setOffice] = useState<OfficeKey>("north");
  const [cursorDate, setCursorDate] = useState<Date>(
    safeDate(formatYMDLocal(new Date()))
  );
  // Determine the date range the current tab should display
  const visibleRange = useMemo(() => {
    if (activeTab === "week") {
      const start = startOfWeek(cursorDate, { weekStartsOn: 1 });
      const end = addDays(start, 7);
      return { start, end };
    }
    const start = safeDate(formatYMDLocal(cursorDate));
    const end = addDays(start, 1);
    return { start, end };
  }, [activeTab, cursorDate]);

  const [slotSize, setSlotSize] = useState<SlotSize>(30);

  // --- Data State ---
  const [providerId, setProviderId] = useState<number | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [appointmentTypes, setAppointmentTypes] = useState<
    AppointmentTypeDef[]
  >([]);
  const [scheduleSettings, setScheduleSettings] =
    useState<ScheduleSettings | null>(null);

  // --- Modal State ---
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [prefill, setPrefill] = useState<{
    date?: string;
    start_time?: string;
    end_time?: string;
  } | null>(null);
  const [initialPatient, setInitialPatient] = useState<any>(null);
  const [confirmData, setConfirmData] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: "", onConfirm: () => {} });

  const visibleAppointments = useVisibleAppointments({
    allAppointments: appointments,
    visibleStart: visibleRange.start,
    visibleEnd: visibleRange.end,
  });

  /* ----------------------------- Navigation ----------------------------- */
  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  // Smart skip to next/previous *open* day based on ScheduleSettings
  function findNextOpenDay(current: Date, direction: 1 | -1): Date {
    if (!scheduleSettings || !office) return current;
    const maxAttempts = 7;
    let next = parseLocalDate(formatYMDLocal(current));

    for (let i = 0; i < maxAttempts; i++) {
      next = addDays(next, direction);
      const weekday = next
        .toLocaleDateString("en-US", { weekday: "short" })
        .toLowerCase()
        .slice(0, 3) as WeekdayKeyStrict;

      const officeHours =
        scheduleSettings.business_hours?.[office as OfficeKeyStrict]?.[weekday];
      if (!officeHours || officeHours.open) return next;
    }
    return current;
  }

  const goPrev = () => {
    if (activeTab === "week") setCursorDate((prev) => addDays(prev, -7));
    else setCursorDate((prev) => findNextOpenDay(prev, -1));
  };

  const goNext = () => {
    if (activeTab === "week") setCursorDate((prev) => addDays(prev, 7));
    else setCursorDate((prev) => findNextOpenDay(prev, 1));
  };

  const leftLabel = useMemo(
    () =>
      activeTab === "week"
        ? formatWeekRange(cursorDate)
        : formatShortDate(cursorDate),
    [cursorDate, activeTab]
  );

  /* ----------------------------- Load Settings ----------------------------- */
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await scheduleSettingsApi.get();
        setScheduleSettings(data);
      } catch {
        console.warn("⚠️ Falling back to default hours");
      }
    }
    loadSettings();
  }, []);

  /* ----------------------------- Provider Fetch ----------------------------- */
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const me = await providersApi.getCurrent();
        setProvider(me);
        setProviderId(me.id ?? null);
      } catch (err) {
        console.error("❌ Failed to load provider info:", err);
      }
    };
    fetchProvider();
  }, []);

  /* ----------------------------- Appointment Loading ----------------------------- */

  function getWeekRange(date: Date) {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const end = addDays(start, 7); // next Monday
    return {
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    };
  }

  const loadAppointments = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoadingAppts(true);
      const { start_date, end_date } = getWeekRange(cursorDate);

      const appts = await appointmentsApi.list({
        provider: providerId,
        office,
        start_date,
        end_date,
      });

      setAppointments(appts);
    } catch (err) {
      console.error("❌ Failed to load appointments:", err);
    } finally {
      setLoadingAppts(false);
    }
  }, [providerId, office, cursorDate]);

  useEffect(() => {
    if (providerId) loadAppointments();
  }, [providerId, office, cursorDate, loadAppointments]);

  useEffect(() => {
    if (scheduleSettings)
      console.log("Schedule Settings JSON →", scheduleSettings.business_hours);
  }, [scheduleSettings]);

  /* ----------------------------- Appointment Types ----------------------------- */
  useEffect(() => {
    import("../services/scheduleSettingsApi").then(
      ({ scheduleSettingsApi }) => {
        scheduleSettingsApi.get().then((data) => {
          setAppointmentTypes(data.appointment_types || []);
        });
      }
    );
  }, []);

  /* ----------------------------- Return from Add Patient ----------------------------- */
  useEffect(() => {
    const newPatientId = searchParams.get("newPatientId");
    if (!newPatientId) return;

    const storedPatient = sessionStorage.getItem("newPatient");
    const parsedPatient = storedPatient ? JSON.parse(storedPatient) : null;

    const storedSlot = sessionStorage.getItem("pendingSlot");
    const parsedSlot = storedSlot ? JSON.parse(storedSlot) : null;

    if (parsedPatient) setInitialPatient(parsedPatient);
    if (parsedSlot) setPrefill(parsedSlot);
    setShowNewAppointment(true);

    sessionStorage.removeItem("newPatient");
    sessionStorage.removeItem("pendingSlot");
    const next = new URLSearchParams(searchParams);
    next.delete("newPatientId");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSlotSelect = (start: Date, end: Date, allowOverlap = false) => {
    const prefill = {
      date: start.toISOString().split("T")[0],
      start_time: start.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
      allow_overlap: allowOverlap,
    };
    sessionStorage.setItem("pendingSlot", JSON.stringify(prefill));
    setPrefill(prefill);
    setShowNewAppointment(true);
  };

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <span className="text-sm text-gray-500">
            {appointments.length} appointments
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === t.key
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      {(activeTab === "appointments" ||
        activeTab === "day" ||
        activeTab === "week") && (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border rounded hover:bg-gray-50">
                Filter
              </button>
              <button
                className="px-3 py-1.5 border rounded hover:bg-gray-50"
                onClick={loadAppointments}
              >
                Refresh
              </button>
              <select
                className="px-3 py-1.5 border rounded"
                value={office}
                onChange={(e) => setOffice(e.target.value as OfficeKey)}
              >
                <option value="north">North Office</option>
                <option value="south">South Office</option>
              </select>
            </div>

            <button
              className="px-3 py-1.5 border rounded bg-green-600 text-white hover:bg-green-700"
              onClick={() => setShowNewAppointment(true)}
            >
              + Add appointment
            </button>
          </div>

          <hr className="border-gray-200" />

          {/* Date Navigation */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-gray-700">{leftLabel}</div>
            <div className="flex items-center gap-2">
              <div className="flex">
                <button
                  className="px-3 py-1.5 border rounded-l hover:bg-gray-50"
                  onClick={goPrev}
                >
                  ←
                </button>
                <div className="px-3 py-1.5 border-t border-b">
                  {cursorDate.toLocaleDateString()}
                </div>
                <button
                  className="px-3 py-1.5 border rounded-r hover:bg-gray-50"
                  onClick={goNext}
                >
                  →
                </button>
              </div>
              <select
                className="px-3 py-1.5 border rounded"
                value={slotSize}
                onChange={(e) =>
                  setSlotSize(Number(e.target.value) as SlotSize)
                }
              >
                {SLOT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s} min
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-200" />
        </>
      )}

      {/* Content */}
      <div className="min-h-[400px] bg-white border rounded p-4">
        {activeTab === "day" && (
          <DayViewGrid
            office={office}
            providerName={
              provider
                ? `${provider.first_name} ${provider.last_name}`
                : "Loading..."
            }
            scheduleSettings={scheduleSettings}
            slotMinutes={slotSize}
            appointments={visibleAppointments}
            loading={loadingAppts}
            date={cursorDate}
            providerId={providerId}
            onEditAppointment={(appt) => setEditingAppt(appt)}
            onSelectEmptySlot={(start, end, allow) =>
              handleSlotSelect(start, end, !!allow)
            }
            onChangeDate={(newDate) => setCursorDate(newDate)}
            requestConfirm={(message, onConfirm) =>
              setConfirmData({ open: true, message, onConfirm })
            }
          />
        )}

        {activeTab === "week" && (
          <WeekViewGrid
            baseDate={cursorDate}
            office={office}
            providerName={
              provider
                ? `${provider.first_name} ${provider.last_name}`
                : "Loading..."
            }
            scheduleSettings={scheduleSettings}
            slotMinutes={slotSize}
            appointments={visibleAppointments}
            loading={loadingAppts}
            providerId={providerId}
            onEditAppointment={(appt) => setEditingAppt(appt)}
            onSelectEmptySlot={(start, end, allow) =>
              handleSlotSelect(start, end, !!allow)
            }
            requestConfirm={(message, onConfirm) =>
              setConfirmData({ open: true, message, onConfirm })
            }
          />
        )}

        {activeTab === "settings" && <SettingsPanel />}
      </div>

      {/* Modals */}
      {showNewAppointment && (
        <NewAppointmentModal
          onClose={() => {
            setShowNewAppointment(false);
            setPrefill(null);
            setInitialPatient(null);
          }}
          onSaved={() => {
            loadAppointments();
            setShowNewAppointment(false);
            setPrefill(null);
            setInitialPatient(null);
          }}
          providerId={providerId}
          initialDate={
            prefill?.date ? new Date(prefill.date + "T00:00") : undefined
          }
          initialStartTime={
            prefill?.start_time
              ? new Date(`1970-01-01T${prefill.start_time}`)
              : undefined
          }
          initialEndTime={
            prefill?.end_time
              ? new Date(`1970-01-01T${prefill.end_time}`)
              : undefined
          }
          initialPatient={initialPatient}
          appointmentTypes={appointmentTypes}
          scheduleSettings={scheduleSettings}
        />
      )}

      {editingAppt && (
        <EditAppointmentModal
          appointment={{
            ...editingAppt,
            repeat_days: editingAppt.repeat_days || [],
          }}
          onClose={() => setEditingAppt(null)}
          onUpdated={loadAppointments}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmData.open}
        title="Double Booking"
        message={confirmData.message}
        confirmLabel="Proceed Anyway"
        cancelLabel="Cancel"
        onConfirm={() => {
          confirmData.onConfirm();
          setConfirmData({ open: false, message: "", onConfirm: () => {} });
        }}
        onCancel={() =>
          setConfirmData({ open: false, message: "", onConfirm: () => {} })
        }
      />
    </div>
  );
};

export default SchedulePage;
