import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchCampaignDetail, registerCampaign, getRegistrationStatus } from "../../../Services/campaigns";
import Loading from "../../../components/common/Loading";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import Toast from "../../../components/common/Toast";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { ArrowLeft, Calendar, Users, Info } from 'lucide-react';

export default function CampaignDetail() {
  const { id: campaignCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const role = (localStorage.getItem("role") || "").toUpperCase();

    // fallback nếu user vào thẳng URL (không có state.from)
    const fallback = role === "HR" ? "/hr/campaigns" : "/employee/campaigns";

    navigate(location.state?.from || fallback);
  };
  const [campaign, setCampaign] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [toast, setToast] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const detail = await fetchCampaignDetail(campaignCode);
        if (!mounted) return;
        setCampaign(detail);

        // Check registration status for current employee
        const employeeCode = localStorage.getItem('employeeCode') || '';
        if (employeeCode) {
          try {
            const st = await getRegistrationStatus(campaignCode, employeeCode);
            if (!mounted) return;
            setIsRegistered(Boolean(st?.registered));
            setRegistrationInfo(st ?? null);
          } catch (e) {
            // ignore status check error
          }
        }
      } catch (err) {
        if (!mounted) return;
        setCampaign(null);
      }
    })();

    return () => { mounted = false; };
  }, [campaignCode]);

  const fmt = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleString('en-GB'); } catch { return d; }
  };

  if (!campaign) return <Loading fullScreen text="Loading campaign details..." />;

  const max = campaign.maxParticipants;
  const current = campaign.currentParticipants ?? 0;
  const percent = max ? Math.min(100, Math.round((current / max) * 100)) : null;
  const isFull = max ? current >= max : false;
  const handleRegister = async () => {
    if (isFull) return;
    // Show confirmation dialog instead of registering immediately
    setShowConfirmDialog(true);
  };

  const handleConfirmRegister = async () => {
    setShowConfirmDialog(false);
    setIsRegistering(true);
    try {
      const res = await registerCampaign(campaign.campaignCode);
      // Show success toast (use message from response when available)
      const msg = res?.message || 'Registered successfully.';
      setToast({ type: 'success', message: msg });
      // Refresh detail to reflect new participant count
      const updated = await fetchCampaignDetail(campaign.campaignCode);
      setCampaign(updated);
      // mark registered
      setIsRegistered(true);
      // update registrationInfo if response contains it
      if (res?.registrationDate || res?.Status || res?.status) {
        setRegistrationInfo(res);
      }
    } catch (ex) {
      const errMsg = ex?.response?.data?.message || ex?.message || 'Registration failed. Please try again.';
      setToast({ type: 'error', message: errMsg });
    } finally {
      setIsRegistering(false);
    }
  };
  return (
    <div style={{ maxWidth: 900, margin: '24px auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirm registration"
        message={`Are you sure you want to register for campaign "${campaign?.campaignName}"?`}
        warningMessage="Note: To cancel later, HR approval is required."
        confirmLabel="Register"
        cancelLabel="Cancel"
        type="info"
        onConfirm={handleConfirmRegister}
        onCancel={() => setShowConfirmDialog(false)}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "#334155",
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <StatusBadge status={campaign.status} />
          <Button
            className="detail-register-btn"
            variant={isRegistered ? 'secondary' : 'primary'}
            onClick={handleRegister}
            disabled={Boolean(isRegistered || isFull)}
            isLoading={isRegistering}
          >
            {isRegistered ? 'Registered' : (isFull ? 'Full' : 'Register')}
          </Button>
          <style>{`.detail-register-btn:hover { transform: translateY(-2px); } .detail-register-btn:disabled { opacity: 0.75; cursor: not-allowed; }`}</style>
        </div>
      </div>

        <div style={{ marginBottom: 6 }}>
        <h1 style={{ margin: 0, color: '#0b1220', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{campaign.campaignName}</h1>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Campaign code:</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>{campaign.campaignCode}</span>
        </div>
      </div>
      <p style={{ color: '#475569', marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>{campaign.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginTop: 18 }}>
        <div>
          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: '8px 0', color: '#0b1220', textTransform: 'uppercase', fontSize: 13, letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 6, height: 24, background: '#3b82f6', display: 'inline-block', marginRight: 10, borderRadius: 4 }}></span>
              <Calendar size={16} style={{ marginRight: 8 }} /> Dates
            </h3>
            <div style={{ color: '#475569' }}>
              <div><strong>Announcement:</strong> {fmt(campaign.announcementDate)}</div>
              <div><strong>Start:</strong> {fmt(campaign.startDate)}</div>
              <div><strong>End:</strong> {fmt(campaign.endDate)}</div>
            </div>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: '8px 0', color: '#0b1220', textTransform: 'uppercase', fontSize: 13, letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 6, height: 24, background: '#10b981', display: 'inline-block', marginRight: 10, borderRadius: 4 }}></span>
              <Users size={16} style={{ marginRight: 8 }} /> Participants
            </h3>
            <div style={{ color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>{current}</strong> / {max ?? 'Unlimited'}</div>
                {percent !== null && <div style={{ color: '#94a3b8' }}>{percent}%</div>}
              </div>

              {/* Progress bar */}
              <div style={{ height: 10, background: '#e6eefc', borderRadius: 8, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: percent ? `${percent}%` : '100%', height: '100%', background: isFull ? '#ef4444' : '#3b82f6' }} />
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: '8px 0', color: '#0b1220', textTransform: 'uppercase', fontSize: 13, letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 6, height: 24, background: '#f59e0b', display: 'inline-block', marginRight: 10, borderRadius: 4 }}></span>
              <Info size={16} style={{ marginRight: 8 }} /> Rules & Rewards
            </h3>
            <div style={{ color: '#475569', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Registration rules</strong>
                <div style={{ marginTop: 6 }}>{campaign.registrationRules ?? 'No specific rules.'}</div>
              </div>

              <div>
                <strong>Rewards</strong>
                <div style={{ marginTop: 6 }}>{campaign.rewardDescription ?? 'No reward information yet.'}</div>
              </div>
            </div>
          </section>

        </div>

        <aside style={{ borderLeft: '1px solid #eef2f7', paddingLeft: 18 }}>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Campaign code</div>
            <div style={{ fontWeight: 800, color: '#0b1220', fontSize: 16 }}>{campaign.campaignCode}</div>
          </div>

          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Status</div>
            <div style={{ marginTop: 6 }}><StatusBadge status={campaign.status} /></div>
          </div>

          {/* <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(2,6,23,0.03)' }}>
            <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ngày tạo</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{fmt(campaign.createdAt)}</div>
          </div> */}
        </aside>
      </div>

    </div>
  );
}
