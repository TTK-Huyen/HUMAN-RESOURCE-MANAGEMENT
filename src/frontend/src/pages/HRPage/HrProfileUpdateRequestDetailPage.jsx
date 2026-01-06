import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, User, Calendar, GraduationCap, CreditCard, AlertCircle } from "lucide-react";
import { HRService } from "../../Services/employees"; 

// --- 1. SUB-COMPONENTS (Giữ nguyên) ---

const ProfileField = ({ label, value, icon }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
       {icon && React.cloneElement(icon, { size: 16, className: "text-slate-500" })}
       <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
         {label}
       </span>
    </div>
    <div className={`text-base font-medium text-slate-800 ${icon ? "pl-6" : ""}`}>
      {value || <span className="text-slate-400 font-normal italic">--</span>}
    </div>
  </div>
);

const InfoCard = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
    <h3 className="mt-0 mb-5 text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3">
      {title}
    </h3>
    {children}
  </div>
);

// --- 2. MAIN PAGE COMPONENT ---

export default function HRViewProfilePage() {
  const { employeeCode } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const IS_DEMO = false; 

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!employeeCode) throw new Error("Không tìm thấy mã nhân viên trên URL");

        if (IS_DEMO) {
           // ... (Code demo giữ nguyên nếu cần)
        } else {
          console.log("Fetching profile for:", employeeCode);
          const response = await HRService.fetchEmployeeProfileByCode(employeeCode);
          console.log("API Response:", response);

          // 🛠️ FIX QUAN TRỌNG TẠI ĐÂY: Xử lý cấu trúc { data: [...] }
          let profileData = null;

          if (response && response.data && Array.isArray(response.data)) {
            // Trường hợp 1: API trả về { data: [item1, item2] } -> Lấy phần tử đầu tiên
            profileData = response.data.length > 0 ? response.data[0] : null;
          } else if (Array.isArray(response)) {
            // Trường hợp 2: API trả về trực tiếp [item1, item2]
            profileData = response.length > 0 ? response[0] : null;
          } else {
            // Trường hợp 3: API trả về object phẳng { ... }
            profileData = response;
          }

          if (profileData) {
            setProfile(profileData);
          } else {
            throw new Error("Dữ liệu nhân viên rỗng hoặc không đúng định dạng");
          }
        }
      } catch (err) {
        console.error("Lỗi tải hồ sơ:", err);
        setError(err.message || "Không thể tải thông tin nhân viên.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [employeeCode]);

  // --- Render (Phần hiển thị giữ nguyên) ---
  if (loading) return (
      <div className="p-10 text-center text-slate-500 flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        Đang tải hồ sơ nhân viên...
      </div>
  );

  if (error) return (
      <div className="p-10 text-center text-red-500 bg-red-50 rounded-lg m-6 border border-red-200">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p className="font-semibold">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Quay lại</button>
      </div>
  );

  if (!profile) return null;

  // Xử lý hiển thị dữ liệu mảng (Array)
  const displayPhone = profile.phoneNumbers && profile.phoneNumbers.length > 0 ? profile.phoneNumbers.join(", ") : null;
  const displayEducation = profile.education && profile.education.length > 0 
      ? profile.education.map((edu, idx) => <div key={idx} className="mb-1">• {edu}</div>) 
      : null;

  return (
    <div className="max-w-6xl mx-auto p-6 fade-in-up">
      
      {/* Nút Quay lại */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Quay lại danh sách
      </button>

      {/* Header Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-lg">
        <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold shadow-md shrink-0">
            {profile.employeeName?.charAt(0) || "U"}
        </div>
        <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold m-0">{profile.employeeName}</h1>
            <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start opacity-90">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {profile.employeeCode}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm ${profile.status === 'Active' ? 'bg-green-500/80' : 'bg-slate-500/80'}`}>
                    {profile.status}
                </span>
            </div>
        </div>
      </div>

      {/* Grid Thông tin chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Cột 1: Thông tin công việc */}
        <InfoCard title="Thông tin công việc">
            <ProfileField label="Phòng ban" value={profile.department} icon={<Briefcase />} />
            <ProfileField label="Chức vụ" value={profile.jobTitle} icon={<User />} />
            <ProfileField label="Ngày bắt đầu HĐ" value={profile.contractStartDate} icon={<Calendar />} />
            <ProfileField label="Loại hình" value={profile.employmentType} />
            <ProfileField label="Loại hợp đồng" value={profile.contractType} />
        </InfoCard>

        {/* Cột 2: Thông tin liên hệ & Học vấn */}
        <InfoCard title="Liên hệ & Học vấn">
            <ProfileField label="Email công ty" value={profile.companyEmail} icon={<Mail />} />
            <ProfileField label="Email cá nhân" value={profile.personalEmail} icon={<Mail />} />
            <ProfileField label="Số điện thoại" value={displayPhone} icon={<Phone />} />
            <ProfileField label="Địa chỉ hiện tại" value={profile.currentAddress} icon={<MapPin />} />
            <div className="pt-4 border-t border-slate-100">
                <ProfileField label="Học vấn" value={displayEducation} icon={<GraduationCap />} />
            </div>
        </InfoCard>
        
        {/* Cột 3: Thông tin cá nhân & Pháp lý */}
        <InfoCard title="Thông tin cá nhân">
            <ProfileField label="Ngày sinh" value={profile.dateOfBirth} />
            <ProfileField label="Giới tính" value={profile.gender} />
            <ProfileField label="Tình trạng hôn nhân" value={profile.maritalStatus} />
            <ProfileField label="Quốc tịch" value={profile.nationality} />
            
            <div className="border-t border-dashed border-slate-200 my-4"></div>
            
            <ProfileField label="CCCD/CMND" value={profile.citizenIdNumber} icon={<CreditCard />} />
            <ProfileField label="Mã số thuế" value={profile.personalTaxCode} />
            <ProfileField label="BHXH" value={profile.socialInsuranceNumber} />
        </InfoCard>

      </div>
    </div>
  );
}