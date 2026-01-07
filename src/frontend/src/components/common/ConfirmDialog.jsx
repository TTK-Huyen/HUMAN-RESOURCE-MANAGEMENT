import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
// import '../pages/ManagerPage/PendingApprovals.css'; // Đảm bảo import CSS

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
    return (
        <div className="logout-overlay">
            <div className="logout-popup">
                <div style={{ color: type === 'danger' ? '#dc2626' : '#2563eb', marginBottom: '1rem' }}>
                    {type === 'danger' ? <AlertTriangle size={48} /> : <Info size={48} />}
                </div>
                <h3>{title}</h3>
                <p>{message}</p>
                {warningMessage && (
                    <div style={{ background: type === 'danger' ? '#fee2e2' : '#e0f2fe', border: `1px solid ${type === 'danger' ? '#fecaca' : '#bae6fd'}`, borderRadius: 8, padding: '12px 14px', marginBottom: '1rem', color: type === 'danger' ? '#991b1b' : '#0c4a6e', fontSize: 14 }}>
                        {warningMessage}
                    </div>
                )}
                <div className="logout-actions">
                    <button className="btn-popup btn-cancel-logout" onClick={onCancel}>{cancelLabel || 'Cancel'}</button>
                    <button className={`btn-popup ${type === 'danger' ? 'btn-confirm-logout' : 'btn-confirm-approve'}`} onClick={onConfirm}>{confirmLabel || 'Yes, I\'m sure'}</button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmDialog;