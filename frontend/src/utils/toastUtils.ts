// frontend/src/utils/toastUtils.ts
import toast from 'react-hot-toast';

/* ------------------------------
 * Simple, consistent toasts
 * ------------------------------ */

export const toastSuccess = (message: string) =>
  toast.success(message, {
    duration: 3000,
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: 500,
      borderRadius: '8px',
      padding: '10px 14px',
    },
    iconTheme: { primary: '#fff', secondary: '#10B981' },
  });

export const toastError = (message: string) =>
  toast.error(message, {
    duration: 4000,
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: 500,
      borderRadius: '8px',
      padding: '10px 14px',
    },
    iconTheme: { primary: '#fff', secondary: '#EF4444' },
  });

export const toastInfo = (message: string) =>
  toast(message, {
    duration: 3000,
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: 500,
      borderRadius: '8px',
      padding: '10px 14px',
    },
    iconTheme: { primary: '#fff', secondary: '#3B82F6' },
  });

/* ---------------------------------------------
 * Async "promise toasts" for API operations
 * --------------------------------------------- */

export const toastPromise = async <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T | void> => {
  try {
    const result = await toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: {
          background: '#111827',
          color: '#fff',
          fontWeight: 500,
          borderRadius: '8px',
          padding: '10px 14px',
        },
        success: {
          style: { background: '#10B981' },
        },
        error: {
          style: { background: '#EF4444' },
        },
      }
    );
    return result;
  } catch (err) {
    console.error('❌ toastPromise error:', err);
  }
};
