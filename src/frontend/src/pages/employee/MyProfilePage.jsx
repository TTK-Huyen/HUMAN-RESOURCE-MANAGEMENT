import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../services/api';
import ProfileView from '../../components/ProfileView';

const MyProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // TODO: Lấy mã NV từ Token sau khi Login. 
    // Hardcode "NV001" để test (Đảm bảo trong DB đã có user có EmployeeCode là NV001)
    const currentEmployeeCode = "NV001"; 

    useEffect(() => {
        EmployeeService.getProfile(currentEmployeeCode)
            .then(res => {
                const apiData = res.data;
                
                // --- MAPPING DỮ LIỆU ---
                // Backend trả về camelCase (fullName), Component cũ dùng (employeeName)
                // Ta map lại để giao diện hiển thị đúng mà không cần sửa file ProfileView.jsx
                const mappedProfile = {
                    employeeCode: apiData.employeeCode,
                    employeeName: apiData.fullName,        // Map: fullName -> employeeName
                    dob: apiData.dateOfBirth ? new Date(apiData.dateOfBirth).toLocaleDateString('vi-VN') : "",
                    gender: apiData.gender,
                    nationality: "Việt Nam",               // Backend chưa có trường này, hardcode tạm
                    
                    companyEmail: apiData.companyEmail,
                    personalEmail: apiData.personalEmail,
                    phone: apiData.phoneNumber,            // Map: phoneNumber -> phone
                    address: apiData.currentAddress,       // Map: currentAddress -> address
                    
                    citizenId: apiData.citizenId,
                    taxCode: apiData.personalTaxCode,      // Map: personalTaxCode -> taxCode
                    socialInsurance: "",                   // Backend chưa trả về trường này
                    maritalStatus: "",                     // Backend chưa trả về trường này
                    
                    bankName: "Ngân hàng mặc định",        // Backend chỉ trả về số TK
                    bankAccount: apiData.bankAccount,
                    bankHolder: apiData.fullName,
                    
                    department: apiData.departmentName,    // Map: departmentName -> department
                    jobTitle: apiData.jobTitle,
                    employmentType: "Full-time",
                    managerId: "",
                    
                    contractStart: "",
                    contractEnd: "",
                    contractType: apiData.contractType || "Hợp đồng lao động"
                };

                setProfile(mappedProfile);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải hồ sơ:", err);
                setLoading(false);
                // Có thể thêm thông báo lỗi ở đây
            });
    }, []);

    if (loading) return <div className="p-6">Đang tải dữ liệu từ hệ thống...</div>;
    if (!profile) return <div className="p-6 text-red-500">Không tìm thấy thông tin hồ sơ. Vui lòng kiểm tra lại kết nối.</div>;

    return (
        <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto my-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
                <button 
                    onClick={() => navigate('/employee/profile/update-request')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                    Gửi yêu cầu cập nhật
                </button>
            </div>
            <ProfileView profile={profile} />
        </div>
    );
};

export default MyProfilePage;