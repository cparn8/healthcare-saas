import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DayViewGrid from '../components/DayViewGrid';
import NewAppointmentModal from '../components/NewAppointmentModal';

type TabKey = 'appointments' | 'day' | 'week' | 'settings';
type OfficeKey = 'north' | 'south';
type SlotSize = 15 | 30 | 60;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'appointments', label: 'Appointments' },
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'settings', label: 'Settings' },
];

const SLOT_OPTIONS: SlotSize[] = [15, 30, 60];

function formatShortDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function formatCompact(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function relativeLabel(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  return formatCompact(d);
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diffToMon = (day + 6) % 7;
  copy.setDate(copy.getDate() - diffToMon);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 4);
  e.setHours(0, 0, 0, 0);
  return e;
}

function formatWeekRange(d: Date) {
  const s = startOfWeek(d);
  const e = endOfWeek(d);
  const sameMonth = s.getMonth() === e.getMonth();
  const startFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(s);
  const endFmt = new Intl.DateTimeFormat('en-US', {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(e);
  return `${startFmt} – ${endFmt}`;
}

const SchedulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  const initialTab = (searchParams.get('tab') as TabKey) || 'day';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [office, setOffice] = useState<OfficeKey>('north');
  const [cursorDate, setCursorDate] = useState<Date>(new Date());
  const [zoom, setZoom] = useState<number>(1);
  const [slotSize, setSlotSize] = useState<SlotSize>(30);

  const appointmentCount = 0;
  const isAppointments = activeTab === 'appointments';
  const isDay = activeTab === 'day';
  const isWeek = activeTab === 'week';

  function changeTab(tab: TabKey) {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  }

  function goPrev() {
    const copy = new Date(cursorDate);
    if (isWeek) copy.setDate(copy.getDate() - 7);
    else copy.setDate(copy.getDate() - 1);
    setCursorDate(copy);
  }

  function goNext() {
    const copy = new Date(cursorDate);
    if (isWeek) copy.setDate(copy.getDate() + 7);
    else copy.setDate(copy.getDate() + 1);
    setCursorDate(copy);
  }

  const leftLabel = useMemo(() => {
    if (isWeek) return formatWeekRange(cursorDate);
    return formatShortDate(cursorDate);
  }, [cursorDate, isWeek]);

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-baseline justify-between'>
        <div className='flex items-baseline gap-3'>
          <h1 className='text-2xl font-semibold'>Schedule</h1>
          {(isAppointments || isDay || isWeek) && (
            <span className='text-sm text-gray-500'>
              {appointmentCount} appointments
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 border-b'>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === t.key
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Secondary Toolbar */}
      {(isAppointments || isDay || isWeek) && (
        <>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <button className='px-3 py-1.5 border rounded hover:bg-gray-50'>
                Filter
              </button>
              <button
                className='px-3 py-1.5 border rounded hover:bg-gray-50'
                onClick={() => {
                  // TODO: refresh logic
                }}
              >
                Refresh
              </button>

              <select
                className='px-3 py-1.5 border rounded'
                value={office}
                onChange={(e) => setOffice(e.target.value as OfficeKey)}
              >
                <option value='north'>North Office</option>
                <option value='south'>South Office</option>
              </select>
            </div>

            <div className='flex items-center gap-2'>
              {isAppointments ? (
                <button className='px-3 py-1.5 border rounded hover:bg-gray-50'>
                  Print
                </button>
              ) : (
                <button
                  className='px-3 py-1.5 border rounded bg-green-600 text-white hover:bg-green-700'
                  onClick={() => setShowNewAppointment(true)}
                >
                  + Add appointment
                </button>
              )}
            </div>
          </div>

          <hr className='border-gray-200' />

          {/* Date Row */}
          <div className='flex items-center justify-between gap-2'>
            <div className='text-sm text-gray-700'>{leftLabel}</div>

            <div className='flex items-center gap-2'>
              <button
                className='px-2 py-1.5 border rounded hover:bg-gray-50'
                title='Pick a date'
              >
                📅
              </button>

              <div className='flex'>
                <button
                  className='px-3 py-1.5 border rounded-l hover:bg-gray-50'
                  onClick={goPrev}
                >
                  ←
                </button>
                <div className='px-3 py-1.5 border-t border-b'>
                  {relativeLabel(cursorDate)}
                </div>
                <button
                  className='px-3 py-1.5 border rounded-r hover:bg-gray-50'
                  onClick={goNext}
                >
                  →
                </button>
              </div>

              <div className='flex'>
                <button
                  className={`px-3 py-1.5 border rounded-l ${
                    isAppointments
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                  disabled={isAppointments}
                  onClick={() =>
                    setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))
                  }
                >
                  –
                </button>
                <div className='px-3 py-1.5 border-t border-b text-sm'>
                  {zoom.toFixed(1)}x
                </div>
                <button
                  className={`px-3 py-1.5 border rounded-r ${
                    isAppointments
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                  disabled={isAppointments}
                  onClick={() =>
                    setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(1))))
                  }
                >
                  +
                </button>
              </div>

              <select
                className={`px-3 py-1.5 border rounded ${
                  isAppointments ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                value={slotSize}
                disabled={isAppointments}
                onChange={(e) =>
                  setSlotSize(Number(e.target.value) as SlotSize)
                }
              >
                {SLOT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s} min slots
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className='border-gray-200' />
        </>
      )}

      {/* Content */}
      <div className='min-h-[400px] bg-white border rounded p-4'>
        {activeTab === 'appointments' && (
          <div className='text-gray-600'>
            Appointments list view (to be implemented)
          </div>
        )}
        {activeTab === 'day' && (
          <DayViewGrid
            office={office}
            providerName='Dr. Smith'
            startHour={8}
            endHour={17}
            slotMinutes={slotSize}
          />
        )}
        {activeTab === 'week' && (
          <div className='text-gray-600'>Week view placeholder</div>
        )}
        {activeTab === 'settings' && (
          <div className='text-gray-600'>
            Settings placeholder (working hours per office/provider; default
            8am–5pm)
          </div>
        )}
      </div>

      <NewAppointmentModal
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        onSave={() => setShowNewAppointment(false)}
      />
    </div>
  );
};

export default SchedulePage;
