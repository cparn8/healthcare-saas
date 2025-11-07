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
  onSelectEmptySlot?: (start: Date, end: Date) => void;
  onChangeDate?: (newDate: Date) => void; // used by parent for date navigation
  date: Date;
  scheduleSettings?: ScheduleSettings | null;
  startHour: number;
  endHour: number;
}

const SLOT_ROW_PX = 48;

function getWeekdayKey(date: Date): Weekday {
  return date
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase()
    .slice(0, 3) as Weekday;
}

const DayViewGrid: React.FC<DayViewGridProps> = ({
  office,
  providerName,
  slotMinutes,
  appointments = [],
  loading = false,
  onEditAppointment,
  onSelectEmptySlot,
  date,
  scheduleSettings,
}) => {
  // --- determine working hours for the selected day ---
  const weekday = getWeekdayKey(date);
  const defaultHours = { open: true, start: "08:00", end: "17:00" };

  const hours =
    scheduleSettings?.business_hours?.[
      office as keyof ScheduleSettings["business_hours"]
    ]?.[weekday] ?? defaultHours;

  const open = !!hours.open;
  const startHour = parseInt(hours.start.split(":")[0], 10);
  const endHour = parseInt(hours.end.split(":")[0], 10);

  // --- build visible time slots ---
  const slots = useMemo(() => {
    if (!open) return [];
    const times: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotMinutes) {
        times.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }
    }
    return times;
  }, [startHour, endHour, slotMinutes, open]);

  const minuteHeight = SLOT_ROW_PX / slotMinutes;
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // --- filter appointments for this specific day ---
  const apptsForDay = useMemo(
    () =>
      appointments.filter((a) => {
        const d = a.date ? parseISO(a.date) : null;
        return d && isSameDay(d, date);
      }),
    [appointments, date]
  );

  // --- slot selection for creating appointments ---
  const [isSelecting, setIsSelecting] = useState(false);
  const [selStartIdx, setSelStartIdx] = useState<number | null>(null);
  const [selEndIdx, setSelEndIdx] = useState<number | null>(null);

  const handleMouseDown = (idx: number) => {
    setIsSelecting(true);
    setSelStartIdx(idx);
    setSelEndIdx(idx);
  };

  const handleMouseEnter = (idx: number) => {
    if (!isSelecting || selStartIdx === null) return;
    setSelEndIdx(idx);
  };

  const handleMouseUp = () => {
    if (!isSelecting || selStartIdx === null || selEndIdx === null) return;

    const startIdx = Math.min(selStartIdx, selEndIdx);
    const endIdx = Math.max(selStartIdx, selEndIdx);

    const startMinutes = startHour * 60 + startIdx * slotMinutes;
    const endMinutes = startHour * 60 + (endIdx + 1) * slotMinutes;

    const start = new Date(date);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = new Date(date);
    end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    onSelectEmptySlot?.(start, end);

    setIsSelecting(false);
    setSelStartIdx(null);
    setSelEndIdx(null);
  };

  // --- render scheduled appointments ---
  const renderAppointments = () =>
    apptsForDay
      .filter((a) => a.start_time && a.end_time)
      .map((a) => {
        const start = timeToMinutes(a.start_time);
        const end = timeToMinutes(a.end_time);
        const top = (start - startHour * 60) * minuteHeight;
        const height = (end - start) * minuteHeight;
        const bg =
          a.appointment_type === "Block Time"
            ? "#9CA3AF"
            : a.color_code || "#3B82F6";

        return (
          <div
            key={a.id}
            className="absolute left-0 right-0 rounded text-white text-xs p-1.5 shadow-sm cursor-pointer hover:brightness-105"
            style={{ top, height, backgroundColor: bg }}
            onClick={() => onEditAppointment?.(a)}
          >
            <div className="font-semibold truncate">
              {a.appointment_type === "Block Time"
                ? "— Blocked —"
                : a.patient_name || "(No Patient)"}
            </div>
            {a.appointment_type !== "Block Time" && (
              <div className="truncate opacity-90">{a.appointment_type}</div>
            )}
          </div>
        );
      });

  // --- render ---
  if (!open) {
    return (
      <div className="p-10 text-center text-gray-500 italic border rounded bg-gray-50">
        This office is closed on{" "}
        <span className="font-medium">{weekday.toUpperCase()}</span>.
      </div>
    );
  }

  return (
    <div className="border rounded overflow-hidden bg-white select-none">
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
          {/* Left: Time labels */}
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

          {/* Right: Interactive slots */}
          <div className="relative border-l" onMouseUp={handleMouseUp}>
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
                  className={`border-b h-12 ${
                    selected ? "bg-gray-200" : "hover:bg-blue-50"
                  } cursor-crosshair`}
                  onMouseDown={() => handleMouseDown(idx)}
                  onMouseEnter={() => handleMouseEnter(idx)}
                />
              );
            })}

            {/* Appointment overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {renderAppointments()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayViewGrid;
