// frontend/src/features/schedule/components/WeekViewGrid.tsx
import React, { useMemo, useState } from "react";
import { startOfWeek, addDays, format, isSameDay, parseISO } from "date-fns";
import { Appointment } from "../types/appointment";
import { ScheduleSettings, Weekday } from "../types/scheduleSettings";

interface WeekViewGridProps {
  providerName: string;
  office: string;
  slotMinutes: number;
  appointments?: Appointment[];
  loading?: boolean;
  onEditAppointment?: (appt: Appointment) => void;
  onSelectEmptySlot?: (start: Date, end: Date, allowOverlap?: boolean) => void;
  baseDate: Date;
  scheduleSettings?: ScheduleSettings | null;
  providerId?: number | null;
  requestConfirm?: (message: string, onConfirm: () => void) => void;
}

const SLOT_ROW_PX = 48;
const SLIVER_PERCENT = 12;

function wkKey(d: Date): Weekday {
  return d
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase()
    .slice(0, 3) as Weekday;
}

export default function WeekViewGrid({
  providerName,
  office,
  slotMinutes,
  appointments = [],
  loading = false,
  onEditAppointment,
  onSelectEmptySlot,
  baseDate,
  scheduleSettings,
  providerId,
  requestConfirm,
}: WeekViewGridProps) {
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(baseDate), i)),
    [baseDate]
  );

  const minuteHeight = SLOT_ROW_PX / slotMinutes;

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const overlaps = (
    aStart: number,
    aEnd: number,
    bStart: number,
    bEnd: number
  ): boolean => aStart < bEnd && aEnd > bStart;

  // filter visible days based on business_hours
  const openDays = weekDays.filter((day) => {
    const weekday = wkKey(day);
    const hours =
      scheduleSettings?.business_hours?.[
        office as keyof ScheduleSettings["business_hours"]
      ]?.[weekday];
    return hours && hours.open;
  });

  const renderAppointmentsForDay = (day: Date) => {
    const weekday = wkKey(day);
    const hours =
      scheduleSettings?.business_hours?.[
        office as keyof ScheduleSettings["business_hours"]
      ]?.[weekday];
    if (!hours) return null;

    const startHour = parseInt(hours.start.split(":")[0], 10);
    const endHour = parseInt(hours.end.split(":")[0], 10);

    const apptsForDay = appointments
      .filter((a) => a.date && isSameDay(parseISO(a.date), day))
      .filter((a) => a.start_time && a.end_time)
      .map((a) => ({
        ...a,
        start: timeToMinutes(a.start_time),
        end: timeToMinutes(a.end_time),
      }))
      .sort((a, b) => a.start - b.start);

    const clusters: (typeof apptsForDay)[] = [];
    let currentCluster: typeof apptsForDay = [];
    for (const appt of apptsForDay) {
      const last = currentCluster[currentCluster.length - 1];
      if (!last) {
        currentCluster.push(appt);
        continue;
      }

      // only cluster if there is actual time overlap, not back-to-back
      if (appt.start < last.end) {
        currentCluster.push(appt);
      } else {
        clusters.push(currentCluster);
        currentCluster = [appt];
      }
    }
    if (currentCluster.length) clusters.push(currentCluster);

    return clusters.flatMap((cluster) => {
      const n = cluster.length;
      const usableWidth = 100 - SLIVER_PERCENT;
      const widthPercent = usableWidth / n;

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
            onClick={() => onEditAppointment?.(appt)}
            className="absolute rounded text-white text-xs p-1.5 shadow-sm cursor-pointer hover:brightness-105 transition-all"
            style={{
              top,
              height,
              left: `${left}%`,
              width: `${widthPercent}%`,
              backgroundColor: bg,
            }}
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
  };

  // --- Selection (drag-to-create) ---
  const [isSelecting, setIsSelecting] = useState(false);
  const [selDay, setSelDay] = useState<Date | null>(null);
  const [selStartIdx, setSelStartIdx] = useState<number | null>(null);
  const [selEndIdx, setSelEndIdx] = useState<number | null>(null);

  const handleMouseDown = (day: Date, idx: number) => {
    setIsSelecting(true);
    setSelDay(day);
    setSelStartIdx(idx);
    setSelEndIdx(idx);
  };

  const handleMouseEnter = (idx: number) => {
    if (!isSelecting || selStartIdx === null) return;
    setSelEndIdx(idx);
  };

  const handleMouseUp = () => {
    if (!isSelecting || !selDay || selStartIdx === null || selEndIdx === null)
      return;

    const weekday = wkKey(selDay);
    const hours =
      scheduleSettings?.business_hours?.[
        office as keyof ScheduleSettings["business_hours"]
      ]?.[weekday];
    if (!hours) return;

    const startHour = parseInt(hours.start.split(":")[0], 10);
    const a = Math.min(selStartIdx, selEndIdx);
    const b = Math.max(selStartIdx, selEndIdx);

    const startMinutes = startHour * 60 + a * slotMinutes;
    const endMinutes = startHour * 60 + (b + 1) * slotMinutes;

    const start = new Date(selDay);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = new Date(selDay);
    end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    const s = (h: string) => {
      const [H, M] = h.split(":").map(Number);
      return H * 60 + M;
    };

    const overlap = appointments.some(
      (x) =>
        x.provider === providerId &&
        x.date === start.toISOString().split("T")[0] &&
        s(x.start_time) < endMinutes &&
        s(x.end_time) > startMinutes
    );

    const proceed = (allow = false) => {
      onSelectEmptySlot?.(start, end, allow);
      setIsSelecting(false);
      setSelDay(null);
      setSelStartIdx(null);
      setSelEndIdx(null);
    };

    if (overlap && requestConfirm) {
      requestConfirm(
        "This time overlaps with another appointment for the same provider. Continue?",
        () => proceed(true) // allowOverlap = true when user confirms
      );
    } else {
      proceed(false);
    }
  };

  return (
    <div className="border rounded overflow-hidden bg-white select-none relative">
      {/* Header */}
      <div
        className="grid border-b text-sm font-semibold bg-gray-100"
        style={{ gridTemplateColumns: `120px repeat(${openDays.length}, 1fr)` }}
      >
        <div className="p-2 border-r text-gray-700">Time</div>
        {openDays.map((day) => (
          <div key={day.toISOString()} className="p-2 text-center border-r">
            {format(day, "EEE dd")}
          </div>
        ))}
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-6 text-center text-gray-500 italic">
          Loading appointments…
        </div>
      ) : (
        <div
          className="grid text-sm relative"
          style={{
            gridTemplateColumns: `120px repeat(${openDays.length}, 1fr)`,
          }}
        >
          {/* Time column */}
          <div>
            {Array.from({ length: (17 - 8) * (60 / slotMinutes) }).map(
              (_, i) => (
                <div
                  key={i}
                  className="border-r border-b p-2 text-gray-700 h-12 bg-gray-50"
                >
                  {`${String(8 + Math.floor((i * slotMinutes) / 60)).padStart(
                    2,
                    "0"
                  )}:${String((i * slotMinutes) % 60).padStart(2, "0")}`}
                </div>
              )
            )}
          </div>

          {/* Day columns */}
          {openDays.map((day) => {
            const weekday = wkKey(day);
            const hours =
              scheduleSettings?.business_hours?.[
                office as keyof ScheduleSettings["business_hours"]
              ]?.[weekday];
            if (!hours) return null;

            const startHour = parseInt(hours.start.split(":")[0], 10);
            const endHour = parseInt(hours.end.split(":")[0], 10);
            const slotsPerDay = ((endHour - startHour) * 60) / slotMinutes;

            return (
              <div
                key={day.toISOString()}
                className="relative border-l"
                onMouseUp={handleMouseUp}
              >
                {Array.from({ length: slotsPerDay }).map((_, idx) => {
                  const selected =
                    isSelecting &&
                    selDay &&
                    isSameDay(selDay, day) &&
                    selStartIdx !== null &&
                    selEndIdx !== null &&
                    idx >= Math.min(selStartIdx, selEndIdx) &&
                    idx <= Math.max(selStartIdx, selEndIdx);

                  return (
                    <div
                      key={idx}
                      className={`border-b h-12 ${
                        selected ? "bg-gray-300" : "hover:bg-gray-50"
                      } cursor-crosshair`}
                      onMouseDown={() => handleMouseDown(day, idx)}
                      onMouseEnter={() => handleMouseEnter(idx)}
                    />
                  );
                })}

                <div className="absolute inset-0 pointer-events-none">
                  <div className="pointer-events-auto">
                    {renderAppointmentsForDay(day)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
