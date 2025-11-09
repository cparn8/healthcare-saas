// frontend/src/features/schedule/components/DayViewGrid.tsx
import React, { useMemo, useState } from "react";
import { isSameDay, parseISO } from "date-fns";
import { Appointment } from "../types/appointment";
import { ScheduleSettings, Weekday } from "../types/scheduleSettings";

interface DayViewGridProps {
  office: string;
  providerName: string;
  slotMinutes: number;
  appointments?: Appointment[];
  loading?: boolean;
  onEditAppointment?: (appt: Appointment) => void;
  onSelectEmptySlot?: (start: Date, end: Date, allowOverlap?: boolean) => void;
  onChangeDate?: (newDate: Date) => void;
  date: Date;
  scheduleSettings?: ScheduleSettings | null;
  providerId?: number | null;
  requestConfirm?: (message: string, onConfirm: () => void) => void;
}

const SLOT_ROW_PX = 48;
const SLIVER_PERCENT = 12; // keep a sliver for new bookings

function wkKey(d: Date): Weekday {
  return d
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase()
    .slice(0, 3) as Weekday;
}

export default function DayViewGrid({
  office,
  providerName,
  slotMinutes,
  appointments = [],
  loading = false,
  onEditAppointment,
  onSelectEmptySlot,
  date,
  scheduleSettings,
  providerId,
  requestConfirm,
}: DayViewGridProps) {
  const hours = scheduleSettings?.business_hours?.[
    office as keyof ScheduleSettings["business_hours"]
  ]?.[wkKey(date)] ?? { open: true, start: "08:00", end: "17:00" };

  const open = !!hours.open;
  const startHour = parseInt(hours.start.split(":")[0], 10);
  const endHour = parseInt(hours.end.split(":")[0], 10);

  // ---- slots & helpers ----
  const slots = useMemo(() => {
    const t: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotMinutes) {
        t.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return t;
  }, [startHour, endHour, slotMinutes]);

  const minuteHeight = SLOT_ROW_PX / slotMinutes;
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // ---- same-day appts with minute ranges ----
  const apptsForDay = useMemo(
    () =>
      appointments
        .filter((a) => a.date && isSameDay(parseISO(a.date), date))
        .filter((a) => a.start_time && a.end_time)
        .map((a) => ({
          ...a,
          start: timeToMinutes(a.start_time),
          end: timeToMinutes(a.end_time),
        }))
        .sort((a, b) => a.start - b.start),
    [appointments, date]
  );

  // ---- strict-overlap clustering (no grouping for back-to-back) ----
  const clusters: (typeof apptsForDay)[] = [];
  let current: typeof apptsForDay = [];
  let clusterEnd = -1;

  for (const appt of apptsForDay) {
    if (current.length === 0) {
      current.push(appt);
      clusterEnd = appt.end;
      continue;
    }
    if (appt.start < clusterEnd) {
      current.push(appt);
      clusterEnd = Math.max(clusterEnd, appt.end);
    } else {
      clusters.push(current);
      current = [appt];
      clusterEnd = appt.end;
    }
  }
  if (current.length) clusters.push(current);

  const renderAppointments = () =>
    clusters.flatMap((cluster) => {
      const n = cluster.length;
      const usable = 100 - SLIVER_PERCENT;
      const widthPercent = n > 0 ? usable / n : usable;

      return cluster.map((appt, i) => {
        const top = (appt.start - startHour * 60) * minuteHeight;
        const height = (appt.end - appt.start) * minuteHeight;
        const left = i * widthPercent;
        const bg =
          appt.appointment_type === "Block Time"
            ? "#9CA3AF"
            : appt.color_code || "#3B82F6";

        return (
          <div
            key={appt.id}
            // IMPORTANT: allow clicking blocks, but don't block drag on grid
            className="absolute rounded text-white text-xs p-1.5 shadow-sm hover:brightness-105 transition-all pointer-events-auto"
            style={{
              top,
              height,
              left: `${left}%`,
              width: `${widthPercent}%`,
              backgroundColor: bg,
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEditAppointment?.(appt);
            }}
            title={`${appt.appointment_type} • ${appt.start_time.slice(
              0,
              5
            )}–${appt.end_time.slice(0, 5)}`}
          >
            <div className="font-semibold truncate">
              {appt.appointment_type === "Block Time"
                ? "— Blocked —"
                : appt.patient_name || "(No Patient)"}
            </div>
            {appt.appointment_type !== "Block Time" && (
              <div className="truncate opacity-90">{appt.appointment_type}</div>
            )}
          </div>
        );
      });
    });

  // ---- Drag-to-select (with visible highlight) ----
  const [isSelecting, setIsSelecting] = useState(false);
  const [selStartIdx, setSelStartIdx] = useState<number | null>(null);
  const [selEndIdx, setSelEndIdx] = useState<number | null>(null);

  const resetSelection = () => {
    setIsSelecting(false);
    setSelStartIdx(null);
    setSelEndIdx(null);
  };

  const handleMouseDown = (idx: number) => {
    setIsSelecting(true);
    setSelStartIdx(idx);
    setSelEndIdx(idx);
  };

  const handleMouseEnter = (idx: number) => {
    if (isSelecting) setSelEndIdx(idx);
  };

  const handleMouseUp = () => {
    if (!isSelecting || selStartIdx === null || selEndIdx === null) return;

    const a = Math.min(selStartIdx, selEndIdx);
    const b = Math.max(selStartIdx, selEndIdx);
    const startMinutes = startHour * 60 + a * slotMinutes;
    const endMinutes = startHour * 60 + (b + 1) * slotMinutes;

    const start = new Date(date);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = new Date(date);
    end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    // strict overlap check (no false positives for back-to-back)
    const sHHMM = start.toTimeString().slice(0, 5);
    const eHHMM = end.toTimeString().slice(0, 5);
    const overlaps = appointments.some(
      (x) =>
        x.provider === providerId &&
        x.date === start.toISOString().split("T")[0] &&
        sHHMM < x.end_time &&
        eHHMM > x.start_time
    );

    const finalize = (allow = false) => onSelectEmptySlot?.(start, end, allow);

    if (overlaps && requestConfirm) {
      requestConfirm(
        "This time overlaps with another appointment for the same provider. Continue?",
        () => finalize(true) // proceed with allowOverlap=true
      );
    } else {
      finalize(false); // normal create
    }

    setIsSelecting(false);
    setSelStartIdx(null);
    setSelEndIdx(null);
  };

  if (!open) return null;

  return (
    <div className="border rounded overflow-hidden bg-white select-none relative">
      {/* Header */}
      <div className="grid grid-cols-[120px_1fr] bg-gray-100 border-b text-sm font-semibold">
        <div className="p-2 border-r text-gray-700">Time</div>
        <div className="p-2">
          {providerName} — {office}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-6 text-center text-gray-500 italic">
          Loading appointments…
        </div>
      ) : (
        <div className="grid grid-cols-[120px_1fr] text-sm relative">
          {/* Time column */}
          <div>
            {slots.map((time) => (
              <div
                key={time}
                className="border-r border-b p-2 text-gray-700 h-12 bg-gray-50"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Interactive grid column */}
          <div
            className="relative border-l"
            onMouseUp={handleMouseUp}
            onMouseLeave={resetSelection}
          >
            {slots.map((_, idx) => {
              const selected =
                isSelecting &&
                selStartIdx !== null &&
                selEndIdx !== null &&
                idx >= Math.min(selStartIdx, selEndIdx) &&
                idx <= Math.max(selStartIdx, selEndIdx);

              return (
                <div
                  key={idx}
                  className={`border-b h-12 cursor-crosshair ${
                    selected ? "bg-gray-300" : "hover:bg-gray-50"
                  }`}
                  onMouseDown={() => handleMouseDown(idx)}
                  onMouseEnter={() => handleMouseEnter(idx)}
                />
              );
            })}

            {/* Appointments overlay:
                - pointer-events-none on the container lets drag events hit the grid
                - each block uses pointer-events-auto to still be clickable */}
            <div className="absolute inset-0 pointer-events-none">
              {renderAppointments()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
