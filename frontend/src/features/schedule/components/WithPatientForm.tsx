import React, { useState } from 'react';
import { Search, Mail, Phone } from 'lucide-react';
import {
  appointmentsApi,
  AppointmentPayload,
} from '../../appointments/services/appointmentsApi';

interface WithPatientFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const WithPatientForm: React.FC<WithPatientFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Form state ----
  const [formData, setFormData] = useState({
    patientId: null,
    provider: 1, // ✅ temporary placeholder until linked with logged-in provider
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

  // ---- Validation ----
  function validateForm() {
    const required = ['provider', 'office', 'date', 'start_time', 'end_time'];
    for (const key of required) {
      if (!(formData as any)[key]) {
        alert(`Please fill out ${key.replace(/_/g, ' ')}.`);
        return false;
      }
    }
    return true;
  }

  // ---- Handlers ----
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const name = target.name;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---- Submit Handler ----
  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload: AppointmentPayload = {
        patient: selectedPatient ? selectedPatient.id : null,
        provider: formData.provider,
        office: formData.office as 'north' | 'south',
        appointment_type: formData.appointment_type,
        color_code: formData.color_code,
        chief_complaint: formData.chief_complaint,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        duration: formData.duration,
        is_recurring: repeatEnabled,
        repeat_days: formData.repeat_days,
        repeat_interval_weeks: formData.repeat_interval_weeks,
        repeat_end_date: formData.repeat_end_date || null,
        repeat_occurrences: formData.repeat_occurrences,
        send_intake_form: formData.send_intake_form,
      };

      console.log('📤 Submitting appointment payload:', payload);

      const result = await appointmentsApi.create(payload);
      console.log('✅ Appointment created:', result);

      alert('Appointment saved successfully!');
      onSave();
    } catch (error: any) {
      console.error(
        '❌ Failed to create appointment:',
        error.response?.data || error
      );
      alert('Failed to save appointment — check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Render ----
  return (
    <div className='max-h-[70vh] overflow-y-auto space-y-6 p-4'>
      {/* === Patient Search / Selection === */}
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

          <hr className='border-gray-200 my-3' />

          <button
            className='text-blue-600 text-sm hover:underline'
            onClick={() => {
              // TODO: link to Add Patient page
            }}
          >
            + Add new patient
          </button>
        </section>
      ) : (
        <section>
          <div className='flex justify-between items-center mb-2 text-sm'>
            <div className='flex gap-3'>
              <button className='text-blue-600 hover:underline'>
                Edit patient details
              </button>
              <button className='text-blue-600 hover:underline'>
                Go to chart
              </button>
            </div>
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
              <div className='text-gray-500'>
                Male 63 yrs 01/01/1962 PRN: A1BC234DE
              </div>
              <div className='flex items-center gap-2'>
                <Mail size={14} className='text-gray-400' />
                <span>johnsmith@email.com</span>
              </div>
              <div className='flex items-center gap-2'>
                <Phone size={14} className='text-gray-400' />
                <span>(123) 456-7890</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <hr className='border-gray-200' />

      {/* === Appointment Details === */}
      <section>
        <h3 className='text-lg font-semibold mb-2'>Appointment details</h3>

        {/* Provider & Office */}
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Provider
            </label>
            <select
              name='provider'
              value={formData.provider}
              onChange={handleChange}
              className='w-full border rounded p-2'
            >
              <option value=''>Select Provider</option>
              <option value={1}>Dr. Smith</option>
              <option value={2}>Dr. Johnson</option>
              <option value={3}>Dr. Lee</option>
            </select>
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
              <option>Wellness Exam</option>
              <option>Follow-Up</option>
              <option>Consultation</option>
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

        {/* Date, Times, Repeat */}
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
                setFormData({ ...formData, is_recurring: e.target.checked });
              }}
              className='h-4 w-4'
            />
            <span className='text-sm font-medium text-gray-700'>Repeat</span>
          </label>
        </div>

        {/* Repeat sections */}
        {repeatEnabled && (
          <div className='space-y-3 border rounded p-3 bg-gray-50 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Occurs On
              </label>
              <div className='flex flex-wrap gap-2'>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                  (day) => (
                    <label
                      key={day}
                      className='flex items-center gap-1 text-sm border rounded px-2 py-1 cursor-pointer hover:bg-white'
                    >
                      <input
                        type='checkbox'
                        checked={formData.repeat_days.includes(day)}
                        onChange={(e) => {
                          const days = e.target.checked
                            ? [...formData.repeat_days, day]
                            : formData.repeat_days.filter((d) => d !== day);
                          setFormData({ ...formData, repeat_days: days });
                        }}
                        className='h-3 w-3'
                      />{' '}
                      {day}
                    </label>
                  )
                )}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-sm'>Every</span>
              <select
                name='repeat_interval_weeks'
                value={formData.repeat_interval_weeks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repeat_interval_weeks: Number(e.target.value),
                  })
                }
                className='border rounded p-1 text-sm'
              >
                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <span className='text-sm'>week(s)</span>
            </div>

            <div className='flex items-center gap-3'>
              <span className='text-sm'>Ends on</span>
              <input
                type='date'
                name='repeat_end_date'
                value={formData.repeat_end_date}
                onChange={handleChange}
                className='border rounded p-1 text-sm'
              />
              <span className='text-sm'>after</span>
              <input
                type='number'
                name='repeat_occurrences'
                value={formData.repeat_occurrences}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repeat_occurrences: Number(e.target.value),
                  })
                }
                className='border rounded p-1 text-sm w-16'
                min={1}
                max={99}
              />
              <span className='text-sm'>appointments</span>
            </div>
          </div>
        )}
      </section>

      <hr className='border-gray-200' />

      {/* === Intake Form === */}
      <section>
        <h3 className='text-lg font-semibold mb-2'>Intake Form</h3>
        <label className='flex items-center gap-2 text-sm'>
          <span>Send Intake Form?</span>
          <select
            name='send_intake_form'
            value={formData.send_intake_form ? 'Yes' : 'No'}
            onChange={(e) =>
              setFormData({
                ...formData,
                send_intake_form: e.target.value === 'Yes',
              })
            }
            className='border rounded p-1'
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>
      </section>

      {/* Footer Buttons */}
      <div className='flex justify-between pt-4'>
        <button
          onClick={onCancel}
          className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save Appointment'}
        </button>
      </div>
    </div>
  );
};

export default WithPatientForm;
