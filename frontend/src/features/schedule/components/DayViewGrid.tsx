import React from 'react';
import { Appointment } from '../../schedule/types/appointment';

interface DayViewGridProps {
  office: string;
  providerName: string;
  startHour: number;
  endHour: number;
  slotMinutes: number;
  appointments?: Appointment[];
  loading?: boolean;
}

/**
 * DayViewGrid: shows the time grid + provider column with colored appointment blocks.
 */
const DayViewGrid: React.FC<DayViewGridProps> = ({
  office,
  providerName,
  startHour,
  endHour,
  slotMinutes,
  appointments = [],
  loading = false,
}) => {
  console.log('📅 Rendering appointments:', appointments);

  // Helper: build time labels
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

  // Helper: convert "HH:MM:SS" to minutes since startHour
  function timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  // Calculate vertical position and height (in px) per appointment
  const minuteHeight = 48 / (60 / slotMinutes); // Each slot is ~48px tall

  const renderAppointmentBlocks = () =>
    appointments.map((appt) => {
      const startMins = timeToMinutes(appt.start_time);
      const endMins = timeToMinutes(appt.end_time);
      const blockTop =
        (startMins - startHour * 60) * (minuteHeight / slotMinutes);
      const blockHeight = (endMins - startMins) * (minuteHeight / slotMinutes);

      return (
        <div
          key={appt.id}
          title={`${appt.appointment_type} — ${appt.chief_complaint || ''}`}
          className='absolute left-0 right-0 mx-1 rounded text-white text-xs p-1 overflow-hidden shadow-sm'
          style={{
            top: `${blockTop}px`,
            height: `${blockHeight}px`,
            backgroundColor: appt.color_code || '#2563eb', // fallback blue
          }}
        >
          <div className='font-semibold truncate'>
            {appt.patient_name || '(Block)'}
          </div>
          <div className='truncate opacity-90'>{appt.appointment_type}</div>
        </div>
      );
    });

  return (
    <div className='border rounded overflow-hidden relative'>
      {/* Header */}
      <div className='grid grid-cols-[120px_1fr] bg-gray-100 border-b text-sm font-semibold'>
        <div className='p-2 border-r'>Time</div>
        <div className='p-2'>
          {providerName} — {office}
        </div>
      </div>

      {loading ? (
        <div className='p-6 text-center text-gray-500 italic'>Loading…</div>
      ) : (
        <div className='grid grid-cols-[120px_1fr] text-sm relative'>
          {/* Left time column */}
          <div>
            {slots.map((time) => (
              <div
                key={time}
                className='border-r border-b p-2 text-gray-700 h-12'
              >
                {time}
              </div>
            ))}
          </div>

          {/* Right schedule column */}
          <div className='relative border-l'>
            {/* Grid background lines */}
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
