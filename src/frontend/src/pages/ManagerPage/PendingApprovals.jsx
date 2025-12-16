import React, { useEffect, useState } from "react";
import { 
   Clock, CheckCircle, XCircle, Eye, 
  Search, Filter, Calendar, FileText, Briefcase, LogOut 
} from 'lucide-react';
import './PendingApprovals.css';

// --- [THAY ĐỔI 1] Import Layout đúng cách (có 'Layout from') ---
import Layout from '../../components/Layout'; 

// ============================================================================
// LOGIC HIỂN THỊ (GIỮ NGUYÊN)
// ============================================================================

const getTypeConfig = (typeStr) => {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('leave')) return { label: 'Annual Leave', icon: <Calendar size={16}/>, colorClass: 'bg-blue text-blue', apiPath: 'leave' };
    if (t.includes('overtime')) return { label: 'Overtime', icon: <Clock size={16}/>, colorClass: 'bg-orange text-orange', apiPath: 'overtime' };
    if (t.includes('resignation')) return { label: 'Resignation', icon: <LogOut size={16}/>, colorClass: 'bg-red text-red', apiPath: 'resignation' };
    return { label: typeStr, icon: <FileText size={16}/>, colorClass: 'bg-purple text-purple', apiPath: 'other' };
};

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    let className = "status-badge ";
    let icon = null;
    if (s === 'pending') { className += "pending"; icon = <Clock size={12}/>; }
    else if (s === 'approved') { className += "approved"; icon = <CheckCircle size={12}/>; }
    else if (s === 'rejected') { className += "rejected"; icon = <XCircle size={12}/>; }
    else { className += "gray"; }
    return <span className={className}>{icon} {status}</span>;
};

// --- MAIN COMPONENT ---
export default function PendingApprovals() {
  const [stats, setStats] = useState({ totalRequests: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [q, setQ] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedReq, setSelectedReq] = useState(null);
  const [processing, setProcessing] = useState(false);

  // 1. Fetch Departments (Chạy 1 lần khi load trang)
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/v1/departments');
        if (res.ok) {
            const data = await res.json();
            setDepartments(data);
        }
      } catch (error) { console.error("Error fetching departments:", error); }
    };
    fetchDepartments();
  }, []);

  // 2. Fetch Data & Summary (Chạy khi filter thay đổi)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.append('keyword', q);
        if (selectedDeptId) params.append('DepartmentId', selectedDeptId);
        const query = params.toString();

        const [statsRes, requestsRes] = await Promise.all([
          fetch(`/api/v1/requests/dashboard/summary?${query}`),
          fetch(`/api/v1/requests/dashboard?${query}`)
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        
        if (requestsRes.ok) {
            const data = await requestsRes.json();
            setRequests(data.items || []); 
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [q, selectedDeptId]);

  // 3. Xử lý Approval (Dùng API thật)
  const handleApproval = async (status, reason = "") => {
    if (!selectedReq) return;
    setProcessing(true);
    
    const payload = { "Status": status, "RejectReason": reason };
    const typeConfig = getTypeConfig(selectedReq.requestType);

    try {
        const res = await fetch(`/api/v1/${typeConfig.apiPath}-requests/${selectedReq.requestCode}/approval`, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const nowStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            setRequests(prev => prev.map(r => r.requestCode === selectedReq.requestCode ? { ...r, status: status, decidedAt: nowStr } : r));
            setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1, [status === 'APPROVED' ? 'approvedCount' : 'rejectedCount']: prev[status === 'APPROVED' ? 'approvedCount' : 'rejectedCount'] + 1 }));
            setSelectedReq(null);
        } else {
            alert("Error processing request: Server returned error");
        }
    } catch (err) { alert("Network error processing request"); } finally { setProcessing(false); }
  };

  return (
    // --- [THAY ĐỔI 2] Bọc toàn bộ nội dung trong thẻ Layout ---
    <Layout>
        <div className="pa-container">
        {/* HEADER */}
        <div className="pa-header">
            <div className="pa-title">
            <h1>Request Management</h1>
            <p>Centralized Approval Dashboard (Manager View)</p>
            </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">
            <div className="stat-card blue">
            <div className="stat-info"><p>Total Requests</p><div className="stat-value">{stats.totalRequests}</div></div>
            <div className="stat-icon"><FileText size={24} /></div>
            </div>
            <div className="stat-card yellow">
            <div className="stat-info"><p>Pending</p><div className="stat-value">{stats.pendingCount}</div></div>
            <div className="stat-icon"><Clock size={24} /></div>
            </div>
            <div className="stat-card green">
            <div className="stat-info"><p>Approved</p><div className="stat-value">{stats.approvedCount}</div></div>
            <div className="stat-icon"><CheckCircle size={24} /></div>
            </div>
            <div className="stat-card red">
            <div className="stat-info"><p>Rejected</p><div className="stat-value">{stats.rejectedCount}</div></div>
            <div className="stat-icon"><XCircle size={24} /></div>
            </div>
        </div>

        {/* FILTERS */}
        <div className="filter-bar">
            <div className="input-group search-wrapper">
            <Search size={18} color="#94a3b8"/>
            <input type="text" placeholder="Search by ID or Employee Name..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="input-group filter-select-wrapper">
            <Filter size={18} color="#94a3b8"/>
            <select value={selectedDeptId} onChange={(e) => setSelectedDeptId(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            </div>
        </div>

        {/* TABLE */}
        <div className="table-container">
            <div className="table-responsive">
            <table className="pa-table">
                <thead>
                <tr>
                    <th>Request Type / ID</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Decided / Effective</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading data...</td></tr>
                ) : requests.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>No matching requests found.</td></tr>
                ) : (
                    requests.map((req) => {
                    const typeInfo = getTypeConfig(req.requestType);
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.employee.fullName)}&background=random&color=fff`;
                    return (
                        <tr key={req.requestCode}>
                        <td>
                            <div className="cell-type">
                            <div className="type-icon" style={{backgroundColor: typeInfo.colorClass.includes('blue') ? '#eff6ff' : typeInfo.colorClass.includes('orange') ? '#fff7ed' : '#fef2f2', color: typeInfo.colorClass.includes('blue') ? '#2563eb' : typeInfo.colorClass.includes('orange') ? '#ea580c' : '#dc2626'}}>
                                {typeInfo.icon}
                            </div>
                            <div>
                                <div style={{fontWeight: 600, fontSize: '0.875rem'}}>{typeInfo.label}</div>
                                <div style={{fontSize: '0.75rem', color: '#3b82f6', fontFamily: 'monospace', cursor:'pointer'}}>{req.requestCode}</div>
                            </div>
                            </div>
                        </td>
                        <td>
                            <div className="cell-user">
                            <img src={avatarUrl} alt="avatar" className="user-avatar" />
                            <div className="user-info"><div className="name">{req.employee.fullName}</div><div className="id">{req.employee.id}</div></div>
                            </div>
                        </td>
                        <td><span style={{background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>{req.employee.departmentName}</span></td>
                        <td>
                            <div className="date-info">
                                <span className="date-label" style={{color: req.decidedAt ? '#0f172a' : '#94a3b8', fontWeight: req.decidedAt ? 500 : 400}}>
                                    Decided: {req.decidedAt || '--'}
                                </span> 
                                <span className="date-value" style={{display:'block', marginTop:'2px', color: '#64748b', fontSize:'0.75rem', fontWeight: 400}}>
                                    Eff: {req.effectiveDate}
                                </span>
                            </div>
                        </td>
                        <td><StatusBadge status={req.status} /></td>
                        <td style={{textAlign: 'center'}}>
                            <button onClick={() => setSelectedReq(req)} className="btn-view" title="View Details"><Eye size={18} /></button>
                        </td>
                        </tr>
                    )
                    })
                )}
                </tbody>
            </table>
            </div>
        </div>

        {/* MODAL (GIỮ NGUYÊN) */}
        {selectedReq && (
            <DetailModal 
                req={selectedReq} 
                onClose={() => setSelectedReq(null)} 
                onApprove={() => handleApproval('APPROVED')}
                onReject={(reason) => handleApproval('REJECTED', reason)}
                processing={processing}
            />
        )}
        </div>
    </Layout> // --- Kết thúc thẻ Layout ---
  );
}

// --- SUB-COMPONENT: MODAL (GIỮ NGUYÊN) ---
const DetailModal = ({ req, onClose, onApprove, onReject, processing }) => {
    const typeInfo = getTypeConfig(req.requestType);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    return (
        <div className="modal-overlay">
          <div className="modal-drawer">
            <div className="drawer-header">
              <div>
                <h2 style={{fontSize: '1.25rem', fontWeight: 700, margin: 0}}>Approval Details</h2>
                <span style={{fontFamily: 'monospace', fontSize: '0.875rem', color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px'}}>{req.requestCode}</span>
              </div>
              <button onClick={onClose} className="btn-close"><XCircle size={28} /></button>
            </div>

            <div style={{flex: 1, overflowY: 'auto', padding: '1.5rem'}}>
              <div className="detail-card">
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(req.employee.fullName)}&background=random&color=fff`} alt="" className="user-avatar" style={{width: '3.5rem', height: '3.5rem'}}/>
                 <div>
                    <h3 style={{margin: 0, fontSize: '1.125rem'}}>{req.employee.fullName}</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                        <Briefcase size={14} /> <span>{req.employee.departmentName}</span>
                    </div>
                 </div>
              </div>

              <div className="info-grid">
                    <div className="info-row"><span className="info-label">Type</span><span className="info-value">{typeInfo.label}</span></div>
                    <div className="info-row"><span className="info-label">Decided At</span><span className="info-value">{req.decidedAt || 'Pending'}</span></div>
                    <div className="info-row"><span className="info-label">Effective</span><span className="info-value">{req.effectiveDate}</span></div>
                    <div className="info-row"><span className="info-label">Status</span><div style={{justifySelf: 'end'}}><StatusBadge status={req.status} /></div></div>
              </div>
              
              {showRejectInput && (
                  <div className="reject-area" style={{marginTop: '1.5rem', animation: 'fadeIn 0.3s'}}>
                      <label style={{fontWeight: 600, fontSize: '0.875rem', color: '#334155'}}>Rejection Reason:</label>
                      <textarea rows="3" placeholder="Enter reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}></textarea>
                  </div>
              )}
            </div>

            <div className="drawer-footer">
                {req.status === 'PENDING' ? (
                    <div className="action-buttons">
                         {!showRejectInput ? (
                             <>
                                <button disabled={processing} onClick={() => setShowRejectInput(true)} className="btn-action reject"><XCircle size={18}/> Reject</button>
                                <button disabled={processing} onClick={onApprove} className="btn-action approve">{processing ? '...' : <><CheckCircle size={18}/> Approve</>}</button>
                             </>
                         ) : (
                             <>
                                <button onClick={() => setShowRejectInput(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#64748b', fontWeight: 500}}>Cancel</button>
                                <button disabled={processing || !rejectReason.trim()} onClick={() => onReject(rejectReason)} className="btn-action confirm-reject">Confirm Reject</button>
                             </>
                         )}
                    </div>
                ) : (
                    <div style={{textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.875rem'}}>This request has already been processed.</div>
                )}
            </div>
          </div>
        </div>
    );
}