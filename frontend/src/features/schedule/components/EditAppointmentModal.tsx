// frontend/src/features/schedule/components/EditAppointmentModal.tsx
import React, { useState } from 'react';
import Trash from 'lucide-react/dist/esm/icons/trash';
import X from 'lucide-react/dist/esm/icons/x';
import {
  appointmentsApi,
  AppointmentPayload,
} from '../../appointments/services/appointmentsApi';
import { Appointment } from '../types/appointment';
import { toastPromise, toastError } from '../../../utils/toastUtils';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface EditAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdated: () => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  onClose,
  onUpdated,
}) => {
  const [formData, setFormData] = useState<AppointmentPayload>({
    ...appointment,
    repeat_days: appointment.repeat_days || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ---- Save ----
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await toastPromise(appointmentsApi.update(appointment.id!, formData), {
        loading: 'Saving changes...',
        success: '✅ Appointment updated successfully!',
        error: '❌ Failed to update appointment.',
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Update failed:', err);
      toastError('Unexpected error during update.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);
    try {
      await toastPromise(appointmentsApi.delete(appointment.id!), {
        loading: 'Deleting...',
        success: '🗑️ Appointment deleted.',
        error: '❌ Failed to delete appointment.',
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
      toastError('Unexpected error during delete.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-lg'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <h2 className='text-xl font-semibold'>Edit Appointment</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-6 space-y-4'>
          {/* Appointment Type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Appointment Type
            </label>
            <input
              type='text'
              className='w-full border rounded p-2'
              value={formData.appointment_type || ''}
              onChange={(e) =>
                setFormData({ ...formData, appointment_type: e.target.value })
              }
            />
          </div>

          {/* Chief Complaint */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Chief Complaint
            </label>
            <textarea
              className='w-full border rounded p-2'
              rows={2}
              value={formData.chief_complaint || ''}
              onChange={(e) =>
                setFormData({ ...formData, chief_complaint: e.target.value })
              }
            />
          </div>

          {/* Time Fields */}
          <div className='grid grid-cols-2 gap-4'>
            {['start_time', 'end_time'].map((field) => (
              <div key={field}>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {field === 'start_time' ? 'Start Time' : 'End Time'}
                </label>
                <input
                  type='time'
                  className='w-full border rounded p-2'
                  value={formData[field as 'start_time' | 'end_time'] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-between items-center px-6 py-4 border-t bg-gray-50'>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
              isDeleting
                ? 'bg-gray-400 cursor-wait'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Trash size={16} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>

          {/* Confirm dialog */}
          <ConfirmDialog
            open={showConfirm}
            title='Delete Appointment'
            message='Are you sure you want to permanently delete this appointment?'
            confirmLabel='Delete'
            cancelLabel='Cancel'
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />

          <div className='flex gap-2'>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded text-white transition ${
                isSaving
                  ? 'bg-gray-400 cursor-wait'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
