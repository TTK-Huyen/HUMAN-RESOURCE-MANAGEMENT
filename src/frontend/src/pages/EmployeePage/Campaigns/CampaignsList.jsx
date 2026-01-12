import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCampaigns, registerCampaign, getRegistrationStatus } from "../../../Services/campaigns";
import { PlusCircle, Info, Calendar, Search } from "lucide-react";
import Loading from "../../../components/common/Loading";
import EmptyState from "../../../components/common/EmptyState";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Toast from "../../../components/common/Toast";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // register state & toast
  const [registeringCode, setRegisteringCode] = useState("");
  const [toast, setToast] = useState(null);

  // Confirm dialog for registration
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingCampaignCode, setPendingCampaignCode] = useState(null);

  // pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const pageSizeOptions = [6, 12, 24, 48];

  // Filters
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const statusOptions = [
    { value: "", label: "All statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "UPCOMING", label: "Upcoming" },
    { value: "ONGOING", label: "Ongoing" },
    { value: "FINISHED", label: "Finished" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const load = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCampaigns(filters);
      const list = data || [];
      // Enrich each item with isRegistered for current employee
      const employeeCode = localStorage.getItem('employeeCode') || '';
      if (employeeCode && list.length > 0) {
        try {
          const statuses = await Promise.all(list.map(it => getRegistrationStatus(it.campaignCode, employeeCode)));
          const merged = list.map((it, idx) => ({ ...it, isRegistered: statuses[idx]?.registered ?? false }));
          setCampaigns(merged);
        } catch (e) {
          // If status check fails, fallback to raw list
          setCampaigns(list);
        }
      } else {
        setCampaigns(list);
      }
      // if loaded data changes, ensure current page is valid
      setCurrentPage(1);
    } catch (ex) {
      console.error(ex);
      setError(ex?.message || "Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };
  // register helper: call API, show toast, refresh list with current filters
  const handleRegister = async (campaignCode) => {
    if (!campaignCode) return;
    // find campaign to check full
    const c = campaigns.find(x => x.campaignCode === campaignCode);
    if (!c) return;
    const max = c.maxParticipants;
    const current = c.currentParticipants ?? 0;
    if (max && current >= max) {
      setToast({ type: 'error', message: 'Campaign is full.' });
      return;
    }

    // Show confirmation dialog
    setPendingCampaignCode(campaignCode);
    setShowConfirmDialog(true);
  };

  // Confirm registration after user accepts dialog
  const handleConfirmRegister = async () => {
    if (!pendingCampaignCode) return;
    
    setShowConfirmDialog(false);
    setRegisteringCode(pendingCampaignCode);
    
    try {
      const res = await registerCampaign(pendingCampaignCode);
      const msg = res?.message || 'Registered successfully.';
      setToast({ type: 'success', message: msg });
      // refresh current filters
      const filters = {};
      if (keyword) filters.name = keyword;
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      await load(filters);
    } catch (ex) {
      const errMsg = ex?.response?.data?.message || ex?.message || 'Registration failed. Please try again.';
      setToast({ type: 'error', message: errMsg });
    } finally {
      setRegisteringCode("");
      setPendingCampaignCode(null);
    }
  };

  // Initial load
  useEffect(() => {
    load();
  }, []);

  // Live update filters: debounce to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      const filters = {};
      if (keyword) filters.name = keyword;
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      load(filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [keyword, status, startDate, endDate]);

  const resetFilters = () => {
    setKeyword("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    load();
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : "-");

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil((campaigns.length || 0) / pageSize));
  const displayedCampaigns = campaigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <div style={{ maxWidth: 1100, margin: "20px auto", padding: 16 }}>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirm Registration"
        message={`Are you sure you want to register for this campaign?`}
        warningMessage="Note: To cancel registration later, HR approval is required."
        confirmLabel="Register"
        cancelLabel="Cancel"
        type="info"
        onConfirm={handleConfirmRegister}
        onCancel={() => {
          setShowConfirmDialog(false);
          setPendingCampaignCode(null);
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0, color: "#0b1220", fontSize: 24, fontWeight: 800 }}>Campaigns</h1>
      </div>

      {/* Filter Panel - now updates immediately on change (debounced) */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 10, boxShadow: '0 6px 18px rgba(2,6,23,0.04)', minWidth: 320 }}>
          <Search size={18} color="#94a3b8" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search by campaign name" style={{ border: 'none', outline: 'none', width: '260px', fontSize: 14 }} />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #eef2f7', background: '#fff', minWidth: 160 }}>
          {statusOptions.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #eef2f7' }}>
            <Calendar size={16} color="#94a3b8" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none' }} />
          </div>
          <div style={{ color: '#94a3b8', fontWeight: 700 }}>—</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #eef2f7' }}>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none' }} />
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-reset-campaigns" onClick={resetFilters} style={{ padding: '10px 16px', borderRadius: 999, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 800, boxShadow: '0 8px 20px rgba(59,130,246,0.12)', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            Reset
          </button>
          <style>{`.btn-reset-campaigns:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(59,130,246,0.16); } .btn-reset-campaigns:active { transform: translateY(0); }`}</style>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Loading fullScreen={false} text="Loading campaigns..." />
      ) : error ? (
        <div style={{ padding: 20, background: '#fff2f2', borderRadius: 8, color: '#b91c1c' }}>{error}</div>
      ) : campaigns.length === 0 ? (
        <EmptyState message="No campaigns found" subMessage="Try removing filters or adjust your search" />
      ) : (
        <>
          {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {displayedCampaigns.map(c => (
              <li key={c.campaignCode} className="campaign-card" style={{ border: '1px solid #e6eefc', borderRadius: 12, padding: 18, background: '#fff', boxShadow: '0 6px 18px rgba(15,23,42,0.03)', transition: 'transform 0.18s ease, box-shadow 0.18s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0b1220' }}>{c.campaignName}</h3>
                    <div style={{ color: '#64748b', fontSize: 12 }}>
                      {c.status === 'PENDING' ? 'Pending' :
                      c.status === 'UPCOMING' ? 'Upcoming' :
                      c.status === 'ONGOING' ? 'Ongoing' :
                      c.status === 'FINISHED' ? 'Finished' :
                      c.status === 'CANCELLED' ? 'Cancelled' : c.status}
                    </div>
                  </div>

                  <p style={{ marginTop: 8, color: '#475569', fontSize: 14, minHeight: 44 }}>{c.description}</p>

                  <div style={{ display: 'flex', gap: 12, marginTop: 12, color: '#475569', fontSize: 13 }}>
                            <div><strong>From:</strong> {fmt(c.startDate)}</div>
                            <div><strong>To:</strong> {fmt(c.endDate)}</div>
                          </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <Button
                    variant={c.isRegistered ? 'secondary' : 'primary'}
                    isLoading={registeringCode === c.campaignCode}
                    disabled={Boolean(c.isRegistered || (c.maxParticipants && c.currentParticipants >= c.maxParticipants))}
                    onClick={() => handleRegister(c.campaignCode)}
                  >
                    <PlusCircle size={14} /> {c.isRegistered ? 'Registered' : 'Register'}
                  </Button>
                  <Link to={`/employee/campaigns/${c.campaignCode}`} style={{ flex: 1, padding: '10px', background: '#64748b', color: 'white', border: 'none', borderRadius: 8, textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Info size={14} /> Details
                  </Link>
                </div>
                <style>{`.campaign-card .btn { transition: transform 0.12s, box-shadow 0.12s; } .campaign-card .btn:hover { transform: translateY(-2px); }`}</style>
              </li>
            ))}
          </div>

          {/* card hover styles */}
          <style>{`.campaign-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 18px 40px rgba(15,23,42,0.12); } .campaign-card:active { transform: translateY(-2px) scale(1.0); }`}</style>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={p => setCurrentPage(Math.max(1, Math.min(totalPages, p)))}
              pageSize={pageSize}
              onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
              pageSizeOptions={pageSizeOptions}
              showPageSelector={true}
            />
          </div>
        </>
      )}
    </div>
  );
}
