// frontend/src/features/schedule/components/DayViewGrid.tsx
import React, { useState, useEffect } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { Appointment } from '../../schedule/types/appointment';

interface DayViewGridProps {
  office: string;
  providerName: string;
  startHour: number;
  endHour: number;
  slotMinutes: number;
  appointments?: Appointment[];
  loading?: boolean;
  onEditAppointment?: (appt: Appointment) => void;
  onSelectEmptySlot?: (start: Date, end: Date) => void;
  date: Date; // 🆕 current date shown
}

const DayViewGrid: React.FC<DayViewGridProps> = ({
  office,
  providerName,
  startHour,
  endHour,
  slotMinutes,
  appointments = [],
  loading = false,
  onEditAppointment,
  onSelectEmptySlot,
  date,
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [showSelection, setShowSelection] = useState(false); // 🆕 for highlight fade

  // ---- Build time slots ----
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += slotMinutes) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  const slotHeightPx = 48;
  const minuteHeight = slotHeightPx / slotMinutes;

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // ---- Filter appointments for this date ----
  const apptsForDay = appointments.filter((a) => {
    const dateObj = a.date ? parseISO(a.date) : null;
    return dateObj && isSameDay(dateObj, date);
  });

  // ---- Cluster overlapping appointments ----
  const apptsWithRange = apptsForDay
    .filter((a) => a.start_time && a.end_time)
    .map((a) => ({
      ...a,
      start: timeToMinutes(a.start_time),
      end: timeToMinutes(a.end_time),
    }))
    .sort((a, b) => a.start - b.start);

  const clusters: (typeof apptsWithRange)[] = [];
  let currentCluster: typeof apptsWithRange = [];
  for (const appt of apptsWithRange) {
    if (
      currentCluster.length === 0 ||
      appt.start < currentCluster[currentCluster.length - 1].end
    ) {
      currentCluster.push(appt);
    } else {
      clusters.push(currentCluster);
      currentCluster = [appt];
    }
  }
  if (currentCluster.length) clusters.push(currentCluster);

  // ---- Render appointments ----
  const renderAppointmentBlocks = () =>
    clusters.flatMap((group) => {
      const count = group.length;

      return group.map((appt, index) => {
        const blockTop = (appt.start - startHour * 60) * minuteHeight;
        const blockHeight = (appt.end - appt.start) * minuteHeight;
        const widthPercent = 100 / count;
        const leftPercent = index * widthPercent;
        const bgColor =
          appt.appointment_type === 'Block Time'
            ? '#9CA3AF'
            : appt.color_code || '#3B82F6';
        const isHovered = hoveredId === appt.id;

        return (
          <div
            key={appt.id}
            onMouseEnter={() => setHoveredId(appt.id!)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onEditAppointment?.(appt)}
            className={`absolute rounded text-white text-xs p-1.5 shadow-sm cursor-pointer 
              hover:brightness-105 transition-all duration-200 ease-out
              ${hoveredId === appt.id ? 'opacity-100' : 'opacity-90'}`}
            style={{
              top: `${blockTop}px`,
              height: `${blockHeight}px`,
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              backgroundColor: bgColor,
            }}
          >
            <div className='font-semibold truncate'>
              {appt.appointment_type === 'Block Time'
                ? '— Blocked —'
                : appt.patient_name || '(No Patient)'}
            </div>
            {appt.appointment_type !== 'Block Time' && (
              <div className='truncate opacity-90'>{appt.appointment_type}</div>
            )}

            {isHovered && (
              <div className='absolute z-50 left-1/2 -translate-x-1/2 -translate-y-full mb-1 w-max max-w-xs bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg opacity-90'>
                <div className='font-semibold'>
                  {appt.appointment_type || 'Appointment'}
                </div>
                {appt.patient_name && <div>Patient: {appt.patient_name}</div>}
                {appt.chief_complaint && (
                  <div>Reason: {appt.chief_complaint}</div>
                )}
                <div>
                  {appt.start_time.slice(0, 5)} – {appt.end_time.slice(0, 5)}
                </div>
              </div>
            )}
          </div>
        );
      });
    });

  // ---- Drag-to-select logic ----
  const handleMouseDown = (slotIndex: number) => {
    setIsSelecting(true);
    setSelectionStart(slotIndex);
    setSelectionEnd(slotIndex);
    setShowSelection(true);
  };

  const handleMouseEnter = (slotIndex: number) => {
    if (!isSelecting || selectionStart === null) return;
    setSelectionEnd(slotIndex);
  };

  const handleMouseUp = () => {
    if (!isSelecting || selectionStart === null || selectionEnd === null)
      return;

    const startSlot = Math.min(selectionStart, selectionEnd);
    const endSlot = Math.max(selectionStart, selectionEnd);

    const startMinutes = startHour * 60 + startSlot * slotMinutes;
    const endMinutes = startHour * 60 + (endSlot + 1) * slotMinutes;

    const start = new Date(date);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = new Date(date);
    end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    onSelectEmptySlot?.(start, end);

    // Fade highlight for 400ms after release
    setTimeout(() => setShowSelection(false), 400);
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  return (
    <div className='border rounded overflow-hidden relative bg-white select-none'>
      {/* Header */}
      <div className='grid grid-cols-[120px_1fr] bg-gray-100 border-b text-sm font-semibold'>
        <div className='p-2 border-r text-gray-700'>Time</div>
        <div className='p-2'>
          {providerName} — {office}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className='p-6 text-center text-gray-500 italic'>
          Loading appointments…
        </div>
      ) : (
        <div className='grid grid-cols-[120px_1fr] text-sm relative'>
          {/* Left column: Times */}
          <div>
            {slots.map((time) => (
              <div
                key={time}
                className='border-r border-b p-2 text-gray-700 h-12 bg-gray-50'
              >
                {time}
              </div>
            ))}
          </div>

          {/* Right column: Slots */}
          <div className='relative border-l'>
            {slots.map((_, idx) => {
              const isSelected =
                showSelection &&
                selectionStart !== null &&
                selectionEnd !== null &&
                idx >= Math.min(selectionStart, selectionEnd) &&
                idx <= Math.max(selectionStart, selectionEnd);

              return (
                <div
                  key={idx}
                  className={`border-b h-12 transition-colors ${
                    isSelected
                      ? 'bg-blue-200'
                      : 'hover:bg-blue-50 cursor-crosshair'
                  }`}
                  onMouseDown={() => handleMouseDown(idx)}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseUp={handleMouseUp}
                />
              );
            })}

            {/* Appointment overlays */}
            <div className='absolute inset-0 pointer-events-none'>
              {renderAppointmentBlocks()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayViewGrid;
