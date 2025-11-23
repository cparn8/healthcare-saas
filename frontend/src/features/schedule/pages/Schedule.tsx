// frontend/src/features/schedule/pages/Schedule.tsx

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { addDays } from "date-fns";

import { AppointmentsTable } from "../components/appointments-table";
import { DayViewGrid, WeekViewGrid } from "../components/grid";
import {
  NewAppointmentModal,
  EditAppointmentModal,
} from "../components/modals";
import SettingsPanel from "../components/SettingsPanel";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { ScheduleFilters } from "../components/filters";
import DatePickerPopover from "../components/DatePickerPopover";

import { filterAppointments } from "../utils";
import {
  useVisibleAppointments,
  useScheduleData,
  useScheduleFilters,
  useOfficePersistence,
  OfficeKey,
} from "../hooks";

import { Appointment } from "../services/appointmentsApi";
import { providersApi, Provider } from "../../providers/services/providersApi";

import {
  formatShortDate,
  formatYMDLocal,
  safeDate,
} from "../../../utils/dateUtils";

import {
  formatWeekRange,
  findNextOpenDay,
  normalizeToWeekStart,
} from "../logic";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type TabKey = "appointments" | "day" | "week" | "settings";
type SlotSize = 15 | 30 | 60;

const TABS = [
  { key: "appointments", label: "Appointments" },
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "settings", label: "Settings" },
] as const;

const SLOT_OPTIONS: SlotSize[] = [15, 30, 60];

/* ------------------------------------------------------------------ */
/* Simple multi-office dropdown                                       */
/* ------------------------------------------------------------------ */

function MultiOfficeDropdown({
  selectedOffices,
  onChange,
}: {
  selectedOffices: OfficeKey[];
  onChange: (offices: OfficeKey[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const labelsMap: Record<OfficeKey, string> = {
    north: "North Office",
    south: "South Office",
  };

  const displayLabel =
    selectedOffices.length === 0
      ? "No Office Selected"
      : selectedOffices.map((k) => labelsMap[k]).join(", ");

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 border rounded bg-white min-w-[180px] text-left"
      >
        {displayLabel}
      </button>

      {open && (
        <div className="absolute mt-1 w-48 bg-white border rounded shadow-lg z-30 p-2">
          {/* All Offices */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOffices.length === 2}
              onChange={(e) =>
                onChange(e.target.checked ? ["north", "south"] : [])
              }
            />
            <span>All Offices</span>
          </label>

          {/* Individual toggles */}
          {(["north", "south"] as OfficeKey[]).map((office) => (
            <label
              key={office}
              className="flex items-center gap-2 capitalize cursor-pointer mt-1"
            >
              <input
                type="checkbox"
                checked={selectedOffices.includes(office)}
                onChange={() => {
                  if (selectedOffices.includes(office)) {
                    onChange(selectedOffices.filter((o) => o !== office));
                  } else {
                    onChange([...selectedOffices, office]);
                  }
                }}
              />
              <span>{labelsMap[office]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const SchedulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // This ref is still useful for future extensions (e.g., focusing)
  const datePickerWrapperRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------------- UI State ----------------------------- */

  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "day"
  );

  const [cursorDate, setCursorDate] = useState<Date>(
    safeDate(formatYMDLocal(new Date()))
  );
  const [slotSize, setSlotSize] = useState<SlotSize>(30);
  const [showFilters, setShowFilters] = useState(false);

  /* ----------------------------- Data State --------------------------- */

  const [providerId, setProviderId] = useState<number | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  // Office + multi-office selection, persisted per provider
  const { office, selectedOffices, setSelectedOffices } =
    useOfficePersistence(providerId);

  // Filters + provider list in one place
  const { filters, setFilters, providersList } = useScheduleFilters(providerId);

  /* ----------------------------- Modal State -------------------------- */

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

  /* ----------------------------- Central Data Hook -------------------- */

  const {
    appointments,
    loadingAppts,
    reloadAppointments,
    scheduleSettings,
    appointmentTypes,
  } = useScheduleData({
    cursorDate,
    providerId,
  });

  /* ----------------------------- Derived Values ----------------------- */

  const visibleRange = useMemo(() => {
    if (activeTab === "week") {
      const start = normalizeToWeekStart(cursorDate);
      const end = addDays(start, 7);
      return { start, end };
    }
    const start = safeDate(formatYMDLocal(cursorDate));
    const end = addDays(start, 1);
    return { start, end };
  }, [activeTab, cursorDate]);

  const visibleAppointments = useVisibleAppointments({
    allAppointments: appointments,
    visibleStart: visibleRange.start,
    visibleEnd: visibleRange.end,
  });

  const filteredAppointments = useMemo(
    () =>
      filterAppointments({
        appointments: visibleAppointments,
        filters,
        selectedOffices,
      }),
    [visibleAppointments, filters, selectedOffices]
  );

  const leftLabel = useMemo(
    () =>
      activeTab === "week"
        ? formatWeekRange(cursorDate)
        : formatShortDate(cursorDate),
    [cursorDate, activeTab]
  );

  /* ----------------------------- Effects: provider -------------------- */

  // Load current provider (me)
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

  /* ----------------------------- Effects: return from Add Patient ----- */

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

  /* ----------------------------- Handlers: navigation ----------------- */

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  const goPrev = () => {
    if (activeTab === "week") {
      setCursorDate((prev) => addDays(prev, -7));
    } else {
      setCursorDate((prev) =>
        findNextOpenDay(prev, -1, scheduleSettings, office)
      );
    }
  };

  const goNext = () => {
    if (activeTab === "week") {
      setCursorDate((prev) => addDays(prev, 7));
    } else {
      setCursorDate((prev) =>
        findNextOpenDay(prev, 1, scheduleSettings, office)
      );
    }
  };

  const handleDateSelect = (selected: Date) => {
    if (activeTab === "week") {
      setCursorDate(normalizeToWeekStart(selected));
    } else {
      setCursorDate(safeDate(formatYMDLocal(selected)));
    }
  };

  /* ----------------------------- Handlers: slot select ---------------- */

  const handleSlotSelect = (start: Date, end: Date, allowOverlap = false) => {
    const prefillSlot = {
      date: start.toISOString().split("T")[0],
      start_time: start.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
      office,
      allow_overlap: allowOverlap,
    };

    sessionStorage.setItem("pendingSlot", JSON.stringify(prefillSlot));
    setPrefill(prefillSlot);
    setShowNewAppointment(true);
  };

  /* ----------------------------- Render ------------------------------- */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <span className="text-sm text-gray-500">
            {filteredAppointments.length} appointments
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

      {/* Toolbar (only for schedule-related tabs) */}
      {(activeTab === "appointments" ||
        activeTab === "day" ||
        activeTab === "week") && (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1.5 border rounded hover:bg-gray-50 ${
                  showFilters ? "bg-blue-50 border-blue-600 text-blue-600" : ""
                }`}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                Filter
              </button>

              <button
                className="px-3 py-1.5 border rounded hover:bg-gray-50"
                onClick={reloadAppointments}
              >
                Refresh
              </button>

              <MultiOfficeDropdown
                selectedOffices={selectedOffices}
                onChange={setSelectedOffices}
              />
            </div>

            {activeTab === "appointments" ? (
              <button
                className="px-3 py-1.5 border rounded bg-gray-800 text-white hover:bg-gray-900"
                onClick={() => window.print()}
              >
                Print day
              </button>
            ) : (
              <button
                className="px-3 py-1.5 border rounded bg-green-600 text-white hover:bg-green-700"
                onClick={() => setShowNewAppointment(true)}
              >
                + Add appointment
              </button>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Date Navigation */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-gray-700">{leftLabel}</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center" ref={datePickerWrapperRef}>
                <DatePickerPopover
                  value={cursorDate}
                  onSelect={handleDateSelect}
                />

                <button
                  className="px-3 py-1.5 border border-l-0 hover:bg-gray-50"
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
                className={`px-3 py-1.5 border rounded ${
                  activeTab === "appointments"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : ""
                }`}
                value={slotSize}
                onChange={(e) =>
                  setSlotSize(Number(e.target.value) as SlotSize)
                }
                disabled={activeTab === "appointments"}
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

      <div className="flex min-h-[400px] bg-white border rounded">
        {/* Filters Sidebar */}
        {showFilters && (
          <ScheduleFilters
            providerId={providerId}
            allProviders={providersList}
            appointmentTypes={appointmentTypes}
            currentFilters={filters}
            onUpdateFilters={setFilters}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 p-4 ${showFilters ? "w-5/6" : "w-full"}`}>
          {activeTab === "appointments" && (
            <AppointmentsTable
              appointments={filteredAppointments}
              date={cursorDate}
              loading={loadingAppts}
              loadAppointments={reloadAppointments}
            />
          )}

          {activeTab === "day" && (
            <DayViewGrid
              office={office}
              selectedOffices={selectedOffices}
              providerName={
                provider
                  ? `${provider.first_name} ${provider.last_name}`
                  : "Loading..."
              }
              scheduleSettings={scheduleSettings}
              slotMinutes={slotSize}
              appointments={filteredAppointments}
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
              selectedOffices={selectedOffices}
              providerName={
                provider
                  ? `${provider.first_name} ${provider.last_name}`
                  : "Loading..."
              }
              scheduleSettings={scheduleSettings}
              slotMinutes={slotSize}
              appointments={filteredAppointments}
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
            reloadAppointments();
            setShowNewAppointment(false);
            setPrefill(null);
            setInitialPatient(null);
          }}
          providerId={providerId}
          defaultOffice={office}
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
        <>
          {console.log("Schedule → editingAppt.date =", editingAppt.date)}
          <EditAppointmentModal
            appointment={{
              ...editingAppt,
              repeat_days: editingAppt.repeat_days || [],
            }}
            onClose={() => setEditingAppt(null)}
            onUpdated={reloadAppointments}
            appointmentTypes={appointmentTypes}
          />
        </>
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
