// src/frontend/src/pages/ManagerPage/Reward/ManagerGivePointsPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../../components/layout/Layout'; // Hoặc LayoutManager tùy cấu trúc
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import { givePoints } from '../../../Services/rewardService';
import { getEmployees } from '../../../Services/employees'; // Giả định đã có service này

const ManagerGivePointsPage = () => {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employeeId: '',
        points: '',
        reason: ''
    });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Load danh sách nhân viên thuộc team của Manager để chọn
        const fetchTeam = async () => {
            try {
                // API giả định lấy danh sách nhân viên
                const res = await getEmployees(); 
                setEmployees(res.data?.items || []); // Điều chỉnh tùy theo response của API employees
            } catch (err) {
                console.error(err);
            }
        };
        fetchTeam();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await givePoints(formData.employeeId, formData.points, formData.reason);
            setToast({ type: 'success', message: 'Đã tặng điểm thành công!' });
            setFormData({ employeeId: '', points: '', reason: '' }); // Reset form
        } catch (error) {
            setToast({ type: 'error', message: 'Lỗi khi tặng điểm. Vui lòng kiểm tra lại.' });
        }
    };

    return (
        <Layout>
            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <h2>Quản lý Khen Thưởng Nhân Viên</h2>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Chọn Nhân viên:</label>
                            <select 
                                style={{ width: '100%', padding: '8px' }}
                                value={formData.employeeId}
                                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                required
                            >
                                <option value="">-- Chọn nhân viên --</option>
                                {employees.map(emp => (
                                    <option key={emp.employeeId} value={emp.employeeId}>
                                        {emp.fullName} ({emp.employeeCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Số điểm thưởng:</label>
                            <input 
                                type="number" 
                                style={{ width: '100%', padding: '8px' }}
                                value={formData.points}
                                onChange={(e) => setFormData({...formData, points: e.target.value})}
                                min="1"
                                placeholder="VD: 100"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Lý do / Lời nhắn:</label>
                            <textarea 
                                style={{ width: '100%', padding: '8px', minHeight: '100px' }}
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                placeholder="VD: Hoàn thành xuất sắc dự án X..."
                                required
                            />
                        </div>

                        <Button variant="primary" type="submit">Xác nhận Tặng điểm</Button>
                    </form>
                </div>
            </div>
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </Layout>
    );
};

export default ManagerGivePointsPage;