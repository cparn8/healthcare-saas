import React from 'react';

type BaseProps = {
  label?: string;
  error?: string;
  className?: string;
  as?: 'input' | 'select';
};

const FormField: React.FC<
  (
    | React.InputHTMLAttributes<HTMLInputElement>
    | React.SelectHTMLAttributes<HTMLSelectElement>
  ) &
    BaseProps
> = ({ label, error, className, as = 'input', children, ...props }) => {
  return (
    <label className='block'>
      {label && (
        <span className='block text-sm text-gray-700 mb-1'>{label}</span>
      )}
      {as === 'select' ? (
        <select
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          className={`border p-2 w-full rounded ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className ?? ''}`}
        >
          {children}
        </select>
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          className={`border p-2 w-full rounded ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className ?? ''}`}
        />
      )}
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </label>
  );
};

export default FormField;
