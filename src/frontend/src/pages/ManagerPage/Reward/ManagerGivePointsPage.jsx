import React, { useState, useEffect } from 'react';
import { FormRow } from '../../../components/common/FormRow'; 
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import { givePoints } from '../../../Services/rewardService';
// FIX 1: Import đúng service
import { HRService } from '../../../Services/employees'; 

const ManagerGivePointsPage = () => {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ employeeId: '', points: '', reason: '' });
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                // FIX 2: Gọi đúng hàm fetchAllEmployees
                // FIX 3: Tham số thường là Page/PageSize (theo chuẩn .NET BE)
                const res = await HRService.fetchAllEmployees({ Page: 1, PageSize: 1000 }); 
                
                // FIX 4: Xử lý dữ liệu trả về an toàn (API có thể trả về res.data hoặc res.items)
                // Dựa trên code cũ của bạn: response.data là array
                const list = Array.isArray(res) ? res : (res.data || res.items || []);
                setEmployees(list);
            } catch (error) {
                console.error("Lỗi tải danh sách nhân viên:", error);
                setToast({ type: 'error', message: 'Không thể tải danh sách nhân viên.' });
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await givePoints(formData);
            setToast({ type: 'success', message: 'Đã tặng điểm thành công!' });
            setFormData({ employeeId: '', points: '', reason: '' });
        } catch (error) {
            console.error(error);
            setToast({ type: 'error', message: 'Lỗi khi tặng điểm. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto fade-in-up">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Tặng Điểm Thưởng (Bonus)</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormRow label="Chọn nhân viên" required>
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                            value={formData.employeeId}
                            onChange={e => setFormData({...formData, employeeId: e.target.value})}
                            required
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {employees.map(emp => (
                                // FIX 5: Kiểm tra kỹ key và value. Thường Backend trả về 'id' (int)
                                <option key={emp.id || emp.employeeId} value={emp.id || emp.employeeId}>
                                    {emp.fullName || emp.employeeName} ({emp.employeeCode})
                                </option>
                            ))}
                        </select>
                    </FormRow>

                    <FormRow label="Số điểm thưởng" required>
                        <input 
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            value={formData.points}
                            onChange={e => setFormData({...formData, points: e.target.value})}
                            min="1"
                            max="10000"
                            placeholder="VD: 100"
                            required
                        />
                    </FormRow>

                    <FormRow label="Lý do khen thưởng" required>
                        <textarea 
                            className="w-full p-2.5 border border-gray-300 rounded h-32 resize-none focus:outline-none focus:border-blue-500"
                            value={formData.reason}
                            onChange={e => setFormData({...formData, reason: e.target.value})}
                            placeholder="Nhập lý do chi tiết..."
                            required
                        />
                    </FormRow>

                    <div className="flex justify-end pt-4">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="px-6"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận Tặng'}
                        </Button>
                    </div>
                </form>
            </div>
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default ManagerGivePointsPage;