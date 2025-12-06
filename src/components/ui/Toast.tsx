import React from 'react';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  const bg = type === 'error' ? 'bg-red-100 text-red-800' : type === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-800';
  return (
    <div role="alert" aria-live="polite" className={`${bg} px-3 py-2 rounded shadow-sm`}>
      {message}
    </div>
  );
};

export default Toast;
