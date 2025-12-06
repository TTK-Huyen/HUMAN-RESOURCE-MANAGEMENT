import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../services/api';
import { FormRow } from '../../components/FormRow';
import ViolationBanner from '../../components/ViolationBanner';

export default function ProfileUpdateRequestPage() {
    const navigate = useNavigate();
    const currentEmployeeCode = "NV001"; // Hardcode tạm để test

    // State form dùng tên biến chuẩn camelCase khớp với Backend
    const [form, setForm] = useState({
        personalEmail: "", 
        phoneNumber: "", 
        currentAddress: "",
        bankAccount: ""
    });
    
    const [original, setOriginal] = useState({});
    const [reason, setReason] = useState("");
    const [errs, setErrs] = useState([]);

    // 1. Load dữ liệu gốc từ API để điền vào form
    useEffect(() => {
        EmployeeService.getProfile(currentEmployeeCode).then(res => {
            const data = res.data;
            setOriginal(data); // Lưu dữ liệu gốc
            
            // Điền dữ liệu vào form
            setForm({
                personalEmail: data.personalEmail || "",
                phoneNumber: data.phoneNumber || "",
                currentAddress: data.currentAddress || "",
                bankAccount: data.bankAccount || ""
            });
        }).catch(err => {
            console.error(err);
            setErrs(["Lỗi: Không tải được thông tin hồ sơ."]);
        });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            setErrs(["Vui lòng nhập lý do thay đổi."]);
            return;
        }

        // Logic so sánh: Chỉ gửi những trường có thay đổi
        // Tên trường (fieldName) gửi đi sẽ là camelCase (ví dụ: "phoneNumber")
        const updates = [];
        const fieldMap = {
            personalEmail: 'personalEmail',
            phoneNumber: 'phoneNumber',
            currentAddress: 'currentAddress',
            bankAccount: 'bankAccount'
        };

        Object.keys(form).forEach(key => {
            // So sánh giá trị form mới với giá trị gốc (original)
            // Lưu ý: original dùng key camelCase từ API trả về (vd: original.personalEmail)
            if (form[key] !== (original[key] || "")) {
                updates.push({
                    field_name: fieldMap[key], // Gửi tên trường chuẩn cho BE
                    new_value: form[key],
                    old_value: original[key] || "" // (Optional) Gửi kèm giá trị cũ nếu BE cần
                });
            }
        });

        if (updates.length === 0) {
            setErrs(["Bạn chưa thay đổi thông tin nào."]);
            return;
        }

        try {
            // Payload gửi đi theo đúng cấu trúc DTO Backend yêu cầu
            const payload = {
                reason: reason.trim(),
                updates: updates 
            };

            await EmployeeService.sendUpdateRequest(currentEmployeeCode, payload);
            
            alert("Gửi yêu cầu thành công!");
            navigate('/employee/profile');
        } catch (error) {
            console.error("Lỗi submit:", error);
            const msg = error.response?.data || "Gửi yêu cầu thất bại. Vui lòng thử lại.";
            setErrs([typeof msg === 'string' ? msg : JSON.stringify(msg)]);
        }
    };

    return (
        <div className="card form-card p-6 bg-white shadow rounded max-w-2xl mx-auto my-6">
            <h3 className="text-xl font-bold mb-4">Cập nhật thông tin</h3>
            <ViolationBanner messages={errs} />

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="profile-section-title font-semibold text-blue-600 border-b pb-2 mb-4">Thông tin liên hệ</div>
                
                {/* Lưu ý: name của input phải khớp với key trong state form (camelCase) */}
                <FormRow label="Email cá nhân">
                    <input className="input border p-2 w-full rounded" name="personalEmail" value={form.personalEmail} onChange={handleChange} />
                </FormRow>
                
                <FormRow label="Số điện thoại">
                    <input className="input border p-2 w-full rounded" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                </FormRow>
                
                <FormRow label="Địa chỉ hiện tại" full>
                    <input className="input border p-2 w-full rounded" name="currentAddress" value={form.currentAddress} onChange={handleChange} />
                </FormRow>

                <div className="profile-section-title font-semibold text-blue-600 border-b pb-2 mb-4 mt-6">Thông tin ngân hàng</div>
                <FormRow label="Tài khoản ngân hàng" full>
                    <input className="input border p-2 w-full rounded" name="bankAccount" value={form.bankAccount} onChange={handleChange} />
                </FormRow>

                <div className="mt-6">
                    <FormRow label="Lý do thay đổi (*)" full>
                        <textarea 
                            className="textarea border p-2 w-full rounded" 
                            rows={3} 
                            name="reason" 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)} 
                            placeholder="Nhập lý do chi tiết..." 
                            required 
                        />
                    </FormRow>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button type="button" className="btn bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => navigate('/employee/profile')}>Hủy</button>
                    <button type="submit" className="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Gửi yêu cầu</button>
                </div>
            </form>
        </div>
    );
}