import React, { useState, useEffect } from 'react';
import { FormRow } from '../../../components/common/FormRow'; 
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import { givePoints } from '../../../Services/rewardService';
import { HRService } from '../../../Services/employees'; // Lấy service nhân viên có sẵn

const ManagerGivePointsPage = () => {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ employeeId: '', points: '', reason: '' });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Tái sử dụng HRService để lấy danh sách nhân viên
                const res = await HRService.getAllEmployees({ pageIndex: 1, pageSize: 100 }); 
                setEmployees(res.data?.items || []); 
            } catch (error) {
                console.error("Lỗi tải danh sách nhân viên", error);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await givePoints(formData);
            setToast({ type: 'success', message: 'Đã tặng điểm thành công!' });
            setFormData({ employeeId: '', points: '', reason: '' });
        } catch (error) {
            setToast({ type: 'error', message: 'Có lỗi xảy ra. Vui lòng thử lại.' });
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto fade-in-up">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Tặng Điểm Thưởng (Bonus)</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormRow label="Chọn nhân viên" required>
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded bg-white focus:border-blue-500 outline-none"
                            value={formData.employeeId}
                            onChange={e => setFormData({...formData, employeeId: e.target.value})}
                            required
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {employees.map(emp => (
                                <option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.fullName} - {emp.employeeCode}
                                </option>
                            ))}
                        </select>
                    </FormRow>

                    <FormRow label="Số điểm thưởng" required>
                        <input 
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none"
                            value={formData.points}
                            onChange={e => setFormData({...formData, points: e.target.value})}
                            min="1"
                            placeholder="VD: 50"
                            required
                        />
                    </FormRow>

                    <FormRow label="Lý do khen thưởng" required>
                        <textarea 
                            className="w-full p-2.5 border border-gray-300 rounded h-32 resize-none focus:border-blue-500 outline-none"
                            value={formData.reason}
                            onChange={e => setFormData({...formData, reason: e.target.value})}
                            placeholder="Nhập lý do chi tiết..."
                            required
                        />
                    </FormRow>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" variant="primary" className="px-6">
                            Xác nhận Tặng
                        </Button>
                    </div>
                </form>
            </div>
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default ManagerGivePointsPage;