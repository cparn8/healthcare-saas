// frontend/src/components/common/ConfirmDialog.tsx
import React from 'react';
import { toastInfo } from '../../utils/toastUtils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog
 * Generic modal for confirming destructive or irreversible actions.
 * Shows consistent toast feedback for confirm/cancel.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const handleConfirm = () => {
    toastInfo(`✔️ ${confirmLabel} confirmed`);
    onConfirm();
  };

  const handleCancel = () => {
    toastInfo('Action canceled');
    onCancel();
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-sm'>
        {/* Header */}
        <div className='px-6 py-4 border-b'>
          <h2 className='text-lg font-semibold text-gray-800'>{title}</h2>
        </div>

        {/* Message */}
        <div className='px-6 py-4 text-sm text-gray-700'>{message}</div>

        {/* Footer */}
        <div className='flex justify-end gap-2 px-6 py-4 border-t bg-gray-50'>
          <button
            onClick={handleCancel}
            className='px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition'
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition'
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
