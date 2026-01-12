import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployeeProfile, sendProfileUpdateRequest } from "../../Services/requests";
import { FormRow } from "../../components/common/FormRow";
import ViolationBanner from "../../components/common/ViolationBanner";
import Toast from "../../components/common/Toast"; 

// --- DỮ LIỆU TỈNH THÀNH (MẪU) ---
const PROVINCES = [
  { id: "HN", name: "Hanoi", districts: ["Ba Dinh", "Hoan Kiem", "Hai Ba Trung", "Dong Da", "Tay Ho", "Cau Giay", "Thanh Xuan", "Hoang Mai"] },
  { id: "HCM", name: "Ho Chi Minh City", districts: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Binh Thanh", "Binh Tan", "Go Vap", "Phu Nhuan", "Tan Binh", "Tan Phu"] },
  { id: "HP", name: "Hai Phong", districts: ["Hong Bang", "Ngo Quyen", "Le Chan", "Kien An", "Do Luong", "An Lao", "Van Don"] },
  { id: "DN", name: "Da Nang", districts: ["Hai Chau", "Thanh Khe", "Son Tra", "Ngu Hanh Son", "Lien Chieu", "Cam Le"] },
  { id: "HUE", name: "Thua Thien Hue", districts: ["Hue City", "A Luoi", "Phu Loc", "Phu Vang", "Quang Dien"] },
  { id: "QN", name: "Quang Ninh", districts: ["Ha Long", "Mong Cai", "Cam Pha", "Uong Bi", "Dong Trieu", "Tien Yen"] },
  { id: "CT", name: "Can Tho", districts: ["Ninh Kieu", "Binh Thuy", "Cai Rang", "O Mon", "Thot Not", "Phong Dien"] },
];

export default function ProfileUpdateRequestPage() {
  const navigate = useNavigate();
  // Fallback EMP001 để test nếu chưa có login thật
  const currentEmployeeCode = localStorage.getItem("employeeCode") || "EMP001"; 

  // State hiển thị Toast thông báo
  const [toast, setToast] = useState(null);

  // State địa chỉ (Không có Ward)
  const [addressParts, setAddressParts] = useState({
    street: "", district: "", city: ""
  });

  // State Form chính
  const [form, setForm] = useState({
    personalEmail: "",
    phoneNumber: "",
    maritalStatus: "Single",
    hasChildren: false,
    nationality: "Vietnam",
    citizenIdNumber: "",
    personalTaxCode: "",
    socialInsuranceNumber: "",
    dateOfBirth: "",
    gender: "Male",
  });

  // State lưu dữ liệu gốc để so sánh lấy OldValue
  const [original, setOriginal] = useState({});
  const [reason, setReason] = useState("");
  const [errs, setErrs] = useState([]);

  // Hàm helper convert ngày
  const convertDateToISO = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month}-${day}`;
    }
    return dateStr.substring(0, 10);
  };

  // --- LOAD DỮ LIỆU BAN ĐẦU ---
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEmployeeProfile(currentEmployeeCode);
        
        // 1. Tách địa chỉ cũ (Lấy 2 phần cuối làm Quận/Tỉnh, còn lại là Đường)
        const addrStr = data.currentAddress || "";
        const parts = addrStr.split(",").map(s => s.trim()).filter(Boolean);
        
        let loadedAddr = { street: "", district: "", city: "" };
        if (parts.length >= 2) {
            loadedAddr.city = parts[parts.length - 1];
            loadedAddr.district = parts[parts.length - 2];
            loadedAddr.street = parts.slice(0, parts.length - 2).join(", ");
        } else {
            loadedAddr.street = addrStr;
        }
        setAddressParts(loadedAddr);

        // 2. Map dữ liệu vào Form
        const mappedData = {
          personalEmail: data.personalEmail || "",
          phoneNumber: (Array.isArray(data.phoneNumbers) && data.phoneNumbers[0]?.phoneNumber) || data.phone_number || "",
          maritalStatus: data.maritalStatus || "Single",
          hasChildren: data.hasChildren || false,
          nationality: data.nationality || "Vietnam",
          citizenIdNumber: data.citizenIdNumber || data.citizen_id || "",
          personalTaxCode: data.personalTaxCode || data.personal_tax_code || "",
          socialInsuranceNumber: data.socialInsuranceNumber || data.social_insurance_no || "",
          dateOfBirth: convertDateToISO(data.dateOfBirth),
          gender: data.gender || "Male",
        };

        setForm(mappedData);
        // Lưu lại bản gốc để so sánh sau này
        setOriginal({ ...mappedData, currentAddress: addrStr });

      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load profile data." });
      }
    }
    load();
  }, [currentEmployeeCode]);

  // --- XỬ LÝ NHẬP LIỆU ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Chặn nhập chữ cho các trường số
    if (["phoneNumber", "citizenIdNumber", "personalTaxCode", "socialInsuranceNumber"].includes(name)) {
        if (value && !/^\d*$/.test(value)) return; 
    }
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // --- VALIDATE ---
  const validateForm = () => {
    const errors = [];
    const phoneRegex = /^0\d{9}$/;      // 0xxxxxxxxx (10 số)
    const cccdRegex = /^\d{12}$/;       // 12 số
    const taxAndInsRegex = /^\d{10}$/;  // 10 số

    if (form.phoneNumber && !phoneRegex.test(form.phoneNumber)) errors.push("Invalid Phone Number: Must be 10 digits and start with 0.");
    if (form.citizenIdNumber && !cccdRegex.test(form.citizenIdNumber)) errors.push("Invalid Citizen ID: Must be exactly 12 digits.");
    if (form.personalTaxCode && !taxAndInsRegex.test(form.personalTaxCode)) errors.push("Invalid Tax Code: Must be exactly 10 digits.");
    if (form.socialInsuranceNumber && !taxAndInsRegex.test(form.socialInsuranceNumber)) errors.push("Invalid Social Insurance No: Must be exactly 10 digits.");
    if (form.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalEmail)) errors.push("Invalid Email format.");

    return errors;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrs([]);

    // 1. Chạy Validate
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
        setErrs(validationErrors);
        setToast({ type: "error", message: "Please correct the errors in the form." });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    if (!reason.trim()) {
      setErrs(["Please enter the reason for change."]);
      return;
    }

    const details = [];
    // Map tên biến FE sang tên biến BE
    const fieldMap = {
      personalEmail: "PersonalEmail",
      phoneNumber: "PhoneNumber",
      maritalStatus: "MaritalStatus",
      hasChildren: "HasChildren",
      nationality: "Nationality",
      citizenIdNumber: "CitizenIdNumber",
      personalTaxCode: "PersonalTaxCode",
      socialInsuranceNumber: "SocialInsuranceNumber",
      dateOfBirth: "DateOfBirth",
      gender: "Gender"
    };

    // 2. So sánh từng trường và ĐÓNG GÓI OLD VALUE
    Object.keys(fieldMap).forEach(key => {
      const newValStr = String(form[key]);
      // Lấy old value từ state original, nếu null thì gán chuỗi rỗng
      const oldValStr = String(original[key] || (key === 'hasChildren' ? "false" : "")); 
      
      if (newValStr !== oldValStr) {
        details.push({ 
            fieldName: fieldMap[key], 
            oldValue: oldValStr,  // ✅ QUAN TRỌNG: Gửi OldValue đi
            newValue: newValStr 
        });
      }
    });

    // 3. Xử lý riêng Địa chỉ
    const newAddress = [addressParts.street, addressParts.district, addressParts.city]
        .filter(Boolean).join(", "); 
    
    if (newAddress !== original.currentAddress) {
        details.push({ 
            fieldName: "CurrentAddress", 
            oldValue: original.currentAddress || "", // ✅ Gửi OldValue của địa chỉ
            newValue: newAddress 
        });
    }

    // 4. Nếu không có gì thay đổi
    if (details.length === 0) {
      setToast({ type: "error", message: "You haven't changed any information." });
      return;
    }

    // 5. Gửi API
    try {
      // Gọi hàm create request
      await sendProfileUpdateRequest(currentEmployeeCode, { reason: reason.trim(), details });
      
      setToast({ type: "success", message: "Profile update request submitted successfully!" });
      
      // Đợi 1.5s rồi chuyển trang
      setTimeout(() => {
        navigate("/employee/profile");
      }, 1500);

    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: error.message || "Submission failed. Please try again." });
    }
  };

  // Logic hiển thị Dropdown Quận/Huyện theo Tỉnh
  const selectedProvinceData = PROVINCES.find(p => p.name === addressParts.city);
  const districtOptions = selectedProvinceData ? selectedProvinceData.districts : [];

  return (
    <div className="card form-card p-6 bg-white shadow rounded max-w-5xl mx-auto my-6">
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <h3 className="text-2xl font-bold mb-6 text-center text-blue-700">Profile Update Request</h3>
      <ViolationBanner messages={errs} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-5">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center">
              Personal & Contact Information
            </h4>
            <FormRow label="Personal Email">
                <input className="input border p-2 w-full rounded" name="personalEmail" value={form.personalEmail} onChange={handleChange} />
            </FormRow>
            <FormRow label="Phone Number">
                <input className="input border p-2 w-full rounded" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="0xxxxxxxxx (10 digits)" maxLength={10} />
            </FormRow>
            <div className="grid grid-cols-2 gap-4">
                <FormRow label="Marital Status">
                    <select className="input border p-2 w-full rounded" name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </FormRow>
                <FormRow label="Nationality">
                    <input className="input border p-2 w-full rounded" name="nationality" value={form.nationality} onChange={handleChange} />
                </FormRow>
            </div>
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="hasChildren" checked={form.hasChildren} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                    <span className="ml-3 text-gray-700 font-medium">Has Children (For family deduction)</span>
                </label>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center">
               Legal Information Correction
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <FormRow label="Date of Birth">
                    <input type="date" className="input border p-2 w-full rounded" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                </FormRow>
                <FormRow label="Gender">
                     <select className="input border p-2 w-full rounded" name="gender" value={form.gender} onChange={handleChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </FormRow>
            </div>
            <FormRow label="Citizen ID / Passport No">
                <input className="input border p-2 w-full rounded" name="citizenIdNumber" value={form.citizenIdNumber} onChange={handleChange} maxLength={12} placeholder="12 digits" />
            </FormRow>
            <FormRow label="Personal Tax Code">
                <input className="input border p-2 w-full rounded" name="personalTaxCode" value={form.personalTaxCode} onChange={handleChange} maxLength={10} placeholder="10 digits" />
            </FormRow>
            <FormRow label="Social Insurance Number">
                <input className="input border p-2 w-full rounded" name="socialInsuranceNumber" value={form.socialInsuranceNumber} onChange={handleChange} maxLength={10} placeholder="10 digits" />
            </FormRow>
        </div>

        {/* ADDRESS */}
        <div className="lg:col-span-2 space-y-4 pt-2">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Current Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Tỉnh/Thành */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Province / City</label>
                    <select 
                        className="input border p-2 w-full rounded"
                        value={addressParts.city}
                        onChange={(e) => setAddressParts({ ...addressParts, city: e.target.value, district: "" })}
                    >
                        <option value="">-- Select --</option>
                        {PROVINCES.map((p) => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>
                {/* 2. Quận/Huyện */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">District</label>
                    <select
                        className="input border p-2 w-full rounded disabled:bg-gray-100"
                        value={addressParts.district}
                        onChange={(e) => setAddressParts({...addressParts, district: e.target.value})}
                        disabled={!addressParts.city}
                    >
                        <option value="">-- Select --</option>
                        {districtOptions.map((d, index) => (
                            <option key={index} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                {/* 3. Đường/Số nhà */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Street Name / House No</label>
                    <input className="input border p-2 w-full rounded" 
                           value={addressParts.street} onChange={e => setAddressParts({...addressParts, street: e.target.value})} 
                           placeholder="e.g., 123 Le Duan" />
                </div>
            </div>
        </div>

        {/* REASON & BUTTONS */}
        <div className="lg:col-span-2 mt-4 border-t pt-6">
            <FormRow label="Reason for Change (*)" full>
                <textarea className="textarea border p-2 w-full rounded bg-gray-50 focus:bg-white transition-colors" 
                          rows={3} value={reason} onChange={(e) => setReason(e.target.value)} 
                          required placeholder="e.g., Moved to new address, updated ID card..." />
            </FormRow>
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => navigate("/employee/profile")} className="btn bg-gray-200 text-gray-700 px-6 py-2.5 rounded hover:bg-gray-300 transition">Cancel</button>
                <button type="submit" className="btn bg-blue-600 text-white px-8 py-2.5 rounded font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">Submit Request</button>
            </div>
        </div>

      </form>
    </div>
  );
}