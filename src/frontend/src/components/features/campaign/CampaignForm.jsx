import React, { useState } from "react";
import { FormRow } from "../../common/FormRow";
import "./CampaignForm.css";

export default function CampaignForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    campaignName: "",
    description: "",
    rule: "",
    announcementDate: "",
    startDate: "",
    endDate: "",
    rewardDescription: "",
    maxParticipants: "",
  });

  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Hàm kiểm tra 3 ngày (tách riêng để dễ gọi)
  const checkDateRules = (announceStr, startStr) => {
    if (!announceStr || !startStr) return "";

    const announce = new Date(announceStr);
    const start = new Date(startStr);
    
    // Reset giờ để tính ngày cho chuẩn
    announce.setHours(0,0,0,0);
    start.setHours(0,0,0,0);

    if (start < announce) {
      return "Ngày công bố không được sau ngày bắt đầu!";
    }

    const diffTime = start - announce;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      return `Mới cách có ${diffDays} ngày. Phải công bố trước ít nhất 3 ngày!`;
    }

    return ""; // Không có lỗi
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 1. Cập nhật dữ liệu Form
    setFormData((prev) => {
        const newData = { ...prev, [name]: value };

        // 2. CHECK NGAY LẬP TỨC: Logic 3 ngày
        // Nếu người dùng đang sửa Ngày công bố HOẶC Ngày bắt đầu
        if (name === "announcementDate" || name === "startDate") {
            const errorMsg = checkDateRules(
                name === "announcementDate" ? value : newData.announcementDate,
                name === "startDate" ? value : newData.startDate
            );
            
            // Cập nhật lỗi cho trường Ngày công bố
            setErrors(prevErr => ({
                ...prevErr,
                announcementDate: errorMsg
            }));
        }

        return newData;
    });

    // 3. Xóa lỗi cơ bản khi nhập lại
    if (errors[name] && name !== "announcementDate") {
       setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // 4. Validate realtime số lượng
    if (name === "maxParticipants") {
        if (value && Number(value) < 1) {
            setErrors((prev) => ({ ...prev, maxParticipants: "Số lượng tối thiểu là 1" }));
        } else {
            setErrors((prev) => ({ ...prev, maxParticipants: "" }));
        }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Validate required
    if (!formData.campaignName.trim()) newErrors.campaignName = "Nhập tên chiến dịch";
    if (!formData.description.trim()) newErrors.description = "Nhập mô tả";
    if (!formData.rule.trim()) newErrors.rule = "Nhập thể lệ"; 
    
    if (!formData.maxParticipants || Number(formData.maxParticipants) < 1) {
        newErrors.maxParticipants = "Số lượng tối thiểu là 1";
    }

    if (!formData.announcementDate) newErrors.announcementDate = "Chọn ngày công bố";
    if (!formData.startDate) newErrors.startDate = "Chọn ngày bắt đầu";
    if (!formData.endDate) newErrors.endDate = "Chọn ngày kết thúc";

    // Re-check logic ngày lần cuối trước khi submit
    const dateError = checkDateRules(formData.announcementDate, formData.startDate);
    if (dateError) {
        newErrors.announcementDate = dateError;
    }

    if (formData.startDate && formData.endDate) {
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSubmit = () => {
    if (validate()) setShowConfirm(true);
  };

  const StyledLabel = ({ label, required }) => (
      <label className="form-label-styled" style={{fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', display:'block'}}>
          {label} {required && <span style={{color: '#ef4444'}}>*</span>}
      </label>
  );

  return (
    <div className="campaign-form-wrapper">
        <div className="form-grid-compact" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
            
            {/* === CỘT TRÁI === */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <FormRow error={errors.campaignName}>
                    <StyledLabel label="Tên chiến dịch" required />
                    <input className={`form-control-styled ${errors.campaignName ? 'border-red-500' : ''}`}
                        name="campaignName" value={formData.campaignName} onChange={handleChange} />
                </FormRow>

                {/* 👇 KHU VỰC NGÀY CÔNG BỐ: Hiện lỗi đỏ ngay tại đây */}
                <FormRow>
                    <StyledLabel label="Ngày công bố" required />
                    <input 
                        type="date" 
                        className={`form-control-styled ${errors.announcementDate ? 'border-red-500' : ''}`}
                        name="announcementDate" 
                        value={formData.announcementDate} 
                        onChange={handleChange}
                        min={getTodayDate()} 
                    />
                    
                    {/* Hiển thị lỗi hoặc gợi ý */}
                    {errors.announcementDate ? (
                        <p style={{color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontStyle: 'italic', fontWeight: 'bold'}}>
                           ⚠ {errors.announcementDate}
                        </p>
                    ) : (
                        <small style={{fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic'}}>
                           Phải trước ngày bắt đầu ít nhất 3 ngày
                        </small>
                    )}
                </FormRow>

                <FormRow error={errors.startDate}>
                    <StyledLabel label="Ngày bắt đầu" required />
                    <input type="date" className="form-control-styled"
                        name="startDate" value={formData.startDate} onChange={handleChange}
                        min={formData.announcementDate || getTodayDate()} />
                </FormRow>

                <FormRow error={errors.endDate}>
                    <StyledLabel label="Ngày kết thúc" required />
                    <input type="date" className="form-control-styled"
                        name="endDate" value={formData.endDate} onChange={handleChange}
                        min={formData.startDate || getTodayDate()} />
                </FormRow>
            </div>

            {/* === CỘT PHẢI === */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <FormRow error={errors.description}>
                    <StyledLabel label="Mô tả chi tiết" required/>
                    <textarea className="form-control-styled" rows="3"
                        name="description" value={formData.description} onChange={handleChange} />
                </FormRow>

                <FormRow error={errors.rule}>
                    <StyledLabel label="Thể lệ (Rules)" required />
                    <textarea className="form-control-styled" rows="2"
                        name="rule" value={formData.rule} onChange={handleChange} />
                </FormRow>

                <FormRow>
                    <StyledLabel label="Phần thưởng" />
                    <textarea className="form-control-styled" rows="2"
                        name="rewardDescription" value={formData.rewardDescription} onChange={handleChange} />
                </FormRow>

                <FormRow>
                    <StyledLabel label="Số lượng tối đa" required />
                    <input 
                        type="number" 
                        className={`form-control-styled ${errors.maxParticipants ? 'border-red-500' : ''}`}
                        name="maxParticipants" 
                        value={formData.maxParticipants} 
                        onChange={handleChange} 
                        min="1"
                    />
                    {errors.maxParticipants && (
                        <p style={{color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontStyle: 'italic'}}>
                            ⚠ {errors.maxParticipants}
                        </p>
                    )}
                </FormRow>

                <div style={{ marginTop: "auto", paddingTop: "1rem", textAlign: 'right' }}>
                    <button className="btn-submit-styled" onClick={handlePreSubmit} disabled={loading}
                        style={{padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', fontWeight: '600'}}>
                        {loading ? "Đang xử lý..." : "Tạo chiến dịch"}
                    </button>
                </div>
            </div>
        </div>

        {/* Modal Xác nhận */}
        {showConfirm && (
            <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
                <div className="modal-container" style={{background:'white', padding:'2rem', borderRadius:'8px', width:'400px'}}>
                    <h3 style={{marginTop:0}}>Xác nhận tạo?</h3>
                    <p>Bạn có chắc chắn muốn tạo chiến dịch <strong>{formData.campaignName}</strong>?</p>
                    <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'20px'}}>
                        <button onClick={() => setShowConfirm(false)} style={{padding:'8px 16px', border:'1px solid #ddd', background:'white', borderRadius:'4px', cursor:'pointer'}}>Hủy</button>
                        <button onClick={() => { setShowConfirm(false); onSubmit(formData); }} style={{padding:'8px 16px', background:'#2563eb', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>Đồng ý</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}