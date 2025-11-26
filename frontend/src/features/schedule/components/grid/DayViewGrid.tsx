// frontend/src/features/schedule/components/DayViewGrid.tsx

import React, { useMemo, useState } from "react";
import { Appointment } from "../../services";
import { ScheduleSettings } from "../../types";
import { parseLocalDate, isSameLocalDay } from "../../../../utils";
import { useBusinessHours, usePositionedAppointments } from "../../hooks";
import { MultiSlotModal } from "../modals";
import {
  SLIVER_PERCENT,
  computeClusterBoxes,
  computeClosedOverlays,
  buildDaySlots,
  formatTimeLabel,
  formatOfficeLabel,
} from "./logic";

interface DayViewGridProps {
  office: string;
  selectedOffices?: string[];
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

export default function DayViewGrid({
  office,
  selectedOffices,
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
  /* ------------------------------ Hours Logic ------------------------------ */

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

  const open = isDayOpen(date);
  const { start: openHour, end: closeHour } = getOpenRange(date);

  const slots = useMemo(
    () => buildDaySlots(openHour, closeHour, slotMinutes),
    [openHour, closeHour, slotMinutes]
  );

  /* --------------------- Appointment Position + Clusters -------------------- */

  const dayAppointments = useMemo(
    () =>
      (appointments ?? []).filter(
        (a) => a.date && isSameLocalDay(a.date, date)
      ),
    [appointments, date]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { positioned, clusters } = usePositionedAppointments(dayAppointments);

  /* ------------------------------ Cluster Modal ----------------------------- */

  const [clusterModal, setClusterModal] = useState<{
    open: boolean;
    appointments: Appointment[];
  }>({ open: false, appointments: [] });

  /* ----------------------------- Office Label ------------------------------- */

  const officeLabel = useMemo(
    () => formatOfficeLabel(officesForHours, office),
    [officesForHours, office]
  );

  /* ------------------------------- Render Appts ----------------------------- */

  const renderAppointments = () => {
    return clusters.flatMap((cluster, clusterIndex) => {
      const { n, boxes, collapsedBox } = computeClusterBoxes(
        cluster,
        openHour,
        slotMinutes
      );

      if (collapsedBox) {
        return [
          <div
            key={`cluster-${date.toISOString()}-${clusterIndex}`}
            className="absolute rounded text-white text-xs p-1.5 shadow-sm hover:brightness-105 transition-all pointer-events-auto flex items-center justify-center text-center bg-orange-500"
            style={{
              top: collapsedBox.top,
              height: collapsedBox.height,
              left: 0,
              width: `${100 - SLIVER_PERCENT}%`,
              zIndex: 15,
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

      return boxes.map(({ appt, top, height, leftPercent, widthPercent }) => {
        const bg =
          appt.appointment_type === "Block Time"
            ? "#737373"
            : appt.color_code || "#3B82F6";

        const isBlock = appt.is_block === true;

        return (
          <div
            key={`${appt.id}-${appt.date}-${appt.start_time}`}
            className="absolute rounded text-white text-xs p-1.5 shadow-sm hover:brightness-105 transition-all pointer-events-auto flex flex-col items-center justify-center text-center"
            style={{
              top,
              height,
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              backgroundColor: bg,
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEditAppointment?.(appt);
            }}
          >
            {isBlock ? (
              <>
                <div className="text-[11px] uppercase tracking-wide">
                  {appt.appointment_type}
                </div>
                <div className="text-[11px] opacity-90">
                  {appt.provider_name}
                </div>
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

  /* ------------------------------ Drag Select ------------------------------ */

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

    // IMPORTANT: do NOT pre-authorize overlap here.
    // Always start with allowOverlap = false; the modal will handle conflicts.
    onSelectEmptySlot?.(start, end, false);

    resetSelection();
  };

  /* ------------------------------ Closed Hours ------------------------------ */

  const { topOverlayHeightPx, bottomOverlayTopPx } = computeClosedOverlays(
    openHour,
    closeHour,
    slotMinutes
  );

  /* -------------------------------- RENDER -------------------------------- */

  if (!open) {
    return (
      <div className="border rounded overflow-hidden bg-white select-none relative">
        <div className="p-6 text-center text-gray-500 italic">
          Office closed on {date.toLocaleDateString()}
        </div>

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

  return (
    <div className="border rounded overflow-hidden bg-white select-none relative">
      {/* Header */}
      <div className="grid grid-cols-[120px_1fr] bg-gray-100 border-b text-sm font-semibold">
        <div className="p-2 border-r text-gray-700 text-right pr-3 font-semibold">
          Time
        </div>
        <div className="p-2">
          {providerName} — {officeLabel}
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500 italic">
          Loading appointments…
        </div>
      ) : (
        <div className="grid grid-cols-[120px_1fr] text-sm relative">
          {/* Time Column */}
          <div>
            {slots.map((t) => {
              const [h, m] = t.split(":").map(Number);

              return (
                <div
                  key={t}
                  className="border-r border-b p-2 text-gray-700 h-12 text-right pr-3 font-medium bg-gray-50"
                >
                  {formatTimeLabel(h, m)}
                </div>
              );
            })}
          </div>

          {/* Grid */}
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
              {renderAppointments()}
            </div>
          </div>
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
