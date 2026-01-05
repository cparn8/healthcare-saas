// frontend/src/features/schedule/pages/Schedule.tsx

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { addDays } from "date-fns";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import DynamicOfficeDropdown from "../components/DynamicOfficeDropdown";
import { useLocations } from "../../locations/hooks/useLocations";
import { AppointmentsTable } from "../components/appointments-table";
import { DayViewGrid, WeekViewGrid } from "../components/grid";
import {
  NewAppointmentModal,
  EditAppointmentModal,
} from "../components/modals";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { ScheduleFilters } from "../components/filters";
import DatePickerPopover from "../components/DatePickerPopover";
import { filterAppointments } from "../utils";
import {
  useVisibleAppointments,
  useBusinessHours,
  useScheduleData,
  useScheduleFilters,
  useOfficePersistence,
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
  computeOpenRangeForWeek,
} from "../logic";
import { formatProviderLabel } from "../components/grid/logic";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type TabKey = "appointments" | "day" | "week" | "settings";
type SlotSize = 15 | 30 | 60;

const TABS = [
  { key: "appointments", label: "Appointments" },
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
] as const;

const SLOT_OPTIONS: SlotSize[] = [15, 30, 60];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const SchedulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Dynamic locations for the office selector
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { locations, loading: loadingLocations } = useLocations();

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [provider, setProvider] = useState<Provider | null>(null);

  // Office + multi-office selection, persisted per provider
  const { primaryOffice, selectedOffices, setSelectedOffices } =
    useOfficePersistence(providerId);

  const primaryOfficeSlug =
    selectedOffices && selectedOffices.length > 0 ? selectedOffices[0] : null;

  // Filters + provider list in one place
  const { filters, setFilters, providersList } = useScheduleFilters(providerId);

  // ------------------------------------------------------------------
  // One-time sync: ensure activeTab matches persisted defaultView
  // ------------------------------------------------------------------
  const hasSyncedDefaultView = useRef(false);

  useEffect(() => {
    if (hasSyncedDefaultView.current) return;

    if (activeTab === "day" && filters.defaultView !== "day") {
      hasSyncedDefaultView.current = true;
      setActiveTab(filters.defaultView);
    }
  }, [filters.defaultView, activeTab]);

  const providerLabel = formatProviderLabel(providersList, filters.providers);

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
    onCancel?: () => void;
  }>({ open: false, message: "", onConfirm: () => {} });

  // Promise-based helper for modals (and anything else) to use styled ConfirmDialog
  const requestConfirmAsync = (message: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmData({
        open: true,
        message,
        onConfirm: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  };

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
    providerIds: filters.providers,
  });

  /* ----------------------------- Derived Values ----------------------- */

  const { isDayOpen } = useBusinessHours(scheduleSettings, selectedOffices);

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

  /* --------------------------- Left Label (Header) --------------------------- */

  const leftLabel = useMemo(() => {
    if (activeTab !== "week") {
      return formatShortDate(cursorDate);
    }

    const weekStart = normalizeToWeekStart(cursorDate);
    const range = computeOpenRangeForWeek(weekStart, isDayOpen);

    if (!range) {
      // no open days → fall back to standard Mon–Fri label
      return formatWeekRange(cursorDate);
    }

    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);

    return `${fmt(range.first)} – ${fmt(range.last)}`;
  }, [activeTab, cursorDate, isDayOpen]);

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
      if (!primaryOffice) return;
      setCursorDate((prev) =>
        findNextOpenDay(prev, -1, scheduleSettings, primaryOffice)
      );
    }
  };

  const goNext = () => {
    if (activeTab === "week") {
      setCursorDate((prev) => addDays(prev, 7));
    } else {
      if (!primaryOffice) return;
      setCursorDate((prev) =>
        findNextOpenDay(prev, 1, scheduleSettings, primaryOffice)
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
      office: primaryOfficeSlug,
      allow_overlap: allowOverlap,
    };

    sessionStorage.setItem("pendingSlot", JSON.stringify(prefillSlot));
    setPrefill(prefillSlot);
    setShowNewAppointment(true);
  };

  /* ----------------------------- Handlers: print ------------------------- */

  const handlePrintDay = () => {
    // Only meaningful on the Appointments tab, but safe to guard anyway
    if (activeTab !== "appointments") return;
    window.print();
  };

  /* ----------------------------- Render ------------------------------- */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold text-text-primary dark:text-text-darkPrimary">
            Schedule
          </h1>
          <span className="text-sm text-text-muted dark:text-text-darkMuted">
            {filteredAppointments.length} appointments
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border dark:border-border-dark">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === t.key
                ? "border-primary text-primary font-medium "
                : "border-transparent hover:border-text-secondary hover:dark:border-text-darkSecondary text-text-secondary dark:text-text-darkSecondary hover:text-text-primary hover:dark:text-text-darkMuted"
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
                className={`px-3 py-1.5 rounded ${
                  showFilters
                    ? "bg-primary-lighter dark:bg-primary-dlighter border border-primary dark:border-primary-hover text-primary-ddarker"
                    : "border border-top-border dark:border-top-dborder hover:bg-bg-hover dark:hover:bg-bg-dhover"
                }`}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                Filter
              </button>

              <button
                className="px-3 py-1.5 border rounded border-top-border dark:border-top-dborder hover:bg-bg-hover dark:hover:bg-bg-dhover"
                onClick={reloadAppointments}
              >
                Refresh
              </button>

              <DynamicOfficeDropdown
                locations={locations}
                selected={selectedOffices as string[]}
                onChange={setSelectedOffices}
              />
            </div>

            {activeTab === "appointments" ? (
              <button
                className="px-3 py-1.5 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
                onClick={handlePrintDay}
              >
                Print Day
              </button>
            ) : (
              <button
                className="px-3 py-1.5 rounded bg-grncon text-input-lighter hover:bg-grncon-hover"
                onClick={() => setShowNewAppointment(true)}
              >
                + Add Appointment
              </button>
            )}
          </div>

          <hr className="border-border dark:border-border-dark" />

          {/* Date Navigation */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-text-primary dark:text-text-darkPrimary">
              {leftLabel}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center" ref={datePickerWrapperRef}>
                <DatePickerPopover
                  value={cursorDate}
                  onSelect={handleDateSelect}
                />

                <button
                  className="px-3 py-1.5 bg-surface dark:bg-surface-dark border border-l-0 border-border dark:border-border-dark hover:bg-surface-hover dark:hover:bg-surface-dhover"
                  onClick={goPrev}
                >
                  <ArrowLeft className="text-text-primary dark:text-text-darkPrimary" />
                </button>

                <div className="px-3 py-1.5 bg-surface dark:bg-surface-dark border-t border-b border-border dark:border-border-dark">
                  {cursorDate.toLocaleDateString()}
                </div>

                <button
                  className="px-3 py-1.5 bg-surface dark:bg-surface-dark border rounded-r border-border dark:border-border-dark hover:bg-surface-hover dark:hover:bg-surface-dhover"
                  onClick={goNext}
                >
                  <ArrowRight className="text-text-primary dark:text-text-darkPrimary" />
                </button>
              </div>

              <select
                className={`px-3 py-1.5 border border-top-border dark:border-dButton-mborder rounded ${
                  activeTab === "appointments"
                    ? "bg-surface dark:bg-side-dark text-text-muted dark:text-text-darkMuted cursor-not-allowed"
                    : "bg-side dark:bg-dButton-mbg hover:bg-top dark:hover:bg-dButton-mhover cursor-pointer"
                }`}
                value={slotSize}
                onChange={(e) =>
                  setSlotSize(Number(e.target.value) as SlotSize)
                }
                disabled={activeTab === "appointments"}
              >
                {SLOT_OPTIONS.map((s) => (
                  <option
                    className="bg-surface dark:bg-side-dark hover:bg-surface-hover dark:hover:bg-top-dark"
                    key={s}
                    value={s}
                  >
                    {s} min
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-border dark:border-border-dark" />
        </>
      )}

      <div className="flex min-h-[400px] bg-bg dark:bg-bg-dark rounded">
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
            <div id="print-day-root">
              {/* Print-only date header (hidden on screen, shows in print) */}
              <div className="print-day-header hidden print:block text-center text-sm font-medium mb-2">
                {leftLabel}
              </div>

              <AppointmentsTable
                appointments={filteredAppointments}
                date={cursorDate}
                loading={loadingAppts}
                loadAppointments={reloadAppointments}
                selectedOffices={selectedOffices}
              />
            </div>
          )}

          {activeTab === "day" && (
            <DayViewGrid
              primaryOfficeSlug={primaryOfficeSlug}
              selectedOffices={selectedOffices}
              providerName={providerLabel}
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
              primaryOfficeSlug={primaryOfficeSlug}
              selectedOffices={selectedOffices}
              providerName={providerLabel}
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
        </div>
      </div>

      {/* Modals */}
      {showNewAppointment &&
        (console.log("Schedule: providerId =", providerId), null)}

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
          locations={locations}
          primaryOfficeSlug={primaryOffice}
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
          requestConfirm={requestConfirmAsync}
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
            locations={locations}
            onClose={() => setEditingAppt(null)}
            onUpdated={reloadAppointments}
            appointmentTypes={appointmentTypes}
            requestConfirm={requestConfirmAsync}
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
          setConfirmData({
            open: false,
            message: "",
            onConfirm: () => {},
            onCancel: undefined,
          });
        }}
        onCancel={() => {
          if (confirmData.onCancel) {
            confirmData.onCancel();
          }
          setConfirmData({
            open: false,
            message: "",
            onConfirm: () => {},
            onCancel: undefined,
          });
        }}
      />
    </div>
  );
};

export default SchedulePage;
