import React, { useState } from 'react';
import { X } from 'lucide-react'; // optional icon (lucide-react already available in ChatGPT projects)

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Modal shell with tab navigation for creating a new appointment.
 * Form contents will be added in later phases.
 */
const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'withPatient' | 'blockTime'>(
    'withPatient'
  );

  if (!isOpen) return null;

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
            <div className='text-gray-500 italic'>
              With Patient form goes here
            </div>
          ) : (
            <div className='text-gray-500 italic'>
              Block Time form goes here
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className='flex justify-between items-center border-t px-6 py-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
