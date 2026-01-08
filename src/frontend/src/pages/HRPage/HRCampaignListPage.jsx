import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Calendar,
  AlertCircle 
} from "lucide-react";
import { fetchCampaigns, deleteCampaign } from "../../Services/campaigns"; 
import "../../components/layout/Mainlayout"; // Đảm bảo import CSS layout nếu cần

export default function HRCampaignListPage() {
  const navigate = useNavigate();
  
  // State dữ liệu
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State bộ lọc
  const [filters, setFilters] = useState({
    code: "",
    name: ""
  });

  // Biến Key để reload danh sách (giống logic Add form)
  const [reloadKey, setReloadKey] = useState(0);

  // --- 1. HÀM LOAD DỮ LIỆU ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Gọi hàm fetchCampaigns đã có trong service
        // (Hàm này cần trả về mảng campaign như hình image_696c00.png)
        const data = await fetchCampaigns(); 
        setCampaigns(data || []);
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [reloadKey]); // Chạy lại khi reloadKey thay đổi

  // --- 2. HÀM XỬ LÝ XÓA (MÀU ĐỎ) ---
  const handleDelete = async (campaignCode, campaignName) => {
    // Confirm trước khi xóa
    const isConfirmed = window.confirm(`Bạn có chắc muốn xóa chiến dịch: ${campaignName}?`);
    if (!isConfirmed) return;

    try {
      // Gọi API PATCH DELETE
      await deleteCampaign(campaignCode);
      
      alert("Đã xóa thành công!");
      
      // 👇 KÍCH HOẠT RELOAD LẠI DANH SÁCH NGAY LẬP TỨC
      setReloadKey(prev => prev + 1);

    } catch (error) {
      console.error(error);
      alert("Xóa thất bại. Vui lòng thử lại.");
    }
  };

  // --- 3. LOGIC LỌC DỮ LIỆU TRÊN UI ---
  const filteredCampaigns = campaigns.filter((item) => {
    const searchCode = filters.code.toLowerCase();
    const searchName = filters.name.toLowerCase();
    
    const itemCode = (item.campaignCode || "").toLowerCase();
    const itemName = (item.campaignName || "").toLowerCase();

    return itemCode.includes(searchCode) && itemName.includes(searchName);
  });

  // Helper format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Helper màu trạng thái
  const getStatusColor = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PENDING") return "#f59e0b"; // Vàng
    if (s === "UPCOMING") return "#3b82f6"; // Xanh dương
    if (s === "RUNNING" || s === "ACTIVE") return "#10b981"; // Xanh lá
    if (s === "ENDED" || s === "CLOSED") return "#6b7280"; // Xám
    return "#333";
  };

  return (
    <div className="page-container fade-in-up" style={{ padding: "20px" }}>
      
      {/* --- HEADER & NÚT TẠO MỚI --- */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "15px", background: "#fff", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#1f2937" }}>Quản lý Chiến Dịch</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>Danh sách các sự kiện nội bộ</p>
        </div>
        <button 
          onClick={() => navigate("/hr/campaigns/add")} // Đường dẫn tới trang Add bạn làm lúc nãy
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#2563eb", color: "white", border: "none",
            padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600"
          }}
        >
          <Plus size={18} /> Tạo mới
        </button>
      </div>

      {/* --- THANH TÌM KIẾM / BỘ LỌC --- */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          
          {/* Lọc theo Mã */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>Tìm theo Mã</label>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "#9ca3af" }} />
              <input 
                type="text" 
                placeholder="Ví dụ: CAM001..." 
                value={filters.code}
                onChange={(e) => setFilters(prev => ({...prev, code: e.target.value}))}
                style={{ width: "100%", padding: "8px 10px 8px 35px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}
              />
            </div>
          </div>

          {/* Lọc theo Tên */}
          <div style={{ flex: 2, minWidth: "300px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>Tìm theo Tên Chiến Dịch</label>
            <div style={{ position: "relative" }}>
              <Filter size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "#9ca3af" }} />
              <input 
                type="text" 
                placeholder="Ví dụ: Giải cầu lông..." 
                value={filters.name}
                onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))}
                style={{ width: "100%", padding: "8px 10px 8px 35px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* --- DANH SÁCH (TABLE) --- */}
      <div className="card" style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>MÃ</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>TÊN CHIẾN DỊCH</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>THỜI GIAN</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>THAM GIA</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>TRẠNG THÁI</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280", fontWeight: "600", textAlign: "right" }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Đang tải dữ liệu...</td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px'}}>
                      <AlertCircle size={30} />
                      <span>Không tìm thấy chiến dịch nào.</span>
                    </div>
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
                        backgroundColor: `${getStatusColor(camp.status)}20`, // Màu nền nhạt (20% opacity)
                        color: getStatusColor(camp.status),
                        border: `1px solid ${getStatusColor(camp.status)}40`
                      }}>
                        {camp.status || "PENDING"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      {/* 👇 NÚT XÓA MÀU ĐỎ (ADD BUTTON DELETE) */}
                      <button
                        onClick={() => handleDelete(camp.campaignCode, camp.campaignName)}
                        title="Xóa chiến dịch"
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