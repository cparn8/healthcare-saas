import React from 'react';

interface DayViewGridProps {
  office: string;
  providerName: string;
  startHour: number; // e.g. 8
  endHour: number; // e.g. 17
  slotMinutes: number; // e.g. 30
  appointments?: any[];
  loading?: boolean;
}

/**
 * Renders the block-style schedule grid for the Day view.
 * Shows time labels (left column) and provider appointment area (right column).
 * Later phases will populate these cells with appointment blocks.
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
  // ✅ This is the top of the component body
  console.log('📅 Appointments for this day:', appointments);

  // Build time slot labels (e.g., 8:00 AM, 8:30 AM, etc.)
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

  return (
    <div className='border rounded overflow-hidden'>
      {/* Header */}
      <div className='grid grid-cols-[120px_1fr] bg-gray-100 border-b text-sm font-semibold'>
        <div className='p-2 border-r'>Time</div>
        <div className='p-2'>
          {providerName} — {office}
        </div>
      </div>

      {/* Optional loading state */}
      {loading ? (
        <div className='p-6 text-center text-gray-500 italic'>Loading…</div>
      ) : (
        <div className='grid grid-cols-[120px_1fr] text-sm'>
          {slots.map((time) => (
            <React.Fragment key={time}>
              {/* Time column */}
              <div className='border-r border-b p-2 text-gray-700'>{time}</div>

              {/* Appointment cell */}
              <div
                className='border-b p-2 h-12 hover:bg-blue-50 cursor-pointer'
                // TODO: onClick → open Add Appointment modal
              >
                {/* Placeholder for future appointments */}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default DayViewGrid;
