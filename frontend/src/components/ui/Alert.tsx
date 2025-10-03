import React from 'react';

type AlertProps = {
  type: 'success' | 'error';
  message: string;
};

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const base = 'p-2 mb-4 rounded text-sm';
  const styles =
    type === 'success'
      ? `${base} bg-green-100 text-green-700`
      : `${base} bg-red-100 text-red-700`;

  return <div className={styles}>{message}</div>;
};

export default Alert;
