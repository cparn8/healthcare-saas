import React, { useState } from 'react';
import { X } from 'lucide-react';
import WithPatientForm from './WithPatientForm';
import {
  appointmentsApi,
  AppointmentPayload,
} from '../../appointments/services/appointmentsApi';

interface NewAppointmentModalProps {
  onClose: () => void;
  onSaved: () => void; // called after successful save
}

/**
 * Modal for creating new appointments or block times.
 * Contains tab navigation for "With Patient" and "Block Time".
 */
const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'withPatient' | 'blockTime'>(
    'withPatient'
  );

  const [formData, setFormData] = useState<AppointmentPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Handle form submission ----
  async function handleSave() {
    if (!formData) {
      alert('Please complete the appointment form before saving.');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('📤 Submitting appointment payload:', formData);

      const result = await appointmentsApi.create(formData);
      console.log('✅ Appointment created:', result);

      alert('Appointment saved successfully!');
      onSaved(); // refresh schedule view
      onClose(); // close modal
    } catch (error: any) {
      console.error(
        '❌ Failed to create appointment:',
        error.response?.data || error
      );
      alert('Failed to save appointment — check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      {/* Modal box */}
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

        {/* Scrollable body */}
        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'withPatient' ? (
            <WithPatientForm
              onCancel={onClose}
              onGetFormData={(data: AppointmentPayload) => setFormData(data)}
            />
          ) : (
            <div className='text-gray-500 italic'>
              Block Time form goes here.
            </div>
          )}
        </div>

        {/* Footer buttons */}
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
