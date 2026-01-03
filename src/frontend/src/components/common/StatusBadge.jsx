import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const s = status?.toUpperCase() || 'PENDING';
    let icon = <Clock size={12}/>;
    let styleClass = 'pending';
    
    if (s === 'APPROVED') { icon = <CheckCircle size={12}/>; styleClass = 'approved'; }
    else if (s === 'REJECTED') { icon = <XCircle size={12}/>; styleClass = 'rejected'; }
    
    return <span className={`status-badge ${styleClass}`}>{icon} {status}</span>;
};

export default StatusBadge;