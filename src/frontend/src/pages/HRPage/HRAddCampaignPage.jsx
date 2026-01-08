import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import CampaignForm from "../../components/features/campaign/CampaignForm"; 
import { createCampaign } from "../../Services/campaigns"; 
import "../../components/layout/Mainlayout"; 

export default function HRAddCampaignPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  
  // Biến này để hiển thị form. True = hiện, False = ẩn.
  const [showForm, setShowForm] = useState(true);

  // Hàm reset form "cứng" (Tắt đi bật lại)
  const hardResetForm = () => {
    setShowForm(false); // 1. Ẩn form đi (để xóa sạch dữ liệu cũ và modal kẹt)
    setTimeout(() => {
      setShowForm(true); // 2. Hiện lại form mới tinh sau 50ms
    }, 50);
  };

  const handleCreateCampaign = async (formData) => {
    setLoading(true);
    setNotification({ type: "", message: "" });

    try {
      const result = await createCampaign(formData);
      
      setNotification({
        type: "success",
        message: `Tạo thành công: ${result.campaignName || formData.campaignName}`
      });

      // QUAN TRỌNG: Gọi hàm reset cứng để xóa lớp đen và mở khóa nút
      hardResetForm();

    } catch (error) {
      console.error(error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || error.message || "Có lỗi xảy ra."
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
                title="Quay lại"
                style={{border: "none", background: "transparent", cursor: "pointer"}}
            >
                <ArrowLeft size={24} color="#333" />
            </button>
            <div>
              <h2 style={{margin: 0, fontSize: "1.5rem", color: "#1f2937"}}>Tạo Chiến Dịch Mới</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo */}
      {notification.message && (
        <div 
          className="card fade-in-up" 
          style={{ 
            marginBottom: "1.5rem", 
            padding: "1rem",
            borderRadius: "6px",
            backgroundColor: notification.type === "success" ? "#f0fdf4" : "#fef2f2",
            // Đã sửa lỗi dấu \ ở đây
            border: `1px solid ${notification.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: notification.type === "success" ? "#166534" : "#991b1b"
          }}
        >
          {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="card" style={{background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"}}>
        <div className="card-body" style={{padding: "20px"}}>
            {/* Logic: Nếu showForm = true thì mới vẽ Form. 
                Khi reset, nó sẽ biến mất trong tích tắc rồi hiện lại -> Mất sạch lỗi kẹt.*/}
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