// frontend/src/features/schedule/components/WithPatientForm.tsx
import React, { useState, useEffect } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import API from '../../../services/api';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  prn: string;
  date_of_birth: string;
  phone?: string;
  gender?: string;
}

interface WithPatientFormProps {
  onCancel: () => void;
  onGetFormData?: (data: any) => void;
  providerId?: number | null;
  initialDate?: string; // "YYYY-MM-DD"
  initialStartTime?: string; // "HH:MM"
  initialEndTime?: string; // "HH:MM"
  initialPatient?: any;
}

const WithPatientForm: React.FC<WithPatientFormProps> = ({
  onCancel,
  onGetFormData,
  providerId,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialPatient,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // --- Patient selection & search ---
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    initialPatient || null
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Repeat toggle (UI helper) ---
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  // --- Form state ---
  const [formData, setFormData] = useState<{
    patient: number | null;
    provider: number;
    office: string;
    appointment_type: string;
    color_code: string;
    chief_complaint: string;
    date: string;
    start_time: string;
    end_time: string;
    duration: number;
    is_recurring: boolean;
    repeat_days: string[];
    repeat_interval_weeks: number;
    repeat_end_date: string;
    repeat_occurrences: number;
    send_intake_form: boolean;
  }>({
    patient: null,
    provider: providerId || 1,
    office: 'north',
    appointment_type: 'Wellness Exam',
    color_code: '#FF6B6B',
    chief_complaint: '',
    date: initialDate || '',
    start_time: initialStartTime || '',
    end_time: initialEndTime || '',
    duration: 30,
    is_recurring: false,
    repeat_days: [],
    repeat_interval_weeks: 1,
    repeat_end_date: '',
    repeat_occurrences: 1,
    send_intake_form: false,
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('newPatient');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSelectedPatient(parsed);
      sessionStorage.removeItem('newPatient');
    }
  }, []);

  // Keep provider in sync if it loads later
  useEffect(() => {
    if (providerId) setFormData((p) => ({ ...p, provider: providerId }));
  }, [providerId]);

  // When a patient is chosen, store their id in the payload
  useEffect(() => {
    if (selectedPatient)
      setFormData((p) => ({ ...p, patient: selectedPatient.id }));
  }, [selectedPatient]);

  // Bubble up form data to parent (modal)
  useEffect(() => {
    onGetFormData?.(formData);
  }, [formData, onGetFormData]);

  // -------------------------------
  // Predictive Search (debounced)
  // -------------------------------
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await API.get(
          `/patients/?search=${encodeURIComponent(query)}`
        );
        // DRF pagination: results under .results; bare list otherwise
        const list = res.data?.results ?? res.data ?? [];
        setResults(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('❌ Patient search failed', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const newPatientId = searchParams.get('newPatientId');
    if (!newPatientId) return;

    const fetchNewPatient = async () => {
      try {
        const res = await API.get(`/patients/${newPatientId}/`);
        setSelectedPatient(res.data);
      } catch (err) {
        console.error('❌ Failed to load new patient', err);
      }
    };

    fetchNewPatient();
  }, [searchParams]);

  // -------------------------------
  // Handlers
  // -------------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let next: string | number | boolean = value;

    // Narrow for checkboxes to avoid TS "checked" errors
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      next = e.target.checked;
    }
    // Duration should be a number
    if (name === 'duration') {
      next = Number(next);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: next,
    }));
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className='max-h-[70vh] overflow-y-auto space-y-6 p-4'>
      {/* --- Patient Section --- */}
      {!selectedPatient ? (
        <section className='relative'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Search Patient
          </label>
          <div className='relative'>
            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='w-full border rounded p-2 pl-8'
              placeholder='Search by name, phone, PRN, or DOB'
            />
            <Search
              className='absolute left-2 top-2.5 text-gray-400'
              size={18}
            />
          </div>

          {loading && (
            <div className='text-xs text-gray-500 mt-1'>Searching...</div>
          )}

          {/* Results dropdown */}
          {results.length > 0 && (
            <div className='absolute z-20 bg-white border rounded w-full shadow-md mt-1 max-h-56 overflow-y-auto'>
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient(p);
                    setQuery('');
                    setResults([]);
                  }}
                  className='block w-full text-left px-3 py-2 hover:bg-blue-50 text-sm'
                >
                  <div className='font-medium'>
                    {p.first_name} {p.last_name}
                  </div>
                  <div className='text-xs text-gray-500'>
                    PRN: {p.prn} • DOB: {p.date_of_birth}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Add new patient button (hidden when a patient is selected) */}
          <button
            onClick={() => {
              // Tell PatientsList that we came from Schedule
              localStorage.setItem('afterAddPatient', '/doctor/schedule');
              // Also preserve the current modal state (timeslot, provider)
              sessionStorage.setItem('prefillSlot', JSON.stringify(formData));
              navigate('/doctor/manage-users/patients');
            }}
            className='mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition'
          >
            <UserPlus size={16} /> Add New Patient
          </button>
        </section>
      ) : (
        <section>
          <div className='flex justify-between items-center mb-2 text-sm'>
            <div className='font-semibold text-gray-800'>
              {selectedPatient.first_name} {selectedPatient.last_name}
            </div>
            <button
              className='text-red-500 hover:underline'
              onClick={() => setSelectedPatient(null)}
            >
              Remove patient
            </button>
          </div>
          <div className='text-xs text-gray-600'>
            PRN: {selectedPatient.prn} • DOB: {selectedPatient.date_of_birth}
            {selectedPatient.phone && <> • Phone: {selectedPatient.phone}</>}
          </div>
        </section>
      )}

      <hr className='border-gray-200' />

      {/* --- Appointment Details --- */}
      <section>
        <h3 className='text-lg font-semibold mb-2'>Appointment details</h3>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Provider
            </label>
            <input
              type='text'
              readOnly
              value={providerId ? `Provider #${providerId}` : 'Loading...'}
              className='w-full border rounded p-2 bg-gray-50 text-gray-600'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Office
            </label>
            <select
              name='office'
              value={formData.office}
              onChange={handleChange}
              className='w-full border rounded p-2'
            >
              <option value='north'>North Office</option>
              <option value='south'>South Office</option>
            </select>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Chief Complaint
          </label>
          <textarea
            name='chief_complaint'
            value={formData.chief_complaint}
            onChange={handleChange}
            className='w-full border rounded p-2'
            placeholder='Brief description of symptoms or reason for visit'
            rows={2}
          />
        </div>

        {/* Date & Time */}
        <div className='grid grid-cols-4 gap-4 items-end mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Date
            </label>
            <input
              type='date'
              name='date'
              value={formData.date}
              onChange={handleChange}
              className='w-full border rounded p-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Start Time
            </label>
            <input
              type='time'
              name='start_time'
              value={formData.start_time}
              onChange={handleChange}
              className='w-full border rounded p-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              End Time
            </label>
            <input
              type='time'
              name='end_time'
              value={formData.end_time}
              onChange={handleChange}
              className='w-full border rounded p-2'
            />
          </div>

          {/* Repeat toggle */}
          <label className='flex items-center gap-2 mb-2'>
            <input
              type='checkbox'
              checked={repeatEnabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setRepeatEnabled(e.target.checked);
                setFormData((prev) => ({
                  ...prev,
                  is_recurring: e.target.checked,
                }));
              }}
              className='h-4 w-4'
            />
            <span className='text-sm font-medium text-gray-700'>Repeat</span>
          </label>
        </div>
      </section>
    </div>
  );
};

export default WithPatientForm;
