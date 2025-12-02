// frontend/src/features/schedule/components/grid/WeekViewGrid.tsx

import React, { useMemo, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { parseLocalDate, isSameLocalDay } from "../../../../utils";
import { MultiSlotModal } from "../modals";
import { Appointment } from "../../services";
import { ScheduleSettings } from "../../types";
import { useBusinessHours } from "../../hooks";
import { positionAppointments, buildClusters } from "../../logic";
import {
  SLIVER_PERCENT,
  computeClusterBoxes,
  computeClosedOverlays,
  computeSlotsPerDay,
  buildAppointmentTooltip,
  formatTimeLabel,
} from "./logic";

interface WeekViewGridProps {
  providerName: string;
  office: string;
  selectedOffices?: string[];

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

export default function WeekViewGrid({
  providerName,
  office,
  selectedOffices,
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
  /* ------------------------------ Office Logic ------------------------------ */

  const officesForHours = useMemo(
    () =>
      selectedOffices && selectedOffices.length > 0
        ? selectedOffices
        : [office],
    [office, selectedOffices]
  );

  const { isDayOpen, getOpenRange } = useBusinessHours(
    scheduleSettings,
    officesForHours
  );

  /* ------------------------------- Week Days -------------------------------- */

  const weekDays = useMemo(() => {
    const monday = addDays(baseDate, -((baseDate.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [baseDate]);

  const openDays = useMemo(
    () => weekDays.filter((d) => isDayOpen(d)),
    [weekDays, isDayOpen]
  );

  /* ------------------------ Cluster Modal Handling -------------------------- */

  const [clusterModal, setClusterModal] = useState<{
    open: boolean;
    appointments: Appointment[];
  }>({ open: false, appointments: [] });

  /* ---------------------- Render Appointments for a Day --------------------- */

  const renderAppointmentsForDay = (day: Date) => {
    const todays = (appointments ?? []).filter(
      (a) => a.date && isSameLocalDay(a.date, day)
    );

    const positioned = positionAppointments(todays);
    const clusters = buildClusters(positioned);

    const { start: openHour } = getOpenRange(day);

    return clusters.flatMap((cluster, idx) => {
      const { n, boxes, collapsedBox } = computeClusterBoxes(
        cluster,
        openHour,
        slotMinutes
      );

      // Collapsed cluster card
      if (collapsedBox) {
        return [
          <div
            key={`cluster-${day.toISOString()}-${idx}`}
            className="absolute rounded bg-orange-500 text-white text-xs p-1.5 shadow-sm cursor-pointer hover:brightness-105 transition-all flex items-center justify-center text-center"
            style={{
              top: collapsedBox.top,
              height: collapsedBox.height,
              left: 0,
              width: `${100 - SLIVER_PERCENT}%`,
              zIndex: 20,
            }}
            title={`Click to view all ${n} appointments`}
            onClick={(e) => {
              e.stopPropagation();
              setClusterModal({ open: true, appointments: cluster });
            }}
          >
            Click to view all {n} appointments
          </div>,
        ];
      }

      // Standard appointments
      return boxes.map(({ appt, top, height, leftPercent, widthPercent }) => {
        const bg =
          appt.appointment_type === "Block Time"
            ? "#737373"
            : appt.color_code || "#3B82F6";

        const isBlock = appt.is_block === true;

        return (
          <div
            key={`${appt.id}-${appt.date}-${appt.start_time}`}
            className="absolute rounded text-white text-xs p-1.5 shadow-sm cursor-pointer hover:brightness-105 transition-all flex flex-col"
            style={{
              top,
              height,
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              backgroundColor: bg,
              zIndex: 10,
              minWidth: 0,
            }}
            onClick={() => onEditAppointment?.(appt)}
            title={isBlock ? undefined : buildAppointmentTooltip(appt)}
          >
            {isBlock ? (
              <div className="w-full text-center">
                <div className="font-semibold uppercase truncate">
                  {appt.appointment_type}
                </div>
                <div className="truncate text-xs opacity-90">
                  {appt.provider_name}
                </div>
              </div>
            ) : (
              <>
                <div className="truncate font-semibold">
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

  /* --------------------------- Drag-to-Select Logic -------------------------- */

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

  const resetSelection = () => {
    setIsSelecting(false);
    setSelDay(null);
    setSelStartIdx(null);
    setSelEndIdx(null);
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

    // IMPORTANT: do NOT pre-authorize overlap here either.
    onSelectEmptySlot?.(start, end, false);

    resetSelection();
  };

  /* ---------------------------------- RENDER ---------------------------------- */

  return (
    <div className="border rounded overflow-hidden bg-white select-none relative">
      {/* Header */}
      <div
        className="grid border-b text-sm font-semibold bg-gray-100"
        style={{
          gridTemplateColumns: `120px repeat(${openDays.length}, 1fr)`,
        }}
      >
        <div className="p-2 border-r text-right text-gray-700 font-semibold">
          Time
        </div>

        {openDays.map((day) => (
          <div key={day.toISOString()} className="p-2 text-center border-r">
            {format(day, "EEE dd")}
          </div>
        ))}
      </div>

      {/* Provider Label */}
      <div className="px-4 py-2 text-sm text-gray-700 border-b bg-gray-50">
        Viewing appointments for{" "}
        <span className="font-semibold">{providerName}</span>
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
          {/* Time Column */}
          <div>
            {Array.from({ length: computeSlotsPerDay(8, 17, slotMinutes) }).map(
              (_, i) => {
                const totalMinutes = 8 * 60 + i * slotMinutes; // start at 8:00
                const h = Math.floor(totalMinutes / 60);
                const m = totalMinutes % 60;
                return (
                  <div
                    key={i}
                    className={`border-r border-b p-2 h-12 text-right pr-3 font-medium ${
                      Math.floor(h) % 2 === 0 ? "bg-gray-50" : "bg-gray-100/40"
                    }`}
                  >
                    {formatTimeLabel(h, m)}
                  </div>
                );
              }
            )}
          </div>

          {/* Appointment Columns */}
          {openDays.map((day) => {
            const { start: openHour, end: closeHour } = getOpenRange(day);

            const slotsPerDay = computeSlotsPerDay(
              openHour,
              closeHour,
              slotMinutes
            );

            const { topOverlayHeightPx, bottomOverlayTopPx } =
              computeClosedOverlays(openHour, closeHour, slotMinutes);

            return (
              <div
                key={day.toISOString()}
                className="relative border-l"
                onMouseUp={handleMouseUp}
                onMouseLeave={resetSelection}
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
                      className={`border-b h-12 cursor-crosshair ${
                        selected ? "bg-gray-300" : "hover:bg-gray-50"
                      }`}
                      onMouseDown={() => handleMouseDown(day, idx)}
                      onMouseEnter={() => handleMouseEnter(idx)}
                    />
                  );
                })}

                {/* Closed-Hours Overlays */}
                {topOverlayHeightPx > 0 && (
                  <div
                    className="absolute top-0 left-0 right-0 bg-gray-100 opacity-60 pointer-events-none"
                    style={{ height: `${topOverlayHeightPx}px` }}
                  />
                )}

                {bottomOverlayTopPx !== null && (
                  <div
                    className="absolute left-0 right-0 bg-gray-100 opacity-60 pointer-events-none"
                    style={{ top: `${bottomOverlayTopPx}px`, bottom: 0 }}
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

      {clusterModal.open && (
        <MultiSlotModal
          appointments={clusterModal.appointments}
          onClose={() => setClusterModal({ open: false, appointments: [] })}
          onEditAppointment={(appt) => {
            if (onEditAppointment) onEditAppointment(appt);
          }}
        />
      )}
    </div>
  );
}
