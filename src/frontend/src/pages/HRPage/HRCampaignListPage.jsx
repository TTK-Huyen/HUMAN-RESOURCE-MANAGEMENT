import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Calendar
} from "lucide-react";
import { fetchCampaigns, deleteCampaign } from "../../Services/campaigns";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import "../../components/layout/Mainlayout"; 

export default function HRCampaignListPage() {
  const navigate = useNavigate();
  
  // State Data
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState({ code: null, name: null });
  
  // State Filters
  const [filters, setFilters] = useState({
    code: "",
    name: ""
  });

  const [reloadKey, setReloadKey] = useState(0);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchCampaigns(); 
        setCampaigns(data || []);
      } catch (error) {
        console.error("Error loading campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [reloadKey]); 

  // --- 2. DELETE HANDLER ---
  const handleDelete = async (campaignCode, campaignName) => {
    setPendingDelete({ code: campaignCode, name: campaignName });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const { code, name } = pendingDelete;
    setShowDeleteConfirm(false);
    if (!code) return;
    try {
      await deleteCampaign(code);
      setToast({ type: 'success', message: `Deleted campaign: ${name}` });
      setReloadKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    } finally {
      setPendingDelete({ code: null, name: null });
    }
  };

  // --- 3. FILTER LOGIC ---
  const filteredCampaigns = campaigns.filter((item) => {
    const searchCode = filters.code.toLowerCase();
    const searchName = filters.name.toLowerCase();
    
    const itemCode = (item.campaignCode || "").toLowerCase();
    const itemName = (item.campaignName || "").toLowerCase();

    return itemCode.includes(searchCode) && itemName.includes(searchName);
  });

  // Helper: Format Date (Changed to English/GB locale for dd/mm/yyyy format)
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper: Status Color
  const getStatusColor = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PENDING") return "#f59e0b"; // Orange
    if (s === "UPCOMING") return "#3b82f6"; // Blue
    if (s === "RUNNING" || s === "ACTIVE") return "#10b981"; // Green
    if (s === "ENDED" || s === "CLOSED") return "#6b7280"; // Gray
    return "#333";
  };

  return (
    <div className="page-container fade-in-up" style={{ padding: "20px" }}>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete campaign: ${pendingDelete.name || ''}?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* --- HEADER --- */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "15px", background: "#fff", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#1f2937" }}>Manage Campaigns</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>Internal events and campaigns</p>
        </div>
        <Button onClick={() => navigate("/hr/campaigns/add")} variant="primary">
          <Plus size={16} /> &nbsp; Create
        </Button>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          
          {/* Filter by Code */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>Search by Code</label>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "#9ca3af" }} />
              <input 
                type="text" 
                placeholder="Ex: CAM001..." 
                value={filters.code}
                onChange={(e) => setFilters(prev => ({...prev, code: e.target.value}))}
                style={{ width: "100%", padding: "8px 10px 8px 35px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}
              />
            </div>
          </div>

          {/* Filter by Name */}
          <div style={{ flex: 2, minWidth: "300px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>Search by Campaign Name</label>
            <div style={{ position: "relative" }}>
              <Filter size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "#9ca3af" }} />
              <input 
                type="text" 
                placeholder="Ex: Badminton Tournament..." 
                value={filters.name}
                onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))}
                style={{ width: "100%", padding: "8px 10px 8px 35px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="card" style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>CODE</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>CAMPAIGN NAME</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>DURATION</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>PARTICIPANTS</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>STATUS</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600", textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading campaigns...</td>
                    </tr>
                  ) : filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                        <EmptyState message="No campaigns found" subMessage="Try removing filters or adjust your search" />
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((camp, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "16px", fontWeight: "600", color: "#374151" }}>
                      {camp.campaignCode}
                    </td>
                    <td style={{ padding: "16px", color: "#111827", fontWeight: "500" }}>
                      {camp.campaignName}
                    </td>
                    <td style={{ padding: "16px", fontSize: "0.9rem", color: "#4b5563" }}>
                      <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <Calendar size={14}/> 
                        {formatDate(camp.startDate)} - {formatDate(camp.endDate)}
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: "0.9rem" }}>
                      {camp.currentParticipants || 0} / {camp.maxParticipants || "∞"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600",
                        backgroundColor: `${getStatusColor(camp.status)}20`, 
                        color: getStatusColor(camp.status),
                        border: `1px solid ${getStatusColor(camp.status)}40`
                      }}>
                        {camp.status || "PENDING"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(camp.campaignCode, camp.campaignName)}
                        title="Delete Campaign"
                        style={{
                          background: "#fef2f2", 
                          color: "#ef4444", 
                          border: "1px solid #fecaca",
                          padding: "8px", 
                          borderRadius: "6px", 
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "white"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}