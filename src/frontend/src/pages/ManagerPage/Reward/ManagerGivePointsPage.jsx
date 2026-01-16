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
    const [employeeSearch, setEmployeeSearch] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                let currentManagerCode = localStorage.getItem('employeeCode');

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

                const res = await HRService.fetchAllEmployees({ pageIndex: 1, pageSize: 1000 }); 
                const allEmployees = res.data?.items || res.data || [];

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
        try {
            await givePoints(formData);
            setToast({ type: 'success', message: 'Points awarded successfully!' });
            setFormData({ employeeId: '', points: '', reason: '' });
            setEmployeeSearch('');
        } catch (error) {
            setToast({ type: 'error', message: 'An error occurred. Please try again.' });
        }
    };

    // Filter employees based on search
    const filteredEmployees = employees.filter(emp =>
        emp.employeeName.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    return (
        <div className="p-6 max-w-3xl mx-auto fade-in-up">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Give Reward Points</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormRow label="Select Employee (Same Dept)" required>
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Search and select employee..."
                                className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none"
                                value={employeeSearch}
                                onChange={e => setEmployeeSearch(e.target.value)}
                                list="employeeList"
                            />
                            <datalist id="employeeList">
                                {filteredEmployees.map(emp => (
                                    <option key={emp.id} value={`${emp.employeeName} - ${emp.employeeCode}`} data-id={emp.id} />
                                ))}
                            </datalist>
                            {employeeSearch && filteredEmployees.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b z-10 max-h-48 overflow-y-auto">
                                    {filteredEmployees.map(emp => (
                                        <div 
                                            key={emp.id}
                                            className="p-2.5 hover:bg-blue-50 cursor-pointer text-sm"
                                            onClick={() => {
                                                setFormData({...formData, employeeId: emp.id});
                                                setEmployeeSearch(`${emp.employeeName} - ${emp.employeeCode}`);
                                            }}
                                        >
                                            {emp.employeeName} - {emp.employeeCode}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormRow>

                    <FormRow label="Points Amount" required>
                        <input 
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none"
                            value={formData.points}
                            onChange={e => setFormData({...formData, points: e.target.value})}
                            min="1"
                            placeholder="Ex: 50"
                            required
                        />
                    </FormRow>

                    <FormRow label="Reason for Reward" required>
                        <textarea 
                            className="w-full p-2.5 border border-gray-300 rounded h-32 resize-none focus:border-blue-500 outline-none"
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