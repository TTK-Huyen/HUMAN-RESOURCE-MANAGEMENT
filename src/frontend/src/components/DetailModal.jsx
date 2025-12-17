import React, { useEffect, useState, useCallback } from "react";
import { Clock, CheckCircle, XCircle, FileText, Paperclip, AlertTriangle, ExternalLink } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const API_BASE = "/api/v1";
const BACKEND_DOMAIN = "https://localhost:7229"; 

// 👇 [CẬP NHẬT MỚI] Cộng thủ công 7 tiếng vào giờ gốc
const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "--";

        // Cộng thêm 7 giờ (7 * 60 * 60 * 1000 milliseconds)
        date.setTime(date.getTime() + 7 * 60 * 60 * 1000);

        return date.toLocaleString('en-GB', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: false 
        });
    } catch { return "--"; }
};

const getAttachmentUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("https")) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${BACKEND_DOMAIN}/${cleanPath}`;
};

const DetailModal = ({ req, typeConfig, onClose, onRefresh }) => {
  const [detailData, setDetailData] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // UI States
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

  useEffect(() => {
    fetchHistory();
    const requestId = req.id || req.requestId;
    if (req.requestType.toLowerCase().includes('leave')) {
        fetch(`${API_BASE}/leave-requests/${requestId}`)
            .then(res => res.ok ? res.json() : null)
            .then(setDetailData)
            .catch(console.error);
    }
  }, [req, fetchHistory]); 

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
          "reject_reason": status === 'REJECTED' ? rejectReason : "",
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
    const isPending = currentStatus === 'PENDING';

    return (
        <div className="timeline">
            <div className="timeline-item">
                <div className={`timeline-dot ${isPending ? 'pending-empty' : (decisionLog?.status === 'APPROVED' ? 'approved' : 'rejected')}`}></div>
                <div className="history-content">
                    {decisionLog ? (
                        <>
                            <div className="status" style={{color: decisionLog.status==='APPROVED'?'#16a34a':'#dc2626'}}>
                                {decisionLog.status}
                            </div>
                            <div className="actor">
                                By: <b>{decisionLog.full_Name}</b> <span>({decisionLog.employee_Id})</span>
                            </div>
                            <div className="date">{formatDate(decisionLog.time)}</div>
                        </>
                    ) : (
                        <div className="status" style={{color:'#94a3b8', fontStyle:'italic'}}>
                            Waiting for decision...
                        </div>
                    )}
                </div>
            </div>
            <div className="timeline-item">
                <div className={`timeline-dot ${isPending ? 'pending' : 'active'}`}></div>
                <div className="history-content">
                    <div className="status" style={{color: isPending ? '#d97706' : '#64748b'}}>
                        {isPending ? 'Pending Approval' : 'Processed'}
                    </div>
                    <div className="actor">System Processing</div>
                    <div className="date">--</div>
                </div>
            </div>
            <div className="timeline-item">
                <div className="timeline-dot active"></div>
                <div className="history-content">
                    <div className="status">Request Created</div>
                    <div className="actor">
                        By: <b>{createdLog ? createdLog.full_Name : req.employee?.fullName}</b>
                        <span style={{marginLeft: '4px', color: '#64748b'}}>
                            ({createdLog ? createdLog.employee_Id : req.employee?.id})
                        </span>
                    </div>
                    <div className="date">
                        {createdLog ? formatDate(createdLog.time) : formatDate(req.submittedDate)}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderDetailInfo = () => {
      if (req.requestType.toLowerCase().includes('leave') && detailData) {
          const rawPath = detailData.attachmentPath || detailData.AttachmentPath;
          const fileUrl = getAttachmentUrl(rawPath);

          return (
            <div className="info-box">
                <div className="info-row"><span className="info-label">Leave Type</span><span className="info-val">{detailData.leaveType}</span></div>
                <div className="info-row"><span className="info-label">Duration</span><span className="info-val">{formatDate(detailData.startDate)} - {formatDate(detailData.endDate)}</span></div>
                <div className="info-row"><span className="info-label">Remaining Days</span><span className="info-val highlight">{detailData.remainingLeaveDays} days</span></div>
                <div className="info-row"><span className="info-label">Handover To</span><span className="info-val">{detailData.handoverPersonName || "--"}</span></div>
                <div className="info-row"><span className="info-label">Reason</span><span className="info-val">{detailData.reason}</span></div>
                
                <div className="info-row" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                    <span className="info-label" style={{ alignSelf: 'center', fontWeight: 'bold' }}>Attachment</span>
                    <span className="info-val">
                        {rawPath ? (
                            <a href={fileUrl} target="_blank" rel="noreferrer" 
                                style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', color: '#1e40af', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                                <Paperclip size={18} style={{ marginRight: '8px' }}/> View Document <ExternalLink size={14} style={{ marginLeft: '8px', opacity: 0.7 }}/>
                            </a>
                        ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No attachment</span>
                        )}
                    </span>
                </div>
            </div>
          );
      }
      return (
          <div className="info-box">
             <div className="info-row"><span className="info-label">Type</span><span className="info-val">{req.requestType}</span></div>
             <div className="info-row"><span className="info-label">Effective Date</span><span className="info-val">{formatDate(req.effectiveDate)}</span></div>
             <div className="info-row"><span className="info-label">Decided At</span><span className="info-val">{formatDate(req.decidedAt)}</span></div>
          </div>
      );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-drawer">
        {toast && <div className={`toast-notification ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
            <span>{toast.message}</span>
        </div>}
        <div className="drawer-header"><h3>Request #{req.requestCode}</h3><button onClick={onClose} className="btn-close"><XCircle size={24}/></button></div>
        <div className="drawer-body">
            <div className="info-box user-box"><div className="avatar-med">{req.employee?.fullName?.charAt(0)}</div><div><b>{req.employee?.fullName}</b><div className="sub-text">{req.employee?.departmentName}</div></div></div>
            <div className="section-title"><FileText size={18}/> Information</div>
            {renderDetailInfo()}
            <div className="section-title"><Clock size={18}/> Process History</div>
            <div className="info-box bg-gray">
                {loadingHistory ? <p className="text-center" style={{color:'#64748b'}}>Loading history...</p> : renderTimeline()}
            </div>
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
                        <div className="btn-group"><button className="btn-action btn-cancel" onClick={() => setShowRejectBox(false)}>Cancel</button><button className="btn-action btn-confirm-reject" onClick={() => initiateAction('REJECTED')}>Confirm</button></div>
                    </div>
                )}
             </div>
        ) : ( 
            <div className="drawer-footer text-center"><span style={{fontWeight:600, color: currentStatus?.toUpperCase()==='APPROVED'?'#16a34a':'#dc2626'}}>Request is {currentStatus}</span></div> 
        )}
      </div>
      <ConfirmDialog isOpen={confirmAction.show} title={confirmAction.type === 'APPROVED' ? "Approve Request?" : "Reject Request?"} message={`Are you sure you want to ${confirmAction.type === 'APPROVED' ? 'approve' : 'reject'} this request?`} onConfirm={executeFinalAction} onCancel={() => setConfirmAction({ ...confirmAction, show: false })} type={confirmAction.type === 'REJECTED' ? 'danger' : 'info'} />
    </div>
  );
};
export default DetailModal;