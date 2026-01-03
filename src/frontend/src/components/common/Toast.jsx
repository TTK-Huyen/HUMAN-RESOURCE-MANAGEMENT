import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

// Component này nhận vào message, type và hàm onClose
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 3000); // Tự tắt sau 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? '#dcfce7' : '#fee2e2';
  const color = type === 'success' ? '#166534' : '#991b1b';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 10000,
      background: bg, color: color, padding: '12px 20px', borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 10,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <Icon size={20} />
      <span style={{ fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 10 }}>
        <X size={16} color={color} />
      </button>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
};

export default Toast;