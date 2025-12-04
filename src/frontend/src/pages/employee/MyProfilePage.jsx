import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../services/api';
import ProfileView from '../../components/ProfileView';

const MyProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    
    // TODO: Lấy mã NV từ Token sau khi đăng nhập. Hardcode tạm để test.
    const currentEmployeeCode = "NV001"; 

    useEffect(() => {
        // Mock data for testing - replace with real API call when backend is ready
        const mockProfile = {
            employee_code: "NV001",
            full_name: "Trần Thị Mỹ",
            date_of_birth: "1995-05-15",
            gender: "Female",
            department_name: "IT Department",
            job_title: "Software Engineer",
            company_email: "my.tran@company.com",
            personal_email: "mythran@gmail.com",
            phone_number: "0912345678",
            current_address: "123 Main St, Ho Chi Minh City",
            citizen_id: "123456789",
            personal_tax_code: "9876543210",
            bank_account: "987654321098765"
        };
        setProfile(mockProfile);

        // Uncomment below to use real API when backend is running
        /*
        EmployeeService.getProfile(currentEmployeeCode)
            .then(res => setProfile(res.data))
            .catch(err => {
                console.error("Error loading profile:", err);
                // Fallback to mock data on error
                setProfile(mockProfile);
            });
        */
    }, []);

    return (
        <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto my-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <button 
                    onClick={() => navigate('/employee/profile/update-request')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                    Request Profile Update
                </button>
            </div>
            <ProfileView profile={profile} />
        </div>
    );
};

export default MyProfilePage;