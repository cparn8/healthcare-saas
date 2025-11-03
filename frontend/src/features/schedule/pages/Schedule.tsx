// frontend/src/features/schedule/pages/Schedule.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { parseISO } from 'date-fns';

import DayViewGrid from '../components/DayViewGrid';
import WeekViewGrid from '../components/WeekViewGrid';
import NewAppointmentModal from '../components/NewAppointmentModal';
import EditAppointmentModal from '../components/EditAppointmentModal';

import { Appointment } from '../types/appointment';
import { appointmentsApi } from '../../appointments/services/appointmentsApi';
import { providersApi, Provider } from '../../providers/services/providersApi';

type TabKey = 'appointments' | 'day' | 'week' | 'settings';
type OfficeKey = 'north' | 'south';
type SlotSize = 15 | 30 | 60;

/* ----------------------------- Helpers ----------------------------- */
const TABS = [
  { key: 'appointments', label: 'Appointments' },
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'settings', label: 'Settings' },
] as const;

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

/* ----------------------------- Component ----------------------------- */
const SchedulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get('tab') as TabKey) || 'day'
  );
  const [office, setOffice] = useState<OfficeKey>('north');
  const [cursorDate, setCursorDate] = useState<Date>(new Date());
  const [slotSize, setSlotSize] = useState<SlotSize>(30);

  // --- Data State ---
  const [providerId, setProviderId] = useState<number | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // --- Modal State ---
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [prefill, setPrefill] = useState<{
    date?: string;
    start_time?: string;
    end_time?: string;
  } | null>(null);
  const [initialPatient, setInitialPatient] = useState<any>(null);

  /* ----------------------------- Navigation ----------------------------- */
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

  const leftLabel = useMemo(
    () =>
      activeTab === 'week'
        ? formatWeekRange(cursorDate)
        : formatShortDate(cursorDate),
    [cursorDate, activeTab]
  );

  /* ----------------------------- Provider Fetch ----------------------------- */
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const me = await providersApi.getCurrent();
        console.log('👤 Logged-in provider:', me);
        setProvider(me);
        setProviderId(me.id);
      } catch (err) {
        console.error('❌ Failed to load provider info:', err);
      }
    };
    fetchProvider();
  }, []);

  /* ----------------------------- Appointment Loading ----------------------------- */
  const loadAppointments = useCallback(async () => {
    if (!providerId) return;
    try {
      setLoadingAppts(true);
      const params = { office, provider: providerId };
      const result = await appointmentsApi.list(params);
      setAppointments(result.results || []);
      console.log('✅ Loaded', result.results?.length || 0, 'appointments');
    } catch (err) {
      console.error('❌ Failed to load appointments:', err);
    } finally {
      setLoadingAppts(false);
    }
  }, [providerId, office]);

  useEffect(() => {
    if (!providerId) return;
    const params = {
      provider: providerId,
      office,
      date: cursorDate.toISOString().split('T')[0],
    };

    appointmentsApi
      .list(params)
      .then((result) => setAppointments(result.results || []))
      .catch((err) => console.error('❌ Failed to load appointments:', err))
      .finally(() => setLoadingAppts(false));
  }, [providerId, office, cursorDate]);

  /* ----------------------------- Handle Return from Add Patient ----------------------------- */
  useEffect(() => {
    const newPatientId = searchParams.get('newPatientId');
    if (!newPatientId) return;

    const storedPatient = sessionStorage.getItem('newPatient');
    const parsedPatient = storedPatient ? JSON.parse(storedPatient) : null;

    const storedSlot = sessionStorage.getItem('pendingSlot');
    const parsedSlot = storedSlot ? JSON.parse(storedSlot) : null;

    if (parsedPatient) setInitialPatient(parsedPatient);
    if (parsedSlot) setPrefill(parsedSlot);

    // Open modal with both patient and slot
    setShowNewAppointment(true);

    // Cleanup
    sessionStorage.removeItem('newPatient');
    sessionStorage.removeItem('pendingSlot');
    const next = new URLSearchParams(searchParams);
    next.delete('newPatientId');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  /* ----------------------------- Empty Slot Selection ----------------------------- */
  const handleSelectEmptySlot = (start: Date, end: Date) => {
    console.log('🆕 Selected slot range:', start, end);
    setPrefill({
      date: start.toISOString().split('T')[0],
      start_time: start.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
    });
    setShowNewAppointment(true);
  };

  /* ----------------------------- Render ----------------------------- */
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
              <select
                className='px-3 py-1.5 border rounded'
                value={office}
                onChange={(e) => setOffice(e.target.value as OfficeKey)}
              >
                <option value='north'>North Office</option>
                <option value='south'>South Office</option>
              </select>
            </div>

            <button
              className='px-3 py-1.5 border rounded bg-green-600 text-white hover:bg-green-700'
              onClick={() => setShowNewAppointment(true)}
            >
              + Add appointment
            </button>
          </div>

          <hr className='border-gray-200' />

          {/* Date Navigation */}
          <div className='flex items-center justify-between gap-2'>
            <div className='text-sm text-gray-700'>{leftLabel}</div>
            <div className='flex items-center gap-2'>
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
        {activeTab === 'day' && (
          <DayViewGrid
            office={office}
            providerName={
              provider
                ? `${provider.first_name} ${provider.last_name}`
                : 'Loading...'
            }
            startHour={8}
            endHour={17}
            slotMinutes={slotSize}
            appointments={appointments}
            loading={loadingAppts}
            date={cursorDate}
            onEditAppointment={(appt) => setEditingAppt(appt)}
            onSelectEmptySlot={(start, end) => {
              const prefill = {
                date: start.toISOString().split('T')[0],
                start_time: start.toTimeString().slice(0, 5),
                end_time: end.toTimeString().slice(0, 5),
              };
              sessionStorage.setItem('pendingSlot', JSON.stringify(prefill));
              setPrefill(prefill);
              setShowNewAppointment(true);
            }}
          />
        )}

        {activeTab === 'week' && (
          <WeekViewGrid
            baseDate={cursorDate}
            office={office}
            providerName={
              provider
                ? `${provider.first_name} ${provider.last_name}`
                : 'Loading...'
            }
            startHour={8}
            endHour={17}
            slotMinutes={slotSize}
            appointments={appointments}
            loading={loadingAppts}
            onEditAppointment={(appt) => setEditingAppt(appt)}
            onSelectEmptySlot={(start, end) => {
              const prefillData = {
                date: start.toISOString().split('T')[0],
                start_time: start.toTimeString().slice(0, 5),
                end_time: end.toTimeString().slice(0, 5),
              };
              sessionStorage.setItem(
                'prefillSlot',
                JSON.stringify(prefillData)
              );
              setPrefill(prefillData);
              setShowNewAppointment(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      {showNewAppointment && (
        <NewAppointmentModal
          onClose={() => {
            setShowNewAppointment(false);
            setPrefill(null);
            setInitialPatient(null);
          }}
          onSaved={() => {
            loadAppointments();
            setShowNewAppointment(false);
            setPrefill(null);
            setInitialPatient(null);
          }}
          providerId={providerId}
          initialDate={prefill?.date ? new Date(prefill.date) : undefined}
          initialStartTime={
            prefill?.start_time
              ? new Date(`1970-01-01T${prefill.start_time}`)
              : undefined
          }
          initialEndTime={
            prefill?.end_time
              ? new Date(`1970-01-01T${prefill.end_time}`)
              : undefined
          }
          initialPatient={initialPatient}
        />
      )}

      {editingAppt && (
        <EditAppointmentModal
          appointment={{
            ...editingAppt,
            repeat_days: editingAppt.repeat_days || [],
          }}
          onClose={() => setEditingAppt(null)}
          onUpdated={loadAppointments}
        />
      )}
    </div>
  );
};

export default SchedulePage;
