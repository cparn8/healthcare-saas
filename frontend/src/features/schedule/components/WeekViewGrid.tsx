// frontend/src/features/schedule/components/WeekViewGrid.tsx
import React, { useMemo, useState } from 'react';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';
import { Appointment } from '../types/appointment';

interface WeekViewGridProps {
  providerName: string;
  office: string;
  startHour: number;
  endHour: number;
  slotMinutes: number;
  appointments?: Appointment[];
  loading?: boolean;
  onEditAppointment?: (appt: Appointment) => void;
  onSelectEmptySlot?: (start: Date, end: Date) => void;
  baseDate: Date;
}

const WeekViewGrid: React.FC<WeekViewGridProps> = ({
  providerName,
  office,
  startHour,
  endHour,
  slotMinutes,
  appointments = [],
  loading = false,
  onEditAppointment,
  baseDate,
  onSelectEmptySlot,
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    dayIndex: number;
    slotIndex: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    dayIndex: number;
    slotIndex: number;
  } | null>(null);
  const [showSelection, setShowSelection] = useState(false); // 🆕

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(baseDate), i)),
    [baseDate]
  );

  const slots = useMemo(() => {
    const times: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotMinutes) {
        times.push(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        );
      }
    }
    return times;
  }, [startHour, endHour, slotMinutes]);

  const slotHeightPx = 48;
  const minuteHeight = slotHeightPx / slotMinutes;

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const renderAppointmentsForDay = (day: Date) => {
    const apptsForDay = appointments.filter((a) => {
      const date = a.date ? parseISO(a.date) : null;
      return date && isSameDay(date, day);
    });

    apptsForDay.sort(
      (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
    );

    return apptsForDay.map((appt) => {
      const startMins = timeToMinutes(appt.start_time);
      const endMins = timeToMinutes(appt.end_time);
      const top = (startMins - startHour * 60) * minuteHeight;
      const height = (endMins - startMins) * minuteHeight;
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
          className='absolute left-1 right-1 rounded text-white text-xs p-1.5 shadow-sm cursor-pointer transition-opacity duration-150 ease-out hover:brightness-105'
          style={{
            top: `${top}px`,
            height: `${height}px`,
            backgroundColor: bgColor,
          }}
          title={`${appt.appointment_type} - ${appt.patient_name || 'N/A'}`}
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
  };

  const handleMouseDown = (dayIndex: number, slotIndex: number) => {
    setIsSelecting(true);
    setSelectionStart({ dayIndex, slotIndex });
    setSelectionEnd({ dayIndex, slotIndex });
    setShowSelection(true);
  };

  const handleMouseEnter = (dayIndex: number, slotIndex: number) => {
    if (!isSelecting || !selectionStart) return;
    setSelectionEnd({ dayIndex, slotIndex });
  };

  const handleMouseUp = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) return;

    const startDay = weekDays[selectionStart.dayIndex];
    const startSlot = Math.min(
      selectionStart.slotIndex,
      selectionEnd.slotIndex
    );
    const endSlot = Math.max(selectionStart.slotIndex, selectionEnd.slotIndex);

    const startMinutes = startHour * 60 + startSlot * slotMinutes;
    const endMinutes = startHour * 60 + (endSlot + 1) * slotMinutes;

    const start = new Date(startDay);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = new Date(startDay);
    end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    onSelectEmptySlot?.(start, end);

    setTimeout(() => setShowSelection(false), 400); // 🆕 smooth fade
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  return (
    <div className='border rounded overflow-hidden relative bg-white select-none'>
      {/* Header */}
      <div className='grid grid-cols-8 bg-gray-100 border-b text-sm font-semibold'>
        <div className='p-2 border-r text-gray-700'>Time</div>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className='p-2 text-center border-r'>
            {format(day, 'EEE dd')}
          </div>
        ))}
      </div>

      {loading ? (
        <div className='p-6 text-center text-gray-500 italic'>
          Loading appointments…
        </div>
      ) : (
        <div className='grid grid-cols-8 text-sm relative'>
          {/* Time Column */}
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

          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => (
            <div
              key={day.toISOString()}
              className='relative border-l'
              onMouseUp={handleMouseUp}
            >
              {slots.map((_, slotIndex) => {
                const isSelected =
                  showSelection &&
                  isSelecting &&
                  selectionStart &&
                  selectionEnd &&
                  selectionStart.dayIndex === dayIndex &&
                  slotIndex >=
                    Math.min(
                      selectionStart.slotIndex,
                      selectionEnd.slotIndex
                    ) &&
                  slotIndex <=
                    Math.max(selectionStart.slotIndex, selectionEnd.slotIndex);

                return (
                  <div
                    key={slotIndex}
                    className={`border-b h-12 transition-colors ${
                      isSelected
                        ? 'bg-blue-200'
                        : 'hover:bg-blue-50 cursor-crosshair'
                    }`}
                    onMouseDown={() => handleMouseDown(dayIndex, slotIndex)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, slotIndex)}
                  />
                );
              })}

              {/* Appointments overlay */}
              <div className='absolute inset-0 pointer-events-none'>
                {renderAppointmentsForDay(day)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeekViewGrid;
