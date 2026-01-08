import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import CampaignForm from "../../components/features/campaign/CampaignForm"; 
import { createCampaign } from "../../Services/campaigns"; 
import Toast from "../../components/common/Toast";
import "../../components/layout/Mainlayout"; 

export default function HRAddCampaignPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  
  // Show/hide form when resetting
  const [showForm, setShowForm] = useState(true);

  // Hard reset form (hide then show to clear internal state)
  const hardResetForm = () => {
    setShowForm(false); // hide form to clear stale state
    setTimeout(() => {
      setShowForm(true); // show fresh form after short delay
    }, 50);
  };

  const handleCreateCampaign = async (formData) => {
    setLoading(true);
    setNotification({ type: "", message: "" });

    try {
      const result = await createCampaign(formData);
      
      setNotification({
        type: "success",
        message: `Campaign created: ${result.campaignName || formData.campaignName}`
      });

      // QUAN TRỌNG: Gọi hàm reset cứng để xóa lớp đen và mở khóa nút
      hardResetForm();

    } catch (error) {
      console.error(error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || error.message || "An error occurred."
      });
    } finally {
      setLoading(false); // Đảm bảo luôn tắt loading
    }
  };

  return (
    <div className="page-container fade-in-up" style={{padding: "20px"}}>
      <div className="card" style={{ marginBottom: "1.5rem", background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div className="card-header">
          <div className="header-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button 
                className="btn btn-ghost btn-icon-only" 
                onClick={() => navigate(-1)}
                title="Back"
                style={{border: "none", background: "transparent", cursor: "pointer"}}
            >
                <ArrowLeft size={24} color="#333" />
            </button>
            <div>
              <h2 style={{margin: 0, fontSize: "1.5rem", color: "#1f2937"}}>Create New Campaign</h2>
            </div>
          </div>
        </div>
      </div>

      {notification.message && (
        <Toast type={notification.type} message={notification.message} onClose={() => setNotification({type:'', message:''})} />
      )}

      <div className="card" style={{background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"}}>
        <div className="card-body" style={{padding: "20px"}}>
            {/* Render form only when `showForm` is true. Hiding then showing clears internal form state. */}
            {showForm && (
                <CampaignForm 
                    onSubmit={handleCreateCampaign} 
                    loading={loading} 
                />
            )}
        </div>
      </div>
    </div>
  );
}