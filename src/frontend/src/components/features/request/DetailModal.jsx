import React, { useEffect, useState, useCallback } from "react";
import { Clock, CheckCircle, XCircle, FileText, Paperclip, AlertTriangle, ExternalLink, Briefcase, Calendar } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog';

const API_BASE = "/api/v1"; 
const BACKEND_DOMAIN = "http://localhost:5291"; 

const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return "--";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "--";
        date.setTime(date.getTime() + 7 * 60 * 60 * 1000);
        
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.hour12 = false;
        }
        return date.toLocaleString('en-GB', options);
    } catch { return "--"; }
};

const getAttachmentUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("https")) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${BACKEND_DOMAIN}/${cleanPath}`;
};

// Normalize various possible timestamp fields returned by different APIs
const getLogTime = (log) => {
    if (!log) return null;
    return log.time || log.timeStamp || log.timestamp || log.approvedAt || log.decidedAt || log.createdAt || log.time_approved || null;
};

const DetailModal = ({ req, typeConfig, onClose, onRefresh }) => {
  const [detailData, setDetailData] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(req.status);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState({ show: false, type: null });

  const currentEmployeeId = parseInt(localStorage.getItem("employeeId") || "1");

  useEffect(() => { setCurrentStatus(req.status); }, [req]);

  const showNotification = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  // 1. Fetch History
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

  // 2. Fetch Detail
  useEffect(() => {
    fetchHistory();
    setDetailData(null);
    setLoadingDetail(true);

    const requestId = req.id || req.requestId;

    let url = "";
    const type = req.requestType?.toLowerCase() || "";

    if (type.includes('leave')) {
        url = `${API_BASE}/manager/leave-requests/${requestId}`;
    } else if (type.includes('overtime') || type === 'ot') {
        url = `${API_BASE}/getdetail-overtime-requests/${requestId}`;
    } else if (type.includes('resignation')) {
        url = `${API_BASE}/getdetail-resignation-requests/${requestId}`;
    }

    if (url) {
        fetch(url)
            .then(res => res.ok ? res.json() : null)
            .then(data => setDetailData(data))
            .catch(console.error)
            .finally(() => setLoadingDetail(false));
    } else {
        setLoadingDetail(false);
    }
  }, [req, fetchHistory]); 


  // 3. Logic Approve/Reject
  const initiateAction = (type) => {
      if (type === 'REJECTED' && !rejectReason.trim()) {
          showNotification("Please enter a reason for rejection!", "error");
          return;
      }
      setConfirmAction({ show: true, type });
  };

  const executeFinalAction = async () => {
      setConfirmAction({ ...confirmAction, show: false });
      const status = confirmAction.type;
      const requestId = req.id || req.requestId;
      const token = localStorage.getItem('token'); 

      if (!requestId) return;
      setProcessing(true);

      const url = `${API_BASE}/${typeConfig.apiApprovePath}/${requestId}/approval`;

      const payload = {
          "Status": status,
          "RejectReason": status === 'REJECTED' ? rejectReason : "",
          "Employee_ID": currentEmployeeId 
      };

      try {
          const response = await fetch(url, {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json', 
                ...(token && { 'Authorization': `Bearer ${token}` })
              },
              body: JSON.stringify(payload)
          });

          if (response.ok) {
              await response.json(); 
              const message = status === 'APPROVED' 
                ? `✓ Request Approved - ${req.employee?.fullName}'s ${req.requestType} request has been approved.`
                : `✗ Request Rejected - ${req.employee?.fullName}'s ${req.requestType} request has been rejected.`;
              showNotification(message, status === 'APPROVED' ? 'success' : 'error');
              setProcessing(false);
              setCurrentStatus(status);
              setShowRejectBox(false);
              fetchHistory();
              if (onRefresh) onRefresh();
          } else {
              const errText = await response.text();
              showNotification(errText || "Operation failed", "error");
              setProcessing(false);
          }
      } catch (error) {
          console.error("Network Error:", error);
          showNotification("Server connection error.", "error");
          setProcessing(false);
      }
  };

  // 4. Render UI
  const renderDetailInfo = () => {
      if (loadingDetail) return <p style={{color:'#64748b', fontStyle:'italic', padding:'10px'}}>Loading details...</p>;
      if (!detailData) return <p style={{color:'#64748b', padding:'10px'}}>No detail data available.</p>;

      const type = req.requestType?.toLowerCase() || "";

      // CASE 1: LEAVE [ĐÃ SỬA: Cập nhật cách đọc attachment]
      if (type.includes('leave')) {
          // Lấy đúng trường "attachment" từ API response (dựa theo ảnh image_74412b.png)
          const rawPath = detailData.attachment || detailData.attachmentPath || detailData.AttachmentPath;
          const fileUrl = getAttachmentUrl(rawPath);
          
          // Lấy tên file từ đường dẫn để hiển thị (ví dụ: file.pdf)
          const fileName = rawPath ? rawPath.split('/').pop() : "View Document";

          return (
            <div className="info-box">
                <div className="info-row"><span className="info-label">Leave Type</span><span className="info-val fw-600">{detailData.leaveType}</span></div>
                <div className="info-row"><span className="info-label">Duration</span><span className="info-val">{formatDate(detailData.startDate)} - {formatDate(detailData.endDate)}</span></div>
                <div className="info-row"><span className="info-label">Remaining Days</span><span className="info-val highlight">{detailData.remainingLeaveDays} days</span></div>
                <div className="info-row"><span className="info-label">Reason</span><span className="info-val">{detailData.reason}</span></div>
                <div className="info-row"><span className="info-label">Handover To</span><span className="info-val">{detailData.handoverPersonName || "--"}</span></div>
                
                <div className="info-row" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                    <span className="info-label" style={{ alignSelf: 'center', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px' }}>
                        <Paperclip size={16}/> Attachment
                    </span>
                    <span className="info-val">
                        {rawPath ? (
                            <a href={fileUrl} target="_blank" rel="noreferrer" 
                                style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', transition: 'all 0.2s', maxWidth: '100%' }}>
                                <FileText size={16} style={{ marginRight: '6px', color:'#3b82f6', flexShrink: 0 }}/> 
                                <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px'}} title={fileName}>
                                    {fileName}
                                </span>
                                <ExternalLink size={14} style={{ marginLeft: '6px', opacity: 0.5, flexShrink: 0 }}/>
                            </a>
                        ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No attachment</span>
                        )}
                    </span>
                </div>
            </div>
          );
      }

      // CASE 2: OVERTIME
      if (type.includes('overtime') || type === 'ot') {
        return (
            <div className="info-box">
                <div className="info-row"><span className="info-label">Project</span><span className="info-val fw-600" style={{color:'#d97706'}}><Briefcase size={14} style={{marginRight:'5px'}}/> {detailData.project}</span></div>
                <div className="info-row"><span className="info-label">OT Date</span><span className="info-val">{formatDate(detailData.otDate)}</span></div>
                <div className="info-row">
                    <span className="info-label">Time Schedule</span>
                    <span className="info-val fw-600">
                        {detailData.startTime} - {detailData.endTime} 
                        <span style={{marginLeft:'8px', fontWeight:'normal', color:'#64748b'}}>({detailData.totalHours} hours)</span>
                    </span>
                </div>
                <div className="info-row"><span className="info-label">OT Reason</span><span className="info-val">{detailData.reason}</span></div>
            </div>
        );
      }

      // CASE 3: RESIGNATION
      if (type.includes('resignation')) {
        return (
            <div className="info-box">
                <div className="info-row">
                    <span className="info-label">Last Working Day</span>
                    <span className="info-val fw-600" style={{color:'#dc2626'}}><Calendar size={14} style={{marginRight:'5px'}}/> {formatDate(detailData.lastWorkingDate)}</span>
                </div>
                <div className="info-row"><span className="info-label">Resignation Reason</span><span className="info-val">{detailData.reason}</span></div>
            </div>
        );
      }

      return null;
  };

  const renderTimeline = () => {
    const decisionLog = historyItems.find(x => x.status === 'APPROVED' || x.status === 'REJECTED');
    const createdLog = historyItems.find(x => x.status === 'CREATED');
    const isPending = currentStatus === 'PENDING';

    return (
        <div className="timeline">
            {/* 1. Decision Node */}
            <div className="timeline-item">
                <div className={`timeline-dot ${isPending ? 'pending-empty' : (decisionLog?.status === 'APPROVED' ? 'approved' : 'rejected')}`}></div>
                <div className="history-content">
                    {decisionLog ? (
                        <>
                            <div className="status" style={{color: decisionLog.status==='APPROVED'?'#16a34a':'#dc2626'}}>
                                {decisionLog.status}
                            </div>
                            <div className="actor">By: <b>{decisionLog.full_Name}</b> ({decisionLog.employee_Id})</div>
                            <div className="date">{formatDate(getLogTime(decisionLog), true)}</div>
                        </>
                    ) : (
                        <div className="status" style={{color:'#94a3b8', fontStyle:'italic'}}>Waiting for decision...</div>
                    )}
                </div>
            </div>
            
            {/* 2. Processing Node */}
            <div className="timeline-item">
                <div className={`timeline-dot ${isPending ? 'pending' : 'active'}`}></div>
                <div className="history-content">
                    <div className="status" style={{color: isPending ? '#d97706' : '#64748b'}}>
                        {isPending ? 'Processing' : 'Processed'}
                    </div>
                    <div className="actor">System</div>
                </div>
            </div>

            {/* 3. Created Node */}
            <div className="timeline-item">
                <div className="timeline-dot active"></div>
                <div className="history-content">
                    <div className="status">Request Created</div>
                    <div className="actor">
                        By: <b>{createdLog ? createdLog.full_Name : req.employee?.fullName}</b>
                        <span style={{ marginLeft: '6px', color: '#64748b', fontSize: '0.9em', fontWeight: 'normal' }}>
                            ({createdLog ? createdLog.employee_Id : req.employee?.id})
                        </span>
                    </div>
                    <div className="date">{createdLog ? formatDate(getLogTime(createdLog), true) : formatDate(req.submittedDate)}</div>
                </div>
            </div>
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
        
        <div className="drawer-header">
            <h3>Request #{req.requestCode}</h3>
            <button onClick={onClose} className="btn-close"><XCircle size={24}/></button>
        </div>
        
        <div className="drawer-body">
            <div className="info-box user-box">
                <div className="avatar-med">{req.employee?.fullName?.charAt(0)}</div>
                <div>
                    <b>{req.employee?.fullName}</b>
                    <div className="sub-text">{req.employee?.departmentName} • ID: {req.employee?.id}</div>
                </div>
            </div>

            <div className="section-title"><FileText size={18}/> Information</div>
            {renderDetailInfo()}

            <div className="section-title"><Clock size={18}/> Process History</div>
            <div className="info-box bg-gray">
                {loadingHistory ? <p className="text-center" style={{fontSize:'0.9rem'}}>Loading history...</p> : renderTimeline()}
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
                        <label>Reason for rejection <span style={{color:'red'}}>*</span></label>
                        <textarea rows="3" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter rejection reason..."/>
                        <div className="btn-group">
                            <button className="btn-action btn-cancel" onClick={() => setShowRejectBox(false)}>Cancel</button>
                            <button className="btn-action btn-confirm-reject" onClick={() => initiateAction('REJECTED')}>Confirm Reject</button>
                        </div>
                    </div>
                )}
             </div>
        ) : ( 
            <div className="drawer-footer text-center">
                <span className={`status-text ${currentStatus?.toLowerCase()}`}>
                    Request is {currentStatus}
                </span>
            </div> 
        )}
      </div>
      
      <ConfirmDialog
  isOpen={confirmAction.show}
  title={null}   // hoặc ""
  message={`Are you sure you want to ${
    confirmAction.type === "APPROVED" ? "approve" : "reject"
  } this request?`}
  onConfirm={executeFinalAction}
  onCancel={() =>
    setConfirmAction((p) => ({ ...p, show: false }))
  }
  type={confirmAction.type === "REJECT" ? "danger" : "info"}
/>
    </div>
  );
};
export default DetailModal;