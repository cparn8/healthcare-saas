// frontend/src/features/schedule/components/DayViewGrid.tsx
import React, { useState } from 'react';
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
}

/**
 * DayViewGrid: Displays a single provider’s daily schedule
 * with overlapping appointments, smooth transitions, and hover tooltips.
 */
const DayViewGrid: React.FC<DayViewGridProps> = ({
  office,
  providerName,
  startHour,
  endHour,
  slotMinutes,
  appointments = [],
  loading = false,
  onEditAppointment,
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  console.log('📅 Rendering appointments:', appointments);

  // ---- Build time slots ----
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += slotMinutes) {
      const label = new Date(0, 0, 0, h, m).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      slots.push(label);
    }
  }

  // ---- Helpers ----
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const slotHeightPx = 48;
  const minuteHeight = slotHeightPx / slotMinutes;

  // ---- Preprocess: group overlapping appointments ----
  const apptsWithRange = appointments
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

  // ---- Render appointment blocks ----
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
            className={`absolute rounded text-white text-xs p-1.5 shadow-sm overflow-hidden cursor-pointer 
  hover:brightness-105 transition-all transition-opacity duration-300 ease-out
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

            {/* Tooltip */}
            {isHovered && (
              <div
                className='absolute z-50 left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-1 
                           w-max max-w-xs bg-gray-900 text-white text-xs rounded-md px-3 py-2 
                           shadow-lg opacity-90 transition-opacity duration-150 ease-out'
              >
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

  // ---- Render Layout ----
  return (
    <div className='border rounded overflow-hidden relative bg-white'>
      {/* Header */}
      <div className='grid grid-cols-[120px_1fr] bg-gray-100 border-b text-sm font-semibold'>
        <div className='p-2 border-r'>Time</div>
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
          {/* Left: Time column */}
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

          {/* Right: Schedule grid */}
          <div className='relative border-l bg-white'>
            {/* Grid lines */}
            {slots.map((_, idx) => (
              <div
                key={idx}
                className='border-b h-12 hover:bg-blue-50 transition-colors cursor-pointer'
              />
            ))}

            {/* Appointment blocks */}
            <div className='absolute inset-0'>{renderAppointmentBlocks()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayViewGrid;
