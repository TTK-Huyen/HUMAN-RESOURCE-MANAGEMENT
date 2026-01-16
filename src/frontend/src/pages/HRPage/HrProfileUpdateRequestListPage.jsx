import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Eye, RefreshCw, Check, X, Search } from "lucide-react";
import { HRService } from '../../Services/employees.js';

// --- IMPORT COMPONENTS ---
import StatsGrid from '../../components/common/StatsGrid';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const PAGE_SIZE = 10;

const HrProfileUpdateRequestListPage = () => {
    const navigate = useNavigate();
    
    // -- State --
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
    });

    // -- Fetch Data --
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await HRService.getUpdateRequests(); 
            if (res.data) {
                const allRequests = res.data;
                setRequests(allRequests);
                
                // Calculate stats
                const newStats = {
                    totalRequests: allRequests.length,
                    pendingCount: allRequests.filter(r => r.request_status === 'PENDING').length,
                    approvedCount: allRequests.filter(r => r.request_status === 'APPROVED').length,
                    rejectedCount: allRequests.filter(r => r.request_status === 'REJECTED').length
                };
                setStats(newStats);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // -- Filter Logic --
    const filteredRequests = requests.filter(req => {
        const nameMatch = req.full_name?.toLowerCase().includes(keyword.toLowerCase());
        const codeMatch = req.employee_code?.toLowerCase().includes(keyword.toLowerCase());
        return nameMatch || codeMatch;
    });

    // -- Pagination --
    const indexOfLastRequest = currentPage * PAGE_SIZE;
    const indexOfFirstRequest = indexOfLastRequest - PAGE_SIZE;
    const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
    const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);

    // -- Render --
    return (
        <div className="pa-container fade-in-up">
            {/* Stats Grid */}
            <div style={{ marginBottom: 24 }}>
                <StatsGrid stats={stats} />
            </div>

            {/* Header & Search */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                    Profile Update Requests
                </h1>
                <p style={{ color: '#64748b', margin: 0 }}>
                    Manage and review employee profile update requests.
                </p>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: 24, display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text"
                        placeholder="Search by name or employee code..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
                <Button variant="secondary" icon={RefreshCw} onClick={fetchRequests} isLoading={loading}>
                    Refresh
                </Button>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Employee</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Request Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '32px' }}>
                                    <EmptyState message="No requests found" subMessage="Try adjusting your search criteria." />
                                </td>
                            </tr>
                        ) : (
                            currentRequests.map((req) => (
                                <tr key={req.request_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                {req.full_name?.charAt(0) || 'E'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.employee_code}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{req.full_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#0f172a' }}>
                                        {req.created_at ? new Date(req.created_at).toLocaleDateString('en-US') : '--'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <StatusBadge status={req.request_status} />
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => navigate(`/hr/profile-requests/${req.request_id}`)}
                                                disabled={req.request_status !== 'PENDING'}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: req.request_status === 'PENDING' ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                                                    color: req.request_status === 'PENDING' ? '#dc2626' : '#94a3b8',
                                                    background: 'transparent',
                                                    fontWeight: 500,
                                                    cursor: req.request_status === 'PENDING' ? 'pointer' : 'not-allowed',
                                                    fontSize: '0.8rem',
                                                    transition: 'all 0.2s',
                                                    opacity: req.request_status === 'PENDING' ? 1 : 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={(e) => req.request_status === 'PENDING' && (e.target.style.background = '#fee2e2')}
                                                onMouseLeave={(e) => req.request_status === 'PENDING' && (e.target.style.background = 'transparent')}
                                                title={req.request_status === 'PENDING' ? 'Reject request' : 'Not available'}
                                            >
                                                <X size={14} />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => navigate(`/hr/profile-requests/${req.request_id}`)}
                                                disabled={req.request_status !== 'PENDING'}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: req.request_status === 'PENDING' ? '#16a34a' : '#cbd5e1',
                                                    color: 'white',
                                                    fontWeight: 500,
                                                    cursor: req.request_status === 'PENDING' ? 'pointer' : 'not-allowed',
                                                    fontSize: '0.8rem',
                                                    transition: 'all 0.2s',
                                                    opacity: req.request_status === 'PENDING' ? 1 : 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={(e) => req.request_status === 'PENDING' && (e.target.style.background = '#15803d')}
                                                onMouseLeave={(e) => req.request_status === 'PENDING' && (e.target.style.background = '#16a34a')}
                                                title={req.request_status === 'PENDING' ? 'Approve request' : 'Not available'}
                                            >
                                                <Check size={14} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => navigate(`/hr/profile-requests/${req.request_id}`)}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e2e8f0',
                                                    color: '#0f172a',
                                                    background: 'white',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                                                onMouseLeave={(e) => e.target.style.background = 'white'}
                                                title="View details"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredRequests.length > PAGE_SIZE && (
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* CSS Support */}
            <style>{`
                .pa-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
                .fade-in-up { animation: fadeInUp 0.3s ease-out; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default HrProfileUpdateRequestListPage;
