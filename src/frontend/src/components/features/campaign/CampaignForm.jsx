import React, { useState } from "react";
import { FormRow } from "../../common/FormRow";
import Button from "../../common/Button";
import ConfirmDialog from "../../common/ConfirmDialog";
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

    // Check announcement/start date rules (separated for reuse)
  const checkDateRules = (announceStr, startStr) => {
    if (!announceStr || !startStr) return "";

    const announce = new Date(announceStr);
    const start = new Date(startStr);
    
    // Reset giờ để tính ngày cho chuẩn
    announce.setHours(0,0,0,0);
    start.setHours(0,0,0,0);

        if (start < announce) {
            return "Announcement date must be before start date!";
    }

    const diffTime = start - announce;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 3) {
            return `Only ${diffDays} day(s) apart. Announcement must be at least 3 days before start.`;
    }

        return ""; // no error
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

     // 3. Clear basic error on re-type (except announcementDate which is handled above)
     if (errors[name] && name !== "announcementDate") {
         setErrors((prev) => ({ ...prev, [name]: "" }));
     }

    // 4. Validate realtime số lượng
    if (name === "maxParticipants") {
        if (value && Number(value) < 1) {
            setErrors((prev) => ({ ...prev, maxParticipants: "Minimum is 1" }));
        } else {
            setErrors((prev) => ({ ...prev, maxParticipants: "" }));
        }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Validate required
    if (!formData.campaignName.trim()) newErrors.campaignName = "Enter campaign name";
    if (!formData.description.trim()) newErrors.description = "Enter description";
    if (!formData.rule.trim()) newErrors.rule = "Enter rules"; 

    if (!formData.maxParticipants || Number(formData.maxParticipants) < 1) {
        newErrors.maxParticipants = "Minimum is 1";
    }

    if (!formData.announcementDate) newErrors.announcementDate = "Choose announcement date";
    if (!formData.startDate) newErrors.startDate = "Choose start date";
    if (!formData.endDate) newErrors.endDate = "Choose end date";

    // Re-check logic ngày lần cuối trước khi submit
    const dateError = checkDateRules(formData.announcementDate, formData.startDate);
    if (dateError) {
        newErrors.announcementDate = dateError;
    }

    if (formData.startDate && formData.endDate) {
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            newErrors.endDate = "End date must be after start date";
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
            
            {/* === LEFT COLUMN === */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <FormRow error={errors.campaignName}>
                    <StyledLabel label="Campaign name" required />
                    <input className={`form-control-styled ${errors.campaignName ? 'border-red-500' : ''}`}
                        name="campaignName" value={formData.campaignName} onChange={handleChange} />
                </FormRow>

                {/* Announcement date area: show immediate validation */}
                <FormRow>
                    <StyledLabel label="Announcement date" required />
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
                           Must be at least 3 days before start date
                        </small>
                    )}
                </FormRow>

                <FormRow error={errors.startDate}>
                    <StyledLabel label="Start date" required />
                    <input type="date" className="form-control-styled"
                        name="startDate" value={formData.startDate} onChange={handleChange}
                        min={formData.announcementDate || getTodayDate()} />
                </FormRow>

                <FormRow error={errors.endDate}>
                    <StyledLabel label="End date" required />
                    <input type="date" className="form-control-styled"
                        name="endDate" value={formData.endDate} onChange={handleChange}
                        min={formData.startDate || getTodayDate()} />
                </FormRow>
            </div>

            {/* === RIGHT COLUMN === */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <FormRow error={errors.description}>
                    <StyledLabel label="Detailed description" required/>
                    <textarea className="form-control-styled" rows="3"
                        name="description" value={formData.description} onChange={handleChange} />
                </FormRow>

                <FormRow error={errors.rule}>
                    <StyledLabel label="Rules" required />
                    <textarea className="form-control-styled" rows="2"
                        name="rule" value={formData.rule} onChange={handleChange} />
                </FormRow>

                <FormRow>
                    <StyledLabel label="Rewards" />
                    <textarea className="form-control-styled" rows="2"
                        name="rewardDescription" value={formData.rewardDescription} onChange={handleChange} />
                </FormRow>

                <FormRow>
                    <StyledLabel label="Max participants" required />
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
                    <Button className="btn-submit-styled" onClick={handlePreSubmit} disabled={loading} variant="primary" style={{padding: '10px 24px', fontWeight: '600'}}>
                        {loading ? "Processing..." : "Create campaign"}
                    </Button>
                </div>
            </div>
        </div>

        <ConfirmDialog
            isOpen={showConfirm}
            title="Confirm creation"
            message={`Are you sure you want to create campaign "${formData.campaignName}"?`}
            onConfirm={() => { setShowConfirm(false); onSubmit(formData); }}
            onCancel={() => setShowConfirm(false)}
            type="info"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
        />
    </div>
  );
}