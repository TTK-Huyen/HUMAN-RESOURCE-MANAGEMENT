import React from 'react';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

const StatsGrid = ({ stats }) => {
    return (
        <div className="stats-grid">
            <div className="stat-card blue"><div><div className="stat-value">{stats.totalRequests}</div><div className="stat-info"><p>Total</p></div></div><div className="stat-icon"><FileText size={24}/></div></div>
            <div className="stat-card yellow"><div><div className="stat-value">{stats.pendingCount}</div><div className="stat-info"><p>Pending</p></div></div><div className="stat-icon"><Clock size={24}/></div></div>
            <div className="stat-card green"><div><div className="stat-value">{stats.approvedCount}</div><div className="stat-info"><p>Approved</p></div></div><div className="stat-icon"><CheckCircle size={24}/></div></div>
            <div className="stat-card red"><div><div className="stat-value">{stats.rejectedCount}</div><div className="stat-info"><p>Rejected</p></div></div><div className="stat-icon"><XCircle size={24}/></div></div>
        </div>
    );
};
export default StatsGrid;