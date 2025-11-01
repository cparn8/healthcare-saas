// frontend/src/features/schedule/components/NewAppointmentModal.tsx
import React, { useState } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import WithPatientForm from './WithPatientForm';
import {
  appointmentsApi,
  AppointmentPayload,
} from '../../appointments/services/appointmentsApi';
import {
  toastError,
  toastSuccess,
  toastPromise,
} from '../../../utils/toastUtils';

interface NewAppointmentModalProps {
  onClose: () => void;
  onSaved: () => void;
  providerId?: number | null;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  onClose,
  onSaved,
  providerId,
}) => {
  const [activeTab, setActiveTab] = useState<'withPatient' | 'blockTime'>(
    'withPatient'
  );
  const [formData, setFormData] = useState<AppointmentPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    if (!formData) {
      toastError('Please complete the appointment form before saving.');
      return;
    }

    if (!providerId) {
      toastError('Provider ID missing — please log in as a provider.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: AppointmentPayload = {
        ...formData,
        provider: providerId,
        office: formData.office || 'north',
        repeat_end_date: formData.repeat_end_date || null,
      };

      console.log('📤 Submitting appointment payload:', payload);

      await toastPromise(appointmentsApi.create(payload), {
        loading: 'Saving appointment...',
        success: '✅ Appointment saved successfully!',
        error: '❌ Failed to save appointment.',
      });

      toastSuccess('Appointment created!');
      onSaved();
      onClose();
    } catch (error: any) {
      console.error(
        '❌ Appointment creation failed:',
        error.response?.data || error
      );
      toastError('Server error — check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <h2 className='text-xl font-semibold'>New Appointment</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b text-sm font-medium'>
          <button
            className={`px-6 py-2 ${
              activeTab === 'withPatient'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('withPatient')}
          >
            With Patient
          </button>
          <button
            className={`px-6 py-2 ${
              activeTab === 'blockTime'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('blockTime')}
          >
            Block Time
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'withPatient' ? (
            <WithPatientForm
              providerId={providerId}
              onCancel={onClose}
              onGetFormData={(data: AppointmentPayload) => setFormData(data)}
            />
          ) : (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Block Time</h3>
              <p className='text-sm text-gray-600'>
                Reserve time for lunch, meetings, or administrative work.
              </p>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Date
                  </label>
                  <input
                    type='date'
                    className='w-full border rounded p-2'
                    onChange={(e) =>
                      setFormData(
                        (prev): AppointmentPayload => ({
                          ...(prev || {
                            provider: providerId ?? 1,
                            office: 'north',
                            appointment_type: 'Block Time',
                            chief_complaint: 'Block Time',
                            color_code: '#9CA3AF',
                            start_time: '',
                            end_time: '',
                            duration: 30,
                            is_recurring: false,
                          }),
                          date: e.target.value,
                          patient: null,
                          appointment_type: 'Block Time',
                        })
                      )
                    }
                  />
                </div>

                {['start_time', 'end_time'].map((field) => (
                  <div key={field}>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {field === 'start_time' ? 'Start Time' : 'End Time'}
                    </label>
                    <input
                      type='time'
                      className='w-full border rounded p-2'
                      onChange={(e) =>
                        setFormData(
                          (prev): AppointmentPayload => ({
                            ...(prev || {
                              provider: providerId ?? 1,
                              office: 'north',
                              appointment_type: 'Block Time',
                              chief_complaint: 'Block Time',
                              color_code: '#9CA3AF',
                              date: '',
                              start_time: '',
                              end_time: '',
                              duration: 30,
                              is_recurring: false,
                            }),
                            [field]: e.target.value,
                          })
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-between px-6 py-4 border-t bg-gray-50'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded text-white transition ${
              isSubmitting
                ? 'bg-gray-400 cursor-wait'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
