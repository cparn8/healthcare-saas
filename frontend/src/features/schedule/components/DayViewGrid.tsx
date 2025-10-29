// frontend/src/features/schedule/components/DayViewGrid.tsx
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
 * DayViewGrid: shows a single-day schedule grid for a provider.
 * Displays appointment blocks aligned by start_time and duration.
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

  // ---- Convert "HH:MM:SS" to total minutes ----
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // ---- Config ----
  const slotHeightPx = 48; // Each slot is ~48px tall
  const minuteHeight = slotHeightPx / slotMinutes;

  // ---- Render appointment blocks ----
  // ---- Render appointment blocks ----
  const renderAppointmentBlocks = () => {
    if (!appointments.length) return null;

    // 1️⃣ Convert to enriched array with time ranges
    const apptsWithRange = appointments
      .filter((a) => a.start_time && a.end_time)
      .map((a) => ({
        ...a,
        start: timeToMinutes(a.start_time),
        end: timeToMinutes(a.end_time),
      }))
      .sort((a, b) => a.start - b.start);

    // 2️⃣ Group overlapping appointments
    const clusters: { group: typeof apptsWithRange }[] = [];
    let currentCluster: typeof apptsWithRange = [];

    for (const appt of apptsWithRange) {
      if (
        currentCluster.length === 0 ||
        appt.start < currentCluster[currentCluster.length - 1].end
      ) {
        // Still overlapping
        currentCluster.push(appt);
      } else {
        // Start a new cluster
        clusters.push({ group: currentCluster });
        currentCluster = [appt];
      }
    }
    if (currentCluster.length) clusters.push({ group: currentCluster });

    // 3️⃣ Render clusters (side-by-side per group)
    return clusters.flatMap(({ group }) => {
      const count = group.length;

      return group.map((appt, index) => {
        const blockTop = (appt.start - startHour * 60) * minuteHeight;
        const blockHeight = (appt.end - appt.start) * minuteHeight;

        // Each appointment gets a fraction of the width
        const widthPercent = 100 / count;
        const leftPercent = index * widthPercent;

        return (
          <div
            key={appt.id}
            className='absolute rounded text-white text-xs p-1.5 shadow-sm overflow-hidden transition-all'
            style={{
              top: `${blockTop}px`,
              height: `${blockHeight}px`,
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              backgroundColor: appt.color_code || '#3B82F6',
            }}
            title={`Type: ${appt.appointment_type}\nPatient: ${
              appt.patient_name || 'N/A'
            }\nComplaint: ${appt.chief_complaint || '—'}`}
          >
            <div className='font-semibold truncate'>
              {appt.patient_name || '(Block Time)'}
            </div>
            <div className='truncate opacity-90'>{appt.appointment_type}</div>
          </div>
        );
      });
    });
  };

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
          {/* Time column */}
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

          {/* Schedule column */}
          <div className='relative border-l bg-white'>
            {/* Background grid lines */}
            {slots.map((_, idx) => (
              <div
                key={idx}
                className='border-b h-12 hover:bg-blue-50 transition-colors cursor-pointer'
              />
            ))}

            {/* Appointment blocks (absolute positioning) */}
            <div className='absolute inset-0'>{renderAppointmentBlocks()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayViewGrid;
