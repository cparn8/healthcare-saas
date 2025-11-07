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
  onSelectEmptySlot?: (start: Date, end: Date) => void;
  baseDate: Date;
  scheduleSettings?: ScheduleSettings | null;
  startHour: number;
  endHour: number;
}

const SLOT_ROW_PX = 48;

function weekdayKey(d: Date): Weekday {
  return format(d, "EEE").toLowerCase().slice(0, 3) as Weekday;
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
}: WeekViewGridProps) {
  const allDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(baseDate), i)),
    [baseDate]
  );

  // Filter out closed days entirely
  const openDays = useMemo(() => {
    return allDays.filter((d) => {
      const key = weekdayKey(d);
      const h =
        scheduleSettings?.business_hours?.[
          office as keyof ScheduleSettings["business_hours"]
        ]?.[key];
      return !h || h.open; // default to open if missing
    });
  }, [allDays, office, scheduleSettings]);

  // Compute global earliest start and latest end among open days
  const ranges = openDays.map((d) => {
    const k = weekdayKey(d);
    const h = scheduleSettings?.business_hours?.[
      office as keyof ScheduleSettings["business_hours"]
    ]?.[k] ?? { open: true, start: "08:00", end: "17:00" };
    return {
      startHour: parseInt(h.start.split(":")[0], 10),
      endHour: parseInt(h.end.split(":")[0], 10),
    };
  });

  const minStartHour =
    ranges.length > 0 ? Math.min(...ranges.map((r) => r.startHour)) : 8;
  const maxEndHour =
    ranges.length > 0 ? Math.max(...ranges.map((r) => r.endHour)) : 17;

  // Build the global slot labels (for left time ruler + row count)
  const slots = useMemo(() => {
    const times: string[] = [];
    for (let h = minStartHour; h < maxEndHour; h++) {
      for (let m = 0; m < 60; m += slotMinutes) {
        times.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }
    }
    return times;
  }, [minStartHour, maxEndHour, slotMinutes]);

  const minuteHeight = SLOT_ROW_PX / slotMinutes;

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Selection state (drag to create)
  const [isSelecting, setIsSelecting] = useState(false);
  const [selStart, setSelStart] = useState<{
    dayIdx: number;
    slotIdx: number;
  } | null>(null);
  const [selEnd, setSelEnd] = useState<{
    dayIdx: number;
    slotIdx: number;
  } | null>(null);

  const handleMouseDown = (dayIdx: number, slotIdx: number) => {
    setIsSelecting(true);
    setSelStart({ dayIdx, slotIdx });
    setSelEnd({ dayIdx, slotIdx });
  };
  const handleMouseEnter = (dayIdx: number, slotIdx: number) => {
    if (!isSelecting || !selStart) return;
    setSelEnd({ dayIdx, slotIdx });
  };
  const handleMouseUp = () => {
    if (!isSelecting || !selStart || !selEnd) return;

    // Only allow within the same day for creation
    if (selStart.dayIdx !== selEnd.dayIdx) {
      setIsSelecting(false);
      setSelStart(null);
      setSelEnd(null);
      return;
    }

    const day = openDays[selStart.dayIdx];
    const { startHour } = ranges[selStart.dayIdx];

    const a = Math.min(selStart.slotIdx, selEnd.slotIdx);
    const b = Math.max(selStart.slotIdx, selEnd.slotIdx);

    const startMinutes = startHour * 60 + a * slotMinutes;
    const endMinutes = startHour * 60 + (b + 1) * slotMinutes;

    const start = new Date(day);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = new Date(day);
    end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    onSelectEmptySlot?.(start, end);

    setIsSelecting(false);
    setSelStart(null);
    setSelEnd(null);
  };

  const renderAppointmentsForDay = (
    dayIdx: number,
    day: Date,
    startHour: number,
    endHour: number
  ) => {
    const appts = appointments
      .filter((a) => {
        const d = a.date ? parseISO(a.date) : null;
        return d && isSameDay(d, day);
      })
      .sort(
        (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
      );

    return appts.map((a) => {
      const startM = timeToMinutes(a.start_time);
      const endM = timeToMinutes(a.end_time);
      const top = (startM - startHour * 60) * minuteHeight;
      const height = (endM - startM) * minuteHeight;
      const bg =
        a.appointment_type === "Block Time"
          ? "#9CA3AF"
          : a.color_code || "#3B82F6";

      return (
        <div
          key={a.id}
          className="absolute left-1 right-1 rounded text-white text-xs p-1.5 shadow-sm cursor-pointer hover:brightness-105 pointer-events-auto"
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
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 italic">
        Loading appointments…
      </div>
    );
  }

  if (openDays.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 italic border rounded bg-gray-50">
        All days are closed for the selected week.
      </div>
    );
  }

  return (
    <div className="border rounded overflow-hidden bg-white select-none">
      {/* Header */}
      <div
        className="grid bg-gray-100 border-b text-sm font-semibold"
        style={{ gridTemplateColumns: `120px repeat(${openDays.length}, 1fr)` }}
      >
        <div className="p-2 border-r text-gray-700">Time</div>
        {openDays.map((d) => (
          <div key={d.toISOString()} className="p-2 text-center border-r">
            {format(d, "EEE dd")}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        className="grid text-sm relative"
        style={{ gridTemplateColumns: `120px repeat(${openDays.length}, 1fr)` }}
      >
        {/* Time ruler */}
        <div>
          {slots.map((t) => (
            <div
              key={t}
              className="border-r border-b p-2 text-gray-700 h-12 bg-gray-50"
            >
              {t}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {openDays.map((day, idx) => {
          const { startHour, endHour } = ranges[idx];
          const topOffset =
            (startHour - minStartHour) * 60 * (SLOT_ROW_PX / slotMinutes);
          const bandHeight =
            (endHour - startHour) * 60 * (SLOT_ROW_PX / slotMinutes);

          return (
            <div
              key={day.toISOString()}
              className="relative border-l"
              onMouseUp={handleMouseUp}
            >
              {/* Grid rows for alignment */}
              {slots.map((_, slotIdx) => (
                <div key={slotIdx} className="border-b h-12" />
              ))}

              {/* Shaded closed bands (top/bottom) to visualize differing hours */}
              {topOffset > 0 && (
                <div
                  className="absolute inset-x-0 bg-gray-100/70 pointer-events-none"
                  style={{ top: 0, height: topOffset }}
                />
              )}
              {bandHeight < slots.length * SLOT_ROW_PX && (
                <div
                  className="absolute inset-x-0 bg-gray-100/70 pointer-events-none"
                  style={{
                    top: topOffset + bandHeight,
                    height:
                      slots.length * SLOT_ROW_PX - (topOffset + bandHeight),
                  }}
                />
              )}

              {/* Interactive band (only open hours are interactive) */}
              <div
                className="absolute inset-x-0"
                style={{ top: topOffset, height: bandHeight }}
              >
                {/* drag-to-create layer */}
                {Array.from(
                  { length: Math.ceil((bandHeight || 1) / SLOT_ROW_PX) },
                  (_, i) => i
                ).map((i) => {
                  const slotIdx = i;
                  const selected =
                    isSelecting &&
                    selStart &&
                    selEnd &&
                    selStart.dayIdx === idx &&
                    idx === selEnd.dayIdx &&
                    slotIdx >= Math.min(selStart.slotIdx, selEnd.slotIdx) &&
                    slotIdx <= Math.max(selStart.slotIdx, selEnd.slotIdx);

                  return (
                    <div
                      key={i}
                      className={`h-12 border-b transition-colors ${
                        selected ? "bg-gray-300" : "hover:bg-blue-50"
                      } cursor-crosshair`}
                      onMouseDown={() => handleMouseDown(idx, slotIdx)}
                      onMouseEnter={() => handleMouseEnter(idx, slotIdx)}
                    />
                  );
                })}

                {/* appointments overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {renderAppointmentsForDay(idx, day, startHour, endHour)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
