// frontend/src/features/schedule/components/WeekViewGrid.tsx
import React, { useMemo, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { Appointment } from "../services/appointmentsApi";
import { ScheduleSettings } from "../types/scheduleSettings";
import { useBusinessHoursFilter } from "../hooks/useBusinessHoursFilter";
import { parseLocalDate, isSameLocalDay } from "../../../utils/dateUtils";

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
  const { isDayOpen, getOpenRange } = useBusinessHoursFilter(
    scheduleSettings,
    office
  );

  // --- derive week days (Mon–Sun) ---
  const weekDays = useMemo(() => {
    const monday = addDays(baseDate, -((baseDate.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [baseDate]);

  // --- only open days per schedule ---
  const openDays = useMemo(
    () => weekDays.filter((d) => isDayOpen(d)),
    [weekDays, isDayOpen]
  );

  const minuteHeight = SLOT_ROW_PX / slotMinutes;
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // --- render appointment boxes ---
  const renderAppointmentsForDay = (day: Date) => {
    const { start: openHour } = getOpenRange(day);
    const apptsForDay = (appointments ?? [])
      .filter((a) => a.date && isSameLocalDay(a.date, day))
      .filter((a) => a.start_time && a.end_time)
      .map((a) => ({
        ...a,
        start: timeToMinutes(a.start_time ?? "00:00"),
        end: timeToMinutes(a.end_time ?? "00:00"),
      }))
      .sort((a, b) => a.start - b.start);

    // group overlapping appointments
    const clusters: (typeof apptsForDay)[] = [];
    let current: typeof apptsForDay = [];
    for (const appt of apptsForDay) {
      const last = current[current.length - 1];
      if (!last || appt.start < last.end) {
        current.push(appt);
      } else {
        clusters.push(current);
        current = [appt];
      }
    }
    if (current.length) clusters.push(current);

    return clusters.flatMap((cluster) => {
      const n = cluster.length;
      const usableWidth = 100 - SLIVER_PERCENT;
      const widthPercent = usableWidth / n;

      return cluster.map((appt, i) => {
        const top = (appt.start - openHour * 60) * minuteHeight;
        const height = (appt.end - appt.start) * minuteHeight;
        const left = i * widthPercent;
        const bg =
          appt.appointment_type === "Block Time"
            ? "#737373"
            : appt.color_code || "#3B82F6";

        const isBlockType = appt.is_block === true;

        return (
          <div
            key={`${appt.id}-${appt.date}-${appt.start_time}`}
            onClick={() => onEditAppointment?.(appt)}
            className="absolute rounded text-white text-xs p-1.5 shadow-sm cursor-pointer hover:brightness-105 transition-all flex flex-col items-center justify-center text-center"
            style={{
              top,
              height,
              left: `${left}%`,
              width: `${widthPercent}%`,
              backgroundColor: bg,
            }}
          >
            {isBlockType ? (
              <>
                <div className="text-s uppercase tracking-wide">
                  {appt.appointment_type}
                </div>
                <div className="text-xs">{appt.provider_name}</div>
                {appt.chief_complaint && (
                  <div className="text-xs italic opacity-90">
                    {appt.chief_complaint}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="font-semibold truncate">
                  {appt.patient_name || "(No Patient)"}
                </div>
                <div className="truncate opacity-90">
                  {appt.appointment_type}
                </div>
              </>
            )}
          </div>
        );
      });
    });
  };

  // --- selection logic ---
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
    const { start: openHour } = getOpenRange(selDay);
    const a = Math.min(selStartIdx, selEndIdx);
    const b = Math.max(selStartIdx, selEndIdx);

    const startMinutes = openHour * 60 + a * slotMinutes;
    const endMinutes = openHour * 60 + (b + 1) * slotMinutes;

    const start = parseLocalDate(selDay.toISOString().split("T")[0]);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = parseLocalDate(selDay.toISOString().split("T")[0]);
    end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    const overlaps = appointments.some((x) => {
      const startStr = x.start_time ?? "00:00";
      const endStr = x.end_time ?? "00:00";

      const s =
        parseInt(startStr.slice(0, 2)) * 60 + parseInt(startStr.slice(3, 5));
      const e =
        parseInt(endStr.slice(0, 2)) * 60 + parseInt(endStr.slice(3, 5));

      return (
        x.provider === providerId &&
        x.date === start.toISOString().split("T")[0] &&
        s < endMinutes &&
        e > startMinutes
      );
    });

    const proceed = (allow = false) => {
      onSelectEmptySlot?.(start, end, allow);
      setIsSelecting(false);
      setSelDay(null);
      setSelStartIdx(null);
      setSelEndIdx(null);
    };

    if (overlaps && requestConfirm) {
      requestConfirm(
        "This time overlaps with another appointment for the same provider. Continue?",
        () => proceed(true)
      );
    } else {
      proceed(false);
    }
  };

  // --- render ---
  return (
    <div className="border rounded overflow-hidden bg-white select-none relative">
      {/* Header */}
      <div
        className="grid border-b text-sm font-semibold bg-gray-100"
        style={{ gridTemplateColumns: `120px repeat(${openDays.length}, 1fr)` }}
      >
        <div className="p-2 border-r text-gray-700 text-right pr-3 font-semibold">
          Time
        </div>
        {openDays.map((day) => (
          <div key={day.toISOString()} className="p-2 text-center border-r">
            {format(day, "EEE dd")}
          </div>
        ))}
      </div>

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
              (_, i) => {
                const hour = 8 + Math.floor((i * slotMinutes) / 60);
                const minute = (i * slotMinutes) % 60;
                const suffix = hour >= 12 ? "PM" : "AM";
                const hour12 = ((hour + 11) % 12) + 1;
                const shaded = Math.floor(hour) % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`border-r border-b p-2 text-gray-700 h-12 text-right pr-3 font-medium ${
                      shaded ? "bg-gray-50" : "bg-gray-100/40"
                    }`}
                  >
                    {`${hour12}:${String(minute).padStart(2, "0")} ${suffix}`}
                  </div>
                );
              }
            )}
          </div>

          {/* Day columns */}
          {openDays.map((day) => {
            const { start: openHour, end: closeHour } = getOpenRange(day);
            const slotsPerDay = ((closeHour - openHour) * 60) / slotMinutes;

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

                {/* Dim closed hours */}
                {openHour > 8 && (
                  <div
                    className="absolute top-0 left-0 right-0 bg-gray-100 opacity-60 pointer-events-none"
                    style={{
                      height: `${
                        (openHour - 8) * (60 / slotMinutes) * SLOT_ROW_PX
                      }px`,
                    }}
                  />
                )}
                {closeHour < 17 && (
                  <div
                    className="absolute left-0 right-0 bg-gray-100 opacity-60 pointer-events-none"
                    style={{
                      top: `${
                        (closeHour - 8) * (60 / slotMinutes) * SLOT_ROW_PX
                      }px`,
                      bottom: 0,
                    }}
                  />
                )}

                {/* Appointments */}
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
