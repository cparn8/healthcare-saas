import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone } from 'lucide-react';

interface WithPatientFormProps {
  onCancel: () => void;
  onGetFormData?: (data: any) => void;
}

const WithPatientForm: React.FC<WithPatientFormProps> = ({
  onCancel,
  onGetFormData,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  const [formData, setFormData] = useState({
    patientId: null,
    provider: 1, // temporary placeholder until linked with logged-in provider
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

  // Send formData to parent anytime it changes
  useEffect(() => {
    onGetFormData?.(formData);
  }, [formData, onGetFormData]);

  // ---- Form field change handler ----
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

    setFormData((prev) => ({ ...prev, [name]: value }));
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
    </div>
  );
};

export default WithPatientForm;
