import React, { useState, useEffect } from 'react';
import { FormRow } from '../../../components/common/FormRow'; 
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import { givePoints } from '../../../Services/rewardService';
import { HRService } from '../../../Services/employees'; 

const ManagerGivePointsPage = () => {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ employeeId: '', points: '', reason: '' });
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                // --- BƯỚC 1: LẤY MANAGER CODE ---
                // Dựa trên log của bạn, key 'employeeCode' có sẵn trong localStorage
                let currentManagerCode = localStorage.getItem('employeeCode');

                // Nếu không thấy, thử lấy từ Token (phòng hờ) với key chuẩn SOAP
                if (!currentManagerCode) {
                    const token = localStorage.getItem('token');
                    if (token) {
                        try {
                            const base64Url = token.split('.')[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => 
                                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                            ).join(''));
                            const payload = JSON.parse(jsonPayload);
                            
                            // Lấy key dài ngoằng từ log bạn gửi
                            currentManagerCode = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
                        } catch (e) {
                            console.error("Error parsing token fallback", e);
                        }
                    }
                }

                if (!currentManagerCode) {
                    setToast({ type: 'error', message: 'Lỗi xác thực: Không tìm thấy mã nhân viên.' });
                    return;
                }

                console.log("Manager Code identified:", currentManagerCode);

                // --- BƯỚC 2: TẢI DATA & LỌC ---
                const res = await HRService.fetchAllEmployees({ pageIndex: 1, pageSize: 1000 }); 
                const allEmployees = res.data?.items || res.data || [];

                // Tìm thông tin Manager để lấy DepartmentId
                const managerProfile = allEmployees.find(e => e.employeeCode === currentManagerCode);

                if (managerProfile) {
                    const departmentEmployees = allEmployees.filter(emp => 
                        emp.departmentId === managerProfile.departmentId && 
                        emp.id !== managerProfile.id
                    );
                    setEmployees(departmentEmployees);
                } else {
                    console.warn("Không tìm thấy hồ sơ Manager trong danh sách nhân viên.");
                    setToast({ type: 'error', message: 'Không tìm thấy thông tin phòng ban của bạn.' });
                }

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await givePoints(formData);
            setToast({ type: 'success', message: 'Points awarded successfully!' });
            setFormData({ employeeId: '', points: '', reason: '' });
        } catch (error) {
            setToast({ type: 'error', message: 'An error occurred. Please try again.' });
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto fade-in-up">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Give Reward Points</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormRow label="Select Employee (Same Dept)" required>
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                            value={formData.employeeId}
                            onChange={e => setFormData({...formData, employeeId: e.target.value})}
                            required
                        >
                            <option value="">-- Select Employee --</option>
                            {employees.length > 0 ? (
                                employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.employeeName} - {emp.employeeCode}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No employees found in your department</option>
                            )}
                        </select>
                    </FormRow>

                    <FormRow label="Points Amount" required>
                        <input 
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            value={formData.points}
                            onChange={e => setFormData({...formData, points: e.target.value})}
                            min="1"
                            placeholder="Ex: 50"
                            required
                        />
                    </FormRow>

                    <FormRow label="Reason for Reward" required>
                        <textarea 
                            className="w-full p-2.5 border border-gray-300 rounded h-32 resize-none focus:outline-none focus:border-blue-500"
                            value={formData.reason}
                            onChange={e => setFormData({...formData, reason: e.target.value})}
                            placeholder="Enter detailed reason..."
                            required
                        />
                    </FormRow>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" variant="primary" className="px-6">
                            Submit Reward
                        </Button>
                    </div>
                </form>
            </div>
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default ManagerGivePointsPage;