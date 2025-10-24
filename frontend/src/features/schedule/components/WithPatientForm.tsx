import React, { useState } from 'react';
import { Search, Mail, Phone } from 'lucide-react';

interface WithPatientFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

const WithPatientForm: React.FC<WithPatientFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  // ---- Form state ----
  const [formData, setFormData] = useState({
    patientId: null,
    provider: '',
    facility: 'North Office',
    complaint: '',
    type: 'Wellness Exam',
    duration: 30,
    date: '',
    startTime: '',
    endTime: '',
    repeat: false,
    repeatDays: [] as string[],
    repeatEvery: 1,
    repeatEndDate: '',
    repeatCount: 1,
    sendIntakeForm: 'Yes',
  });

  // ---- Validation ----
  function validateForm() {
    const required = ['provider', 'facility', 'date', 'startTime', 'endTime'];
    for (const key of required) {
      if (!formData[key as keyof typeof formData]) {
        alert(`Please fill out ${key.replace(/([A-Z])/g, ' $1')}.`);
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

  const handleSave = () => {
    if (validateForm()) onSave(formData);
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
              // navigate to Add Patient page later
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

        {/* Provider & Facility */}
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
              <option>Dr. Smith</option>
              <option>Dr. Johnson</option>
              <option>Dr. Lee</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Facility
            </label>
            <select
              name='facility'
              value={formData.facility}
              onChange={handleChange}
              className='w-full border rounded p-2'
            >
              <option>North Office</option>
              <option>South Office</option>
            </select>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Chief Complaint
          </label>
          <textarea
            name='complaint'
            value={formData.complaint}
            onChange={handleChange}
            className='w-full border rounded p-2'
            placeholder='Brief description of symptoms or reason for visit'
            rows={2}
          />
        </div>

        {/* Type & Duration */}
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Appointment Type
            </label>
            <select
              name='type'
              value={formData.type}
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
              name='startTime'
              value={formData.startTime}
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
              name='endTime'
              value={formData.endTime}
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
                setFormData({ ...formData, repeat: e.target.checked });
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
                        checked={formData.repeatDays.includes(day)}
                        onChange={(e) => {
                          const days = e.target.checked
                            ? [...formData.repeatDays, day]
                            : formData.repeatDays.filter((d) => d !== day);
                          setFormData({ ...formData, repeatDays: days });
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
                name='repeatEvery'
                value={formData.repeatEvery}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repeatEvery: Number(e.target.value),
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
                name='repeatEndDate'
                value={formData.repeatEndDate}
                onChange={handleChange}
                className='border rounded p-1 text-sm'
              />
              <span className='text-sm'>after</span>
              <input
                type='number'
                name='repeatCount'
                value={formData.repeatCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repeatCount: Number(e.target.value),
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
            name='sendIntakeForm'
            value={formData.sendIntakeForm}
            onChange={handleChange}
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
          className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
        >
          Save Appointment
        </button>
      </div>
    </div>
  );
};

export default WithPatientForm;
