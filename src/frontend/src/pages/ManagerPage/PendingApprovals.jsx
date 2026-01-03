import React, { useEffect, useState, useCallback } from "react";
import { Eye, Calendar, Clock, LogOut, FileText } from 'lucide-react';
import './PendingApprovals.css';
import Layout from '../../components/layout/Layout'; 
import StatsGrid from '../../components/common/StatsGrid';
import FilterBar from '../../components/common/FilterBar';
import DetailModal from '../../components/features/request/DetailModal';
import Pagination from '../../components/common/Pagination'; 
import StatusBadge from '../../components/common/StatusBadge'; 

const API_BASE = "/api/v1";
const PAGE_SIZE = 10;

const getTypeConfig = (typeStr) => {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('leave')) return { label: 'Leave', icon: <Calendar size={18}/>, colorClass: 'bg-blue', apiDetailPath: 'getdetail-leave-requests', apiApprovePath: 'leave-requests' };
    if (t.includes('overtime')) return { label: 'Overtime', icon: <Clock size={18}/>, colorClass: 'bg-orange', apiDetailPath: 'getdetail-overtime-requests', apiApprovePath: 'overtime-requests' };
    if (t.includes('resignation')) return { label: 'Resignation', icon: <LogOut size={18}/>, colorClass: 'bg-red', apiDetailPath: 'getdetail-resignation-requests', apiApprovePath: 'resignation-requests' };
    return { label: typeStr, icon: <FileText size={18}/>, colorClass: 'bg-gray', apiDetailPath: 'requests', apiApprovePath: 'requests' };
};

// 👇 [CẬP NHẬT MỚI] Cộng thủ công 7 tiếng
const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "--";

        // Cộng thêm 7 giờ
        date.setTime(date.getTime() + 7 * 60 * 60 * 1000);

        return date.toLocaleString('en-GB', { 
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    } catch { return "--"; }
};

export default function PendingApprovals() {
  const [stats, setStats] = useState({ totalRequests: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [deptId, setDeptId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReq, setSelectedReq] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/departments`).then(res => res.ok ? res.json() : []).then(setDepartments).catch(console.error);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (deptId) params.append('DepartmentId', deptId);
      const query = params.toString();

      const [summaryRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/requests/dashboard/summary?${query}`),
        fetch(`${API_BASE}/requests/dashboard?${query}`)
      ]);

      if (summaryRes.ok) setStats(await summaryRes.json());
      if (listRes.ok) {
        const listData = await listRes.json();
        let items = listData.items || [];
        items.sort((a, b) => {
            const isPendingA = a.status?.toUpperCase() === 'PENDING';
            const isPendingB = b.status?.toUpperCase() === 'PENDING';
            if (isPendingA && !isPendingB) return -1;
            if (!isPendingA && isPendingB) return 1;
            return new Date(b.effectiveDate || 0) - new Date(a.effectiveDate || 0);
        });
        setRequests(items);
        setCurrentPage(1);
      }
    } catch (error) { console.error("Error:", error); } 
    finally { setLoading(false); }
  }, [keyword, deptId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDashboardData(), 500);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  const indexOfLastRequest = currentPage * PAGE_SIZE;
  const indexOfFirstRequest = indexOfLastRequest - PAGE_SIZE;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / PAGE_SIZE);

  return (
    <Layout>
      <div className="pa-container">
        <div className="pa-header">
          <div className="pa-title"><h1>Request Management</h1><p>Centralized Approval Dashboard</p></div>
        </div>

        <StatsGrid stats={stats} />
        <FilterBar keyword={keyword} setKeyword={setKeyword} deptId={deptId} setDeptId={setDeptId} departments={departments} />

        <div className="table-container">
          <div className="table-responsive">
            <table className="pa-table">
              <thead><tr><th>Request Type</th><th>Employee</th><th>Department</th><th>Decided / Effective</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {loading ? ( <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>Loading data...</td></tr> ) : 
                 requests.length === 0 ? ( <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No requests found.</td></tr> ) : (
                  currentRequests.map((req) => {
                    const conf = getTypeConfig(req.requestType);
                    return (
                      <tr key={req.requestCode}>
                        <td><div className="cell-type"><div className={`type-icon ${conf.colorClass}`}>{conf.icon}</div><div><div className="fw-600">{req.requestCode}</div><div className="sub-text">{conf.label}</div></div></div></td>
                        <td><div className="user-cell"><div className="avatar-small">{req.employee?.fullName?.charAt(0)}</div><div><div className="fw-600">{req.employee?.fullName}</div><div className="sub-text">ID: {req.employee?.id}</div></div></div></td>
                        <td>{req.employee?.departmentName}</td>
                        <td><div className="date-cell"><div className="date-row"><span className="date-label">Decided:</span> <span className="date-val" style={{color: req.decidedAt?'#0f172a':'#94a3b8'}}>{formatDate(req.decidedAt)}</span></div><div className="date-row"><span className="date-label">Eff:</span> <span className="date-val">{formatDate(req.effectiveDate)}</span></div></div></td>
                        <td><StatusBadge status={req.status}/></td>
                        <td><button className="btn-view" onClick={() => setSelectedReq(req)}><Eye size={18}/></button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
        
        {selectedReq && <DetailModal req={selectedReq} typeConfig={getTypeConfig(selectedReq.requestType)} onClose={() => setSelectedReq(null)} onRefresh={fetchDashboardData} />}
      </div>
    </Layout>
  );
}