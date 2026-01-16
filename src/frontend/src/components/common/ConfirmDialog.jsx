import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  type = 'info',
  warningMessage = null,
  confirmLabel = null,
  cancelLabel = null
}) => {
    if (!isOpen) return null;
    
    const getTypeStyles = () => {
      switch(type) {
        case 'danger':
          return {
            iconColor: '#dc2626',
            icon: AlertTriangle,
            bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            borderColor: '#f87171'
          };
        case 'success':
          return {
            iconColor: '#16a34a',
            icon: CheckCircle,
            bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            borderColor: '#4ade80'
          };
        default:
          return {
            iconColor: '#2563eb',
            icon: Info,
            bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderColor: '#60a5fa'
          };
      }
    };
    
    const typeStyle = getTypeStyles();
    const IconComponent = typeStyle.icon;
    
    return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideUp 0.3s ease-out',
              position: 'relative'
            }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: typeStyle.bgGradient,
                    border: `3px solid ${typeStyle.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    animation: 'scaleIn 0.4s ease-out'
                  }}>
                    <IconComponent size={40} color={typeStyle.iconColor} strokeWidth={2.5} />
                  </div>
                  
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    {title}
                  </h3>
                  
                  <p style={{
                    fontSize: '15px',
                    color: '#64748b',
                    textAlign: 'center',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {message}
                  </p>
                </div>
                
                {warningMessage && (
                    <div style={{
                      background: type === 'danger' ? '#fef2f2' : type === 'success' ? '#f0fdf4' : '#eff6ff',
                      border: `1px solid ${type === 'danger' ? '#fecaca' : type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
                      borderRadius: '12px',
                      padding: '14px 16px',
                      marginBottom: '24px',
                      color: type === 'danger' ? '#991b1b' : type === 'success' ? '#166534' : '#1e40af',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      display: 'flex',
                      alignItems: 'start',
                      gap: '10px'
                    }}>
                      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{warningMessage}</span>
                    </div>
                )}
                
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px'
                }}>
                    <button 
                      onClick={onCancel}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: '600',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        background: 'white',
                        color: '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f8fafc';
                        e.target.style.borderColor = '#cbd5e1';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      {cancelLabel || 'Cancel'}
                    </button>
                    
                    <button 
                      onClick={onConfirm}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '10px',
                        background: type === 'danger' 
                          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                          : type === 'success'
                          ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                          : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                    >
                      {confirmLabel || "Yes, I'm sure"}
                    </button>
                </div>
            </div>
            
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              @keyframes scaleIn {
                from {
                  transform: scale(0.8);
                  opacity: 0;
                }
                to {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}</style>
        </div>
    );
};

export default ConfirmDialog;