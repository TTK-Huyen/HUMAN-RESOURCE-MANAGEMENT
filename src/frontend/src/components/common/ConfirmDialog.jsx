import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
// import '../pages/ManagerPage/PendingApprovals.css'; // Đảm bảo import CSS

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, type = 'info' }) => {
    if (!isOpen) return null;
    return (
        <div className="logout-overlay">
            <div className="logout-popup">
                <div style={{ color: type === 'danger' ? '#dc2626' : '#2563eb', marginBottom: '1rem' }}>
                    {type === 'danger' ? <AlertTriangle size={48} /> : <Info size={48} />}
                </div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="logout-actions">
                    <button className="btn-popup btn-cancel-logout" onClick={onCancel}>Cancel</button>
                    <button className={`btn-popup ${type === 'danger' ? 'btn-confirm-logout' : 'btn-confirm-approve'}`} onClick={onConfirm}>Yes, I'm sure</button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmDialog;