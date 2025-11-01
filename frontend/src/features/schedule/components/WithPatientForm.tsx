import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone } from 'lucide-react';

interface WithPatientFormProps {
  onCancel: () => void;
  onGetFormData?: (data: any) => void;
  providerId?: number | null;
}

const WithPatientForm: React.FC<WithPatientFormProps> = ({
  onCancel,
  onGetFormData,
  providerId,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  const [formData, setFormData] = useState({
    patient: null,
    provider: providerId || 1,
    office: 'north',
    appointment_type: 'Wellness Exam',
    color_code: '#FF6B6B',
    chief_complaint: '',
    date: '',
    start_time: '',
    end_time: '',
    duration: 30,
    is_recurring: false,
    repeat_days: [] as string[],
    repeat_interval_weeks: 1,
    repeat_end_date: '',
    repeat_occurrences: 1,
    send_intake_form: false,
  });

  useEffect(() => {
    if (providerId) {
      setFormData((prev) => ({ ...prev, provider: providerId }));
    }
  }, [providerId]);

  useEffect(() => {
    onGetFormData?.(formData);
  }, [formData, onGetFormData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className='max-h-[70vh] overflow-y-auto space-y-6 p-4'>
      {/* --- Patient Section (Static for Now) --- */}
      {!selectedPatient ? (
        <section>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Search Patient
          </label>
          <div className='relative mb-2'>
            <input
              type='text'
              className='w-full border rounded p-2 pl-8'
              placeholder='Search by name, phone, PRN, or DOB'
            />
            <Search
              className='absolute left-2 top-2.5 text-gray-400'
              size={18}
            />
          </div>
          <div className='text-xs text-gray-500 mb-2 leading-5'>
            Name: First Last <br />
            Phone: 123-456-7890 <br />
            DOB: MM/DD/YYYY <br />
            PRN: A1BC234DE
          </div>
        </section>
      ) : (
        <section>
          <div className='flex justify-between items-center mb-2 text-sm'>
            <button
              className='text-red-500 hover:underline'
              onClick={() => setSelectedPatient(null)}
            >
              Remove patient
            </button>
          </div>
          <div className='flex gap-4 items-start'>
            <img
              src='/images/patient-placeholder.png'
              alt='patient'
              className='w-16 h-16 rounded-full object-cover'
            />
            <div className='text-sm leading-5'>
              <div className='font-semibold text-base'>John Smith</div>
              <div className='text-gray-500'>Male 63 yrs • PRN: A1BC234DE</div>
            </div>
          </div>
        </section>
      )}

      <hr className='border-gray-200' />

      {/* --- Appointment Details --- */}
      <section>
        <h3 className='text-lg font-semibold mb-2'>Appointment details</h3>

        {/* Provider (auto-filled) */}
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

        {/* Appointment Type & Duration */}
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Appointment Type
            </label>
            <select
              name='appointment_type'
              value={formData.appointment_type}
              onChange={handleChange}
              className='w-full border rounded p-2'
            >
              <option value='Wellness Exam'>Wellness Exam</option>
              <option value='Follow-Up'>Follow-Up</option>
              <option value='Consultation'>Consultation</option>
              <option value='Physical Therapy'>Physical Therapy</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Duration
            </label>
            <select
              name='duration'
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: Number(e.target.value) })
              }
              className='w-full border rounded p-2'
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
        </div>

        {/* Date & Times */}
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
          <label className='flex items-center gap-2 mb-2'>
            <input
              type='checkbox'
              checked={repeatEnabled}
              onChange={(e) => {
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
