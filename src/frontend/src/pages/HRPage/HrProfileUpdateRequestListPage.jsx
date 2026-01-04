import React, { useEffect, useState } from 'react';
import { HRService } from '../../Services/employees.js';
import { useNavigate } from "react-router-dom";

const HrProfileUpdateRequestListPage = () => {
    const navigate = useNavigate(); 
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ CÁCH SỬA: Đưa hàm fetch vào bên trong useEffect để tránh dependency warning
    useEffect(() => {
        let isMounted = true; // Cờ kiểm tra component còn tồn tại không

        const fetchRequests = async () => {
            try {
                const res = await HRService.getUpdateRequests({ status: 'PENDING' });
                if (isMounted && res.data) {
                    setRequests(res.data);
                }
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchRequests();

        return () => { isMounted = false; }; // Cleanup function
    }, []); // 👈 Mảng rỗng: Đảm bảo chỉ chạy 1 lần duy nhất

    // ... (Phần render giữ nguyên)
    
    if (loading) return <div>Loading...</div>;

    return (
       // ... Code render bảng (như cũ)
       <div className="p-6">
           {/* ... */}
           <table className="min-w-full bg-white border shadow-sm">
               {/* ... */}
           </table>
       </div>
    );
};

export default HrProfileUpdateRequestListPage;