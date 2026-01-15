import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Clock, Check, X } from "lucide-react";
import { HRService } from "../../Services/employees.js";
import Loading from "../../components/common/Loading";
import Button from "../../components/common/Button";

// --- SUB-COMPONENTS ---

const FieldChange = ({ fieldName, oldValue, newValue }) => (
  <div className="mb-4 pb-4 border-b border-slate-100 last:border-b-0">
    <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
      {fieldName}
    </div>
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="text-xs text-slate-500 mb-1">Old Value:</div>
        <div className="text-base font-medium text-slate-800 bg-red-50 px-3 py-2 rounded border border-red-200">
          {oldValue || <span className="text-slate-400 italic">--</span>}
        </div>
      </div>
      <div className="text-slate-400">→</div>
      <div className="flex-1">
        <div className="text-xs text-slate-500 mb-1">New Value:</div>
        <div className="text-base font-medium text-slate-800 bg-green-50 px-3 py-2 rounded border border-green-200">
          {newValue || <span className="text-slate-400 italic">--</span>}
        </div>
      </div>
    </div>
  </div>
);

const StatusBadgeDetail = ({ status, reviewedAt, reviewedBy }) => {  const getStatusColor = () => {
    switch(status) {
      case 'PENDING': return { bg: '#fef3c7', color: '#92400e', text: 'Pending', icon: Clock };
      case 'APPROVED': return { bg: '#dcfce7', color: '#166534', text: 'Approved', icon: CheckCircle };
      case 'REJECTED': return { bg: '#fee2e2', color: '#991b1b', text: 'Rejected', icon: XCircle };
      default: return { bg: '#f1f5f9', color: '#475569', text: 'Unknown', icon: AlertCircle };
    }
  };
  
  const statusInfo = getStatusColor();
  const IconComponent = statusInfo.icon;
  
  return (
    <div style={{ background: statusInfo.bg, color: statusInfo.color, padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <IconComponent size={20} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{statusInfo.text}</span>
      </div>      {reviewedAt && (
        <div style={{ fontSize: '0.85rem', marginTop: '8px' }}>
          <div>Reviewed by: <span style={{ fontWeight: 500 }}>{reviewedBy || '--'}</span></div>
          <div>At: <span style={{ fontWeight: 500 }}>{new Date(reviewedAt).toLocaleString('en-US')}</span></div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function HrProfileUpdateRequestDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [requestDetail, setRequestDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  useEffect(() => {
    const fetchRequestDetail = async () => {
      setLoading(true);
      setError(null);      try {
        if (!requestId) throw new Error("Cannot find request ID in URL");

        console.log("Fetching request detail for ID:", requestId);
        const response = await HRService.getRequestDetail(requestId);
        console.log("API Response:", response);

        let detailData = null;

        if (response && response.data) {
          detailData = response.data;        } else {
          detailData = response;
        }

        if (detailData) {
          setRequestDetail(detailData);
        } else {
          throw new Error("Request data is empty or in incorrect format");
        }
      } catch (err) {
        console.error("Error loading request detail:", err);
        setError(err.message || "Could not load profile update request information.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetail();
  }, [requestId]);  // -- Handle Approve Request --
  const handleApproveRequest = async () => {
    setApprovingId(requestDetail?.request_id);
    try {
      const payload = {
        Status: 'Approved',
        Employee_ID: requestDetail?.employee_id
      };
      await HRService.updateRequestStatus(requestDetail?.request_id, payload);
      setRequestDetail(prev => prev ? { ...prev, request_status: 'APPROVED' } : null);
      alert("Request approved successfully!");
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request: " + (error.response?.data?.message || error.message));
    } finally {
      setApprovingId(null);
    }
  };  // -- Handle Reject Request --
  const handleRejectRequest = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason!");
      return;
    }
    
    setApprovingId(requestDetail?.request_id);
    try {
      const payload = {
        Status: 'Rejected',
        RejectReason: rejectReason.trim(),
        Employee_ID: requestDetail?.employee_id
      };
      await HRService.updateRequestStatus(requestDetail?.request_id, payload);
      setRequestDetail(prev => prev ? { ...prev, request_status: 'REJECTED', reject_reason: rejectReason.trim() } : null);
      setShowRejectModal(false);
      setRejectReason("");
      alert("Request rejected successfully!");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request: " + (error.response?.data?.message || error.message));
    } finally {
      setApprovingId(null);
    }
  };// --- Render ---
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
        <Loading text="Loading request details..." />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #fee2e2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <AlertCircle size={32} style={{ color: '#dc2626' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#991b1b', margin: 0 }}>Error</h2>
        </div>
        <p style={{ color: '#7f1d1d', marginBottom: '20px' }}>{error}</p>
        <button 
          onClick={() => navigate(-1)}
          style={{ color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.95rem' }}
        >
          ← Back
        </button>
      </div>
    </div>
  );

  if (!requestDetail) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px', fontFamily: 'sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header & Back Button */}
        <button 
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '24px', fontSize: '0.95rem', fontWeight: 500 }}
        >
          <ArrowLeft size={18} /> Back to list
        </button>

        {/* Main Card */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          
          {/* Header Section */}
          <div style={{ padding: '32px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(to right, #3b82f6, #6366f1)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                {requestDetail.employee_name?.charAt(0) || 'E'}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', margin: '0 0 8px 0' }}>
                  {requestDetail.employee_name}
                </h1>              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', marginBottom: '12px' }}>
                  Employee ID: <span style={{ fontWeight: 600 }}>{requestDetail.employee_code}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div style={{ padding: '32px' }}>
            
            {/* Status Badge */}
            <StatusBadgeDetail 
              status={requestDetail.request_status}
              reviewedAt={requestDetail.reviewed_at}
              reviewedBy={requestDetail.reviewed_by}
            />            {/* Request Info */}
            <div style={{ marginBottom: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Request Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: '#64748b', marginBottom: '4px' }}>Request Date</div>
                  <div style={{ fontWeight: 500, color: '#0f172a' }}>
                    {requestDetail.request_date ? new Date(requestDetail.request_date).toLocaleString('en-US') : '--'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b', marginBottom: '4px' }}>Request ID</div>
                  <div style={{ fontWeight: 500, color: '#0f172a' }}>{requestDetail.request_id}</div>
                </div>
              </div>
              {requestDetail.comment && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', marginBottom: '4px' }}>Notes</div>
                  <div style={{ fontWeight: 500, color: '#0f172a' }}>{requestDetail.comment}</div>
                </div>
              )}
              {requestDetail.reject_reason && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#991b1b', marginBottom: '4px', fontWeight: 600 }}>Rejection Reason</div>
                  <div style={{ color: '#7f1d1d' }}>{requestDetail.reject_reason}</div>
                </div>
              )}
            </div>            {/* Changes Section */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Changes
              </h3>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {requestDetail.details && requestDetail.details.length > 0 ? (
                  requestDetail.details.map((detail, idx) => (
                    <FieldChange
                      key={idx}
                      fieldName={detail.field_name}
                      oldValue={detail.old_value}
                      newValue={detail.new_value}
                    />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                    No changes
                  </div>
                )}
              </div>
            </div>
          </div>          {/* Footer Actions - Always Show */}
          <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={requestDetail.request_status !== 'PENDING' || approvingId === requestDetail.request_id}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: requestDetail.request_status === 'PENDING' ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                color: requestDetail.request_status === 'PENDING' ? '#dc2626' : '#cbd5e1',
                background: 'transparent',
                fontWeight: 500,
                cursor: requestDetail.request_status === 'PENDING' ? 'pointer' : 'not-allowed',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                opacity: requestDetail.request_status === 'PENDING' ? (approvingId === requestDetail.request_id ? 0.5 : 1) : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}              onMouseEnter={(e) => requestDetail.request_status === 'PENDING' && !e.target.disabled && (e.target.style.background = '#fee2e2')}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
              title={requestDetail.request_status === 'PENDING' ? 'Reject request' : 'Can only reject a request when status is Pending'}
            >
              <X size={18} />
              Reject
            </button>
            <button
              onClick={handleApproveRequest}
              disabled={requestDetail.request_status !== 'PENDING' || approvingId === requestDetail.request_id}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: requestDetail.request_status === 'PENDING' ? '#16a34a' : '#cbd5e1',
                color: 'white',
                fontWeight: 500,
                cursor: requestDetail.request_status === 'PENDING' ? 'pointer' : 'not-allowed',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                opacity: requestDetail.request_status === 'PENDING' ? (approvingId === requestDetail.request_id ? 0.5 : 1) : 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => requestDetail.request_status === 'PENDING' && !e.target.disabled && (e.target.style.background = '#15803d')}
              onMouseLeave={(e) => requestDetail.request_status === 'PENDING' && (e.target.style.background = '#16a34a')}
              title={requestDetail.request_status === 'PENDING' ? 'Approve request' : 'Can only approve a request when status is Pending'}
            >
              <Check size={18} />
              {approvingId === requestDetail.request_id ? 'Processing...' : 'Approve'}
            </button>
          </div></div>
      </div>

      {/* Reject Modal */}      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            {/* Modal Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
                Reject Request
              </h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                Please provide a reason for rejecting this profile update request.
              </p>
            </div>

            {/* Modal Content */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>
                Rejection Reason <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
                {rejectReason.length} / 500 characters
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                disabled={approvingId === requestDetail?.request_id}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  background: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={!rejectReason.trim() || approvingId === requestDetail?.request_id}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !rejectReason.trim() ? '#cbd5e1' : '#dc2626',
                  color: 'white',
                  fontWeight: 500,
                  cursor: !rejectReason.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  opacity: approvingId === requestDetail?.request_id ? 0.7 : 1
                }}
                onMouseEnter={(e) => !e.target.disabled && (e.target.style.background = '#b91c1c')}
                onMouseLeave={(e) => !e.target.disabled && (e.target.style.background = '#dc2626')}
              >
                {approvingId === requestDetail?.request_id ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}