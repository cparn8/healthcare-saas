// frontend/src/features/schedule/components/DayViewGrid.tsx
import React, { useMemo, useState } from "react";
import { Appointment } from "../services/appointmentsApi";
import { ScheduleSettings } from "../types/scheduleSettings";
import { parseLocalDate, isSameLocalDay } from "../../../utils/dateUtils";
import { useBusinessHoursFilter } from "../hooks/useBusinessHoursFilter";

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
const SLIVER_PERCENT = 12;

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
  const { isDayOpen, getOpenRange } = useBusinessHoursFilter(
    scheduleSettings,
    office
  );

  const open = isDayOpen(date);
  const { start: openHour, end: closeHour } = getOpenRange(date);

  const minuteHeight = SLOT_ROW_PX / slotMinutes;
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // --- Time slots derived from hours ---
  const slots = useMemo(() => {
    const out: string[] = [];
    for (let h = openHour; h < closeHour; h++) {
      for (let m = 0; m < 60; m += slotMinutes) {
        out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return out;
  }, [openHour, closeHour, slotMinutes]);

  // --- Filter and cluster appointments ---
  const apptsForDay = useMemo(() => {
    const filtered = (appointments ?? [])
      .filter((a) => a.date && isSameLocalDay(a.date, date))
      .filter((a) => a.start_time && a.end_time)
      .map((a) => ({
        ...a,
        start: timeToMinutes(a.start_time ?? "00:00"),
        end: timeToMinutes(a.end_time ?? "00:00"),
      }))
      .sort((a, b) => a.start - b.start);

    const clusters: (typeof filtered)[] = [];
    let current: typeof filtered = [];
    let clusterEnd = -1;
    for (const appt of filtered) {
      if (!current.length || appt.start < clusterEnd) {
        current.push(appt);
        clusterEnd = Math.max(clusterEnd, appt.end);
      } else {
        clusters.push(current);
        current = [appt];
        clusterEnd = appt.end;
      }
    }
    if (current.length) clusters.push(current);
    return clusters;
  }, [appointments, date]);

  const renderAppointments = () =>
    apptsForDay.flatMap((cluster) => {
      const n = cluster.length;
      const usable = 100 - SLIVER_PERCENT;
      const widthPercent = n > 0 ? usable / n : usable;

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
            key={`${appt.id ?? "ghost"}-${appt.date}-${appt.start_time}`}
            className="absolute rounded text-white text-xs p-1.5 shadow-sm hover:brightness-105 transition-all pointer-events-auto flex flex-col items-center justify-center text-center"
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

  // ---- Drag-to-select ----
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
    const startMinutes = openHour * 60 + a * slotMinutes;
    const endMinutes = openHour * 60 + (b + 1) * slotMinutes;

    const start = parseLocalDate(date.toISOString().split("T")[0]);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = parseLocalDate(date.toISOString().split("T")[0]);
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

    const finalize = (allow = false) => onSelectEmptySlot?.(start, end, allow);
    if (overlaps && requestConfirm) {
      requestConfirm(
        "This time overlaps with another appointment for the same provider. Continue?",
        () => finalize(true)
      );
    } else {
      finalize(false);
    }
    resetSelection();
  };

  // ---- Render ----
  if (!open) {
    return (
      <div className="border rounded overflow-hidden bg-white select-none relative">
        <div className="p-6 text-center text-gray-500 italic">
          Office closed on {date.toLocaleDateString()}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded overflow-hidden bg-white select-none relative">
      {/* Header */}
      <div className="grid grid-cols-[120px_1fr] bg-gray-100 border-b text-sm font-semibold">
        <div className="p-2 border-r text-gray-700 text-right pr-3 font-semibold">
          Time
        </div>
        <div className="p-2">
          {providerName} — {office}
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500 italic">
          Loading appointments…
        </div>
      ) : (
        <div className="grid grid-cols-[120px_1fr] text-sm relative">
          {/* Time column */}
          <div>
            {slots.map((time, i) => {
              const [h, m] = time.split(":").map(Number);
              const suffix = h >= 12 ? "PM" : "AM";
              const hour12 = ((h + 11) % 12) + 1;
              const shaded = Math.floor((i * slotMinutes) / 60) % 2 === 0;
              return (
                <div
                  key={time}
                  className={`border-r border-b p-2 text-gray-700 h-12 text-right pr-3 font-medium ${
                    shaded ? "bg-gray-50" : "bg-gray-100/40"
                  }`}
                >
                  {`${hour12}:${String(m).padStart(2, "0")} ${suffix}`}
                </div>
              );
            })}
          </div>

          {/* Interactive grid */}
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

            {/* Dim closed hours outside open/close range */}
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
              {renderAppointments()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
