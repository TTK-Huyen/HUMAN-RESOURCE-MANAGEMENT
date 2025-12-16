import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Clock, CheckCircle, XCircle, Eye, Search, Filter, 
  Calendar, FileText, LogOut, Paperclip, AlertTriangle, Info, ChevronLeft, ChevronRight
} from 'lucide-react';
import './PendingApprovals.css';
import Layout from '../../components/Layout'; 

// --- CONFIG ---
const API_BASE = "/api/v1";
const PAGE_SIZE = 10; // Số lượng request mỗi trang

const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
        let safeDateStr = dateString;
        if (typeof safeDateStr === 'string' && !safeDateStr.endsWith('Z') && !safeDateStr.includes('+')) {
            safeDateStr += 'Z';
        }
        const date = new Date(safeDateStr);
        if (isNaN(date.getTime())) return "--";
        
        return date.toLocaleString('en-GB', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh' 
        });
    } catch { return "--"; }
};

const getTypeConfig = (typeStr) => {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('leave')) return { label: 'Annual Leave', icon: <Calendar size={18}/>, colorClass: 'bg-blue', apiDetailPath: 'getdetail-leave-requests', apiApprovePath: 'leave-requests' };
    if (t.includes('overtime')) return { label: 'Overtime', icon: <Clock size={18}/>, colorClass: 'bg-orange', apiDetailPath: 'getdetail-overtime-requests', apiApprovePath: 'overtime-requests' };
    if (t.includes('resignation')) return { label: 'Resignation', icon: <LogOut size={18}/>, colorClass: 'bg-red', apiDetailPath: 'getdetail-resignation-requests', apiApprovePath: 'resignation-requests' };
    return { label: typeStr, icon: <FileText size={18}/>, colorClass: 'bg-gray', apiDetailPath: 'requests', apiApprovePath: 'requests' };
};

const StatusBadge = ({ status }) => {
    const s = status?.toUpperCase() || 'PENDING';
    let icon = <Clock size={12}/>;
    let styleClass = 'pending';
    if (s === 'APPROVED') { icon = <CheckCircle size={12}/>; styleClass = 'approved'; }
    if (s === 'REJECTED') { icon = <XCircle size={12}/>; styleClass = 'rejected'; }
    return <span className={`status-badge ${styleClass}`}>{icon} {status}</span>;
};

// --- CONFIRMATION DIALOG ---
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

// --- MAIN COMPONENT ---
export default function PendingApprovals() {
  const [stats, setStats] = useState({ totalRequests: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter State
  const [keyword, setKeyword] = useState("");
  const [deptId, setDeptId] = useState("");
  
  // Pagination State [MỚI]
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedReq, setSelectedReq] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/departments`).then(res => res.ok ? res.json() : []).then(setDepartments).catch(console.error);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (deptId) params.append('DepartmentId', deptId);
      const query = params.toString();

      const [summaryRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/requests/dashboard/summary?${query}`),
        fetch(`${API_BASE}/requests/dashboard?${query}`)
      ]);

      if (summaryRes.ok) setStats(await summaryRes.json());
      
      if (listRes.ok) {
        const listData = await listRes.json();
        let items = listData.items || [];
        // Sắp xếp
        items.sort((a, b) => {
            const isPendingA = a.status?.toUpperCase() === 'PENDING';
            const isPendingB = b.status?.toUpperCase() === 'PENDING';
            if (isPendingA && !isPendingB) return -1;
            if (!isPendingA && isPendingB) return 1;
            const dateA = new Date(a.effectiveDate || 0).getTime();
            const dateB = new Date(b.effectiveDate || 0).getTime();
            return dateA - dateB;
        });
        setRequests(items);
        setCurrentPage(1); // Reset về trang 1 khi data thay đổi (filter/search)
      }
    } catch (error) { console.error("Dashboard Load Error:", error); } 
    finally { setLoading(false); }
  }, [keyword, deptId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDashboardData(), 500);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  // [MỚI] Logic tính toán Pagination
  const indexOfLastRequest = currentPage * PAGE_SIZE;
  const indexOfFirstRequest = indexOfLastRequest - PAGE_SIZE;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / PAGE_SIZE);

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  };

  return (
    <Layout>
      <div className="pa-container">
        <div className="pa-header">
          <div className="pa-title"><h1>Request Management</h1><p>Centralized Approval Dashboard</p></div>
        </div>

        <div className="stats-grid">
            <div className="stat-card blue"><div><div className="stat-value">{stats.totalRequests}</div><div className="stat-info"><p>Total</p></div></div><div className="stat-icon"><FileText size={24}/></div></div>
            <div className="stat-card yellow"><div><div className="stat-value">{stats.pendingCount}</div><div className="stat-info"><p>Pending</p></div></div><div className="stat-icon"><Clock size={24}/></div></div>
            <div className="stat-card green"><div><div className="stat-value">{stats.approvedCount}</div><div className="stat-info"><p>Approved</p></div></div><div className="stat-icon"><CheckCircle size={24}/></div></div>
            <div className="stat-card red"><div><div className="stat-value">{stats.rejectedCount}</div><div className="stat-info"><p>Rejected</p></div></div><div className="stat-icon"><XCircle size={24}/></div></div>
        </div>

        <div className="filter-bar">
          <div className="input-group search-wrapper"><Search size={18} color="#94a3b8"/><input placeholder="Search requests..." value={keyword} onChange={(e) => setKeyword(e.target.value)}/></div>
          <div className="input-group filter-select-wrapper"><Filter size={18} color="#94a3b8"/><select value={deptId} onChange={(e) => setDeptId(e.target.value)}><option value="">All Departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="pa-table">
              <thead><tr><th>Request Type</th><th>Employee</th><th>Department</th><th>Decided / Effective</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {loading ? ( <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>Loading data...</td></tr> ) : 
                 requests.length === 0 ? ( <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No requests found.</td></tr> ) : (
                  // [ĐÃ SỬA] Render currentRequests thay vì requests
                  currentRequests.map((req) => {
                    const conf = getTypeConfig(req.requestType);
                    return (
                      <tr key={req.requestCode}>
                        <td><div className="cell-type"><div className={`type-icon ${conf.colorClass}`}>{conf.icon}</div><div><div className="fw-600">{req.requestCode}</div><div className="sub-text">{conf.label}</div></div></div></td>
                        <td><div className="user-cell"><div className="avatar-small">{req.employee?.fullName?.charAt(0)}</div><div><div className="fw-600">{req.employee?.fullName}</div><div className="sub-text">ID: {req.employee?.id}</div></div></div></td>
                        <td>{req.employee?.departmentName}</td>
                        <td><div className="date-cell"><div className="date-row"><span className="date-label">Decided:</span> <span className="date-val" style={{color: req.decidedAt?'#0f172a':'#94a3b8'}}>{formatDate(req.decidedAt)}</span></div><div className="date-row"><span className="date-label">Eff:</span> <span className="date-val">{formatDate(req.effectiveDate)}</span></div></div></td>
                        <td><StatusBadge status={req.status}/></td>
                        <td><button className="btn-view" onClick={() => setSelectedReq(req)}><Eye size={18}/></button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* [MỚI] THANH PHÂN TRANG */}
          {!loading && requests.length > 0 && (
              <div className="pagination-controls">
                  <span className="page-info">
                      Page {currentPage} of {totalPages}
                  </span>
                  <button 
                      className="btn-page" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                  >
                      <ChevronLeft size={16} />
                  </button>
                  <button 
                      className="btn-page" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                  >
                      <ChevronRight size={16} />
                  </button>
              </div>
          )}
        </div>

        {selectedReq && <DetailModal req={selectedReq} onClose={() => setSelectedReq(null)} onRefresh={fetchDashboardData} />}
      </div>
    </Layout>
  );
}

// ============================================================================
// DETAIL MODAL (Giữ nguyên)
// ============================================================================
const DetailModal = ({ req, onClose, onRefresh }) => {
  const typeConfig = getTypeConfig(req.requestType);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(req.status);
  const [toast, setToast] = useState(null); 
  const [confirmAction, setConfirmAction] = useState({ show: false, type: null });

  useEffect(() => { setCurrentStatus(req.status); }, [req]);

  const showNotification = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const fetchHistory = useCallback(() => {
    const requestId = req.id || req.requestId; 
    if (requestId) {
        setLoadingHistory(true);
        fetch(`${API_BASE}/requests/${requestId}/history`)
            .then(res => res.ok ? res.json() : { items: [] })
            .then(data => setHistoryItems(data.items || []))
            .catch(err => { console.warn("History Error:", err); setHistoryItems([]); })
            .finally(() => setLoadingHistory(false));
    }
  }, [req]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]); 

  const mockDetail = (() => {
      const t = req.requestType.toLowerCase();
      if(t.includes('leave')) return { type: "Paid Leave", date: `${formatDate(req.effectiveDate)}`, reason: "Personal Issue", note: "Handover: Nguyen Van A", fileName: "Medical_Report.pdf", fileUrl: "#" };
      if(t.includes('overtime')) return { type: "Overtime", date: `${formatDate(req.effectiveDate)}`, reason: "Urgent Project", note: "Project: X (3h)" };
      return { type: "Resignation", date: `${formatDate(req.effectiveDate)}`, reason: "Career Change", note: "Asset Handover Completed" };
  })();

  const initiateAction = (type) => {
      if (type === 'REJECTED' && !rejectReason.trim()) {
          showNotification("Please enter a rejection reason!", "error");
          return;
      }
      setConfirmAction({ show: true, type });
  };

  const executeFinalAction = async () => {
      setConfirmAction({ ...confirmAction, show: false });
      const status = confirmAction.type;
      const requestId = req.id || req.requestId;
      const token = localStorage.getItem('token'); 

      if (!requestId) { showNotification("Request ID not found!", "error"); return; }
      if (!token) { showNotification("You are not logged in!", "error"); return; }

      setProcessing(true);

      const url = `${API_BASE}/${typeConfig.apiApprovePath}/${requestId}/approval`;
      const payload = {
          "new_status": status,
          "reject_reason": status === 'REJECTED' ? rejectReason : "string",
          "Employee_ID": 1 
      };

      try {
          const response = await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(payload)
          });

          if (response.ok) {
              const data = await response.json();
              showNotification(data.message || `Success! Request marked as ${status}`, "success");
              setProcessing(false);
              setCurrentStatus(status);
              fetchHistory();
              setShowRejectBox(false);
              onRefresh();
          } else {
              const errText = await response.text();
              showNotification(`Error: ${errText || "Operation failed"}`, "error");
              setProcessing(false);
          }
      } catch (error) {
          console.error("Network Error:", error);
          showNotification("Server connection error.", "error");
          setProcessing(false);
      }
  };

  const renderTimeline = () => {
    const createdLog = historyItems.find(x => x.status === 'CREATED');
    const decisionLog = historyItems.find(x => x.status === 'APPROVED' || x.status === 'REJECTED');
    const isPending = !decisionLog;

    return (
        <div className="timeline">
            <div className="timeline-item">
                <div className={`timeline-dot ${isPending ? 'pending-empty' : (decisionLog?.status === 'APPROVED' ? 'approved' : 'rejected')}`}></div>
                <div className="history-content">
                    {decisionLog ? (
                        <>
                            <div className="status" style={{color: decisionLog.status==='APPROVED'?'#16a34a':'#dc2626'}}>{decisionLog.status}</div>
                            <div className="actor">By: <b>{decisionLog.full_Name}</b> ({decisionLog.employee_Id})</div>
                            <div className="date">{formatDate(decisionLog.time)}</div>
                        </>
                    ) : ( <div className="status" style={{color:'#94a3b8'}}>Pending Decision</div> )}
                </div>
            </div>
            <div className="timeline-item"><div className={`timeline-dot ${isPending?'pending':'done'}`}></div><div className="history-content"><div className="status" style={{color:isPending?'#d97706':'#64748b'}}>{isPending?'Pending Approval':'Processed'}</div><div className="actor">System Processing</div><div className="date">--</div></div></div>
            <div className="timeline-item"><div className="timeline-dot active"></div><div className="history-content"><div className="status">Request Created</div><div className="actor">By: <b>{createdLog?createdLog.full_Name:req.employee?.fullName}</b></div><div className="date">{createdLog?formatDate(createdLog.time):'--'}</div></div></div>
        </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-drawer">
        {toast && <div className={`toast-notification ${toast.type}`}>{toast.type === 'success' ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}<span>{toast.message}</span></div>}
        
        <div className="drawer-header"><h3>Request Details #{req.requestCode}</h3><button onClick={onClose} className="btn-close"><XCircle size={24}/></button></div>
        <div className="drawer-body">
            <div className="info-box user-box"><div className="avatar-med">{req.employee?.fullName?.charAt(0)}</div><div><b>{req.employee?.fullName}</b><div className="sub-text">{req.employee?.departmentName}</div></div></div>
            <div className="section-title"><FileText size={18}/> Information (Mock)</div>
            <div className="info-box">
                <div className="info-row"><span className="info-label">Type</span><span className="info-val">{mockDetail.type}</span></div>
                <div className="info-row"><span className="info-label">Date</span><span className="info-val">{mockDetail.date}</span></div>
                <div className="info-row"><span className="info-label">Reason</span><span className="info-val">{mockDetail.reason}</span></div>
                <div className="info-row"><span className="info-label">Note</span><span className="info-val">{mockDetail.note}</span></div>
                {mockDetail.fileName && (<div className="info-row"><span className="info-label">Attachment</span><span className="info-val"><a href={mockDetail.fileUrl} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'5px',textDecoration:'none',color:'#2563eb'}}><Paperclip size={14}/> {mockDetail.fileName}</a></span></div>)}
            </div>
            <div className="section-title"><Clock size={18}/> Process History</div>
            <div className="info-box bg-gray">{loadingHistory ? <p className="text-center" style={{color:'#64748b'}}>Loading history...</p> : renderTimeline()}</div>
        </div>
        
        {currentStatus?.toUpperCase() === 'PENDING' ? (
             <div className="drawer-footer">
                {!showRejectBox ? (
                    <div className="btn-group">
                        <button className="btn-action btn-reject" onClick={() => setShowRejectBox(true)}><XCircle size={18}/> Reject</button>
                        <button className="btn-action btn-approve" onClick={() => initiateAction('APPROVED')} disabled={processing}>{processing ? 'Processing...' : <><CheckCircle size={18}/> Approve</>}</button>
                    </div>
                ) : (
                    <div className="reject-box">
                        <label>Rejection Reason <span style={{color:'red'}}>*</span></label>
                        <textarea rows="3" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter reason..."/>
                        <div className="btn-group">
                            <button className="btn-action btn-cancel" onClick={() => setShowRejectBox(false)}>Cancel</button>
                            <button className="btn-action btn-confirm-reject" onClick={() => initiateAction('REJECTED')}>Confirm</button>
                        </div>
                    </div>
                )}
             </div>
        ) : ( <div className="drawer-footer text-center"><span style={{fontWeight:600, color: currentStatus?.toUpperCase()==='APPROVED'?'#16a34a':'#dc2626'}}>Request is {currentStatus}</span></div> )}
      </div>

      <ConfirmDialog 
          isOpen={confirmAction.show}
          title={confirmAction.type === 'APPROVED' ? "Approve Request?" : "Reject Request?"}
          message={`Are you sure you want to ${confirmAction.type === 'APPROVED' ? 'approve' : 'reject'} this request?`}
          onConfirm={executeFinalAction}
          onCancel={() => setConfirmAction({ ...confirmAction, show: false })}
          type={confirmAction.type === 'REJECTED' ? 'danger' : 'info'}
      />
    </div>
  );
};