import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? (
        <CheckCircle size={18} style={{ color: '#10b981' }} />
      ) : (
        <AlertCircle size={18} style={{ color: '#ef4444' }} />
      )}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
