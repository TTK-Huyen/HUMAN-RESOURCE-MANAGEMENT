import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCampaigns } from "../../../Services/campaigns";
import { PlusCircle, Info, Calendar, Search } from "lucide-react";
import Loading from "../../../components/common/Loading";
import EmptyState from "../../../components/common/EmptyState";
import Pagination from "../../../components/common/Pagination";

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6; // cards per page

  // Filters
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Đang chờ" },
    { value: "UPCOMING", label: "Sắp diễn ra" },
    { value: "ONGOING", label: "Đang diễn ra" },
    { value: "FINISHED", label: "Đã kết thúc" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const load = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCampaigns(filters);
      setCampaigns(data || []);
      // if loaded data changes, ensure current page is valid
      setCurrentPage(1);
    } catch (ex) {
      console.error(ex);
      setError(ex?.message || "Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    load();
  }, []);

  // Live update filters: debounce to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      const filters = {};
      if (keyword) filters.name = keyword;
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      load(filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [keyword, status, startDate, endDate]);

  const resetFilters = () => {
    setKeyword("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    load();
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : "-");

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil((campaigns.length || 0) / PAGE_SIZE));
  const displayedCampaigns = campaigns.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1100, margin: "20px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0, color: "#0b1220", fontSize: 24, fontWeight: 800 }}>Chiến dịch</h1>
      </div>

      {/* Filter Panel - now updates immediately on change (debounced) */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 10, boxShadow: '0 6px 18px rgba(2,6,23,0.04)', minWidth: 320 }}>
          <Search size={18} color="#94a3b8" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên chiến dịch" style={{ border: 'none', outline: 'none', width: '260px', fontSize: 14 }} />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #eef2f7', background: '#fff', minWidth: 160 }}>
          {statusOptions.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #eef2f7' }}>
            <Calendar size={16} color="#94a3b8" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none' }} />
          </div>
          <div style={{ color: '#94a3b8', fontWeight: 700 }}>—</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #eef2f7' }}>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none' }} />
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-reset-campaigns" onClick={resetFilters} style={{ padding: '10px 16px', borderRadius: 999, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 800, boxShadow: '0 8px 20px rgba(59,130,246,0.12)', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            Đặt lại
          </button>
          <style>{`.btn-reset-campaigns:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(59,130,246,0.16); } .btn-reset-campaigns:active { transform: translateY(0); }`}</style>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Loading fullScreen={false} text="Đang tải chiến dịch..." />
      ) : error ? (
        <div style={{ padding: 20, background: '#fff2f2', borderRadius: 8, color: '#b91c1c' }}>{error}</div>
      ) : campaigns.length === 0 ? (
        <EmptyState message="Không tìm thấy chiến dịch" subMessage="Thử xóa bộ lọc hoặc điều chỉnh tìm kiếm" />
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {displayedCampaigns.map(c => (
              <li key={c.campaignCode} className="campaign-card" style={{ border: '1px solid #e6eefc', borderRadius: 12, padding: 18, background: '#fff', boxShadow: '0 6px 18px rgba(15,23,42,0.03)', transition: 'transform 0.18s ease, box-shadow 0.18s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0b1220' }}>{c.campaignName}</h3>
                    <div style={{ color: '#64748b', fontSize: 12 }}>
                      {c.status === 'PENDING' ? 'Đang chờ' :
                      c.status === 'UPCOMING' ? 'Sắp diễn ra' :
                      c.status === 'ONGOING' ? 'Đang diễn ra' :
                      c.status === 'FINISHED' ? 'Đã kết thúc' :
                      c.status === 'CANCELLED' ? 'Đã hủy' : c.status}
                    </div>
                  </div>

                  <p style={{ marginTop: 8, color: '#475569', fontSize: 14, minHeight: 44 }}>{c.description}</p>

                  <div style={{ display: 'flex', gap: 12, marginTop: 12, color: '#475569', fontSize: 13 }}>
                    <div><strong>Từ:</strong> {fmt(c.startDate)}</div>
                    <div><strong>Đến:</strong> {fmt(c.endDate)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <PlusCircle size={14} /> Đăng ký
                  </button>
                  <Link to={`/employee/campaigns/${c.campaignCode}`} style={{ flex: 1, padding: '10px', background: '#64748b', color: 'white', border: 'none', borderRadius: 8, textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Info size={14} /> Chi tiết
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* card hover styles */}
          <style>{`.campaign-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 18px 40px rgba(15,23,42,0.12); } .campaign-card:active { transform: translateY(-2px) scale(1.0); }`}</style>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)))} />
          </div>
        </>
      )}
    </div>
  );
}
