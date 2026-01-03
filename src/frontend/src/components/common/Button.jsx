import React from 'react';
import { Loader2 } from 'lucide-react';

// variants: 'primary' (xanh), 'danger' (đỏ), 'secondary' (xám), 'ghost' (trong suốt)
const Button = ({ children, onClick, variant = 'primary', isLoading = false, disabled, icon: Icon, ...props }) => {
  
  const getStyle = () => {
    const base = { padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, opacity: (disabled || isLoading) ? 0.7 : 1, pointerEvents: (disabled || isLoading) ? 'none' : 'auto' };
    
    switch (variant) {
      case 'danger': return { ...base, background: '#ef4444', color: 'white' };
      case 'secondary': return { ...base, background: '#e2e8f0', color: '#334155' };
      case 'ghost': return { ...base, background: 'transparent', color: '#64748b' };
      case 'primary': default: return { ...base, background: '#3b82f6', color: 'white' };
    }
  };

  return (
    <button style={getStyle()} onClick={onClick} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 size={16} className="spin" />}
      {!isLoading && Icon && <Icon size={16} />}
      {children}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </button>
  );
};

export default Button;