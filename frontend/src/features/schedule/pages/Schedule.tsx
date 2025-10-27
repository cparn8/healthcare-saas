import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DayViewGrid from '../components/DayViewGrid';
import NewAppointmentModal from '../components/NewAppointmentModal';
import { Appointment } from '../types/appointment';
import { appointmentsApi } from '../../appointments/services/appointmentsApi';
import { providersApi } from '../../providers/services/providersApi';

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

function formatWeekRange(d: Date) {
  const start = new Date(d);
  const diff = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const sameMonth = start.getMonth() === end.getMonth();
  const startFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(start);
  const endFmt = new Intl.DateTimeFormat('en-US', {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(end);
  return `${startFmt} – ${endFmt}`;
}

const SchedulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get('tab') as TabKey) || 'day'
  );
  const [office, setOffice] = useState<OfficeKey>('north');
  const [cursorDate, setCursorDate] = useState<Date>(new Date());
  const [zoom, setZoom] = useState<number>(1);
  const [slotSize, setSlotSize] = useState<SlotSize>(30);
  const [providerId, setProviderId] = useState<number | null>(null);

  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // collect form data from the modal (using useCallback to avoid re-renders)
  const handleFormData = useCallback((data: any) => {
    console.log('📄 Modal form data updated:', data);
  }, []);

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const goPrev = () => {
    const copy = new Date(cursorDate);
    if (activeTab === 'week') copy.setDate(copy.getDate() - 7);
    else copy.setDate(copy.getDate() - 1);
    setCursorDate(copy);
  };

  const goNext = () => {
    const copy = new Date(cursorDate);
    if (activeTab === 'week') copy.setDate(copy.getDate() + 7);
    else copy.setDate(copy.getDate() + 1);
    setCursorDate(copy);
  };

  const leftLabel = useMemo(() => {
    return activeTab === 'week'
      ? formatWeekRange(cursorDate)
      : formatShortDate(cursorDate);
  }, [cursorDate, activeTab]);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const me = await providersApi.getMe();
        console.log('👤 Logged-in provider:', me);
        setProviderId(me.id);
      } catch (err) {
        console.error('❌ Failed to load provider info:', err);
      }
    };
    fetchProvider();
  }, []);

  // Load appointments from the backend
  const loadAppointments = async () => {
    if (!providerId) return; // Wait until provider is known
    try {
      setLoadingAppts(true);
      const params = { office, provider: providerId };
      console.log('📥 Fetching appointments with filters:', params);

      const result = await appointmentsApi.list(params);
      setAppointments(result.results || []);
      console.log('✅ Loaded', result.results?.length || 0, 'appointments');
    } catch (err) {
      console.error('❌ Failed to load appointments:', err);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      loadAppointments();
    }
  }, [office, providerId]);

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-baseline justify-between'>
        <div className='flex items-baseline gap-3'>
          <h1 className='text-2xl font-semibold'>Schedule</h1>
          <span className='text-sm text-gray-500'>
            {appointments.length} appointments
          </span>
        </div>
      </div>

      {/* Main Tabs */}
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

      {/* Toolbar */}
      {(activeTab === 'appointments' ||
        activeTab === 'day' ||
        activeTab === 'week') && (
        <>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <button className='px-3 py-1.5 border rounded hover:bg-gray-50'>
                Filter
              </button>
              <button
                className='px-3 py-1.5 border rounded hover:bg-gray-50'
                onClick={loadAppointments}
              >
                Refresh
              </button>

              {/* Office select */}
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
              <button
                className='px-3 py-1.5 border rounded bg-green-600 text-white hover:bg-green-700'
                onClick={() => setShowNewAppointment(true)}
              >
                + Add appointment
              </button>
            </div>
          </div>

          <hr className='border-gray-200' />

          {/* Date row */}
          <div className='flex items-center justify-between gap-2'>
            <div className='text-sm text-gray-700'>{leftLabel}</div>
            <div className='flex items-center gap-2'>
              {/* Prev / Next */}
              <div className='flex'>
                <button
                  className='px-3 py-1.5 border rounded-l hover:bg-gray-50'
                  onClick={goPrev}
                >
                  ←
                </button>
                <div className='px-3 py-1.5 border-t border-b'>
                  {cursorDate.toLocaleDateString()}
                </div>
                <button
                  className='px-3 py-1.5 border rounded-r hover:bg-gray-50'
                  onClick={goNext}
                >
                  →
                </button>
              </div>

              {/* Slot size */}
              <select
                className='px-3 py-1.5 border rounded'
                value={slotSize}
                onChange={(e) =>
                  setSlotSize(Number(e.target.value) as SlotSize)
                }
              >
                {SLOT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s} min
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
          <div className='text-gray-600'>Appointments list (coming soon)</div>
        )}
        {activeTab === 'day' && (
          <DayViewGrid
            office={office}
            providerName='Dr. Smith'
            startHour={8}
            endHour={17}
            slotMinutes={slotSize}
            appointments={appointments}
            loading={loadingAppts}
          />
        )}
        {activeTab === 'week' && (
          <div className='text-gray-600'>Week view placeholder</div>
        )}
        {activeTab === 'settings' && (
          <div className='text-gray-600'>Settings placeholder</div>
        )}
      </div>

      {/* Modal rendered conditionally */}
      {showNewAppointment && (
        <NewAppointmentModal
          onClose={() => setShowNewAppointment(false)}
          onSaved={() => {
            console.log('✅ Appointment saved — reloading list...');
            loadAppointments(); // reload from backend
            setShowNewAppointment(false);
          }}
        />
      )}
    </div>
  );
};

export default SchedulePage;
