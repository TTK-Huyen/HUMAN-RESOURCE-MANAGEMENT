import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCampaignDetail } from "../../../Services/campaigns";
import Loading from "../../../components/common/Loading";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import { ArrowLeft, Calendar, Users, Info } from 'lucide-react';

export default function CampaignDetail() {
  const { id: campaignCode } = useParams();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    fetchCampaignDetail(campaignCode).then(setCampaign).catch(() => setCampaign(null));
  }, [campaignCode]);

  const fmt = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleString('vi-VN'); } catch { return d; }
  };

  if (!campaign) return <Loading fullScreen text="Đang tải chi tiết chiến dịch..." />;

  const max = campaign.maxParticipants;
  const current = campaign.currentParticipants ?? 0;
  const percent = max ? Math.min(100, Math.round((current / max) * 100)) : null;
  const isFull = max ? current >= max : false;

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <Link to="/employee/campaigns" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#334155' }}>
          <ArrowLeft size={18} /> Quay lại
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <StatusBadge status={campaign.status} />
          <Button variant="primary" onClick={() => alert(isFull ? 'Chiến dịch đã đầy.' : 'Chức năng đăng ký sẽ được triển khai sau')} disabled={isFull}>
            {isFull ? 'Đã đầy' : 'Đăng ký'}
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 6 }}>
        <h1 style={{ margin: 0, color: '#0b1220', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{campaign.campaignName}</h1>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Mã chiến dịch:</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>{campaign.campaignCode}</span>
        </div>
      </div>
      <p style={{ color: '#475569', marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>{campaign.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginTop: 18 }}>
        <div>
          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: '8px 0', color: '#0b1220', textTransform: 'uppercase', fontSize: 13, letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 6, height: 24, background: '#3b82f6', display: 'inline-block', marginRight: 10, borderRadius: 4 }}></span>
              <Calendar size={16} style={{ marginRight: 8 }} /> Ngày
            </h3>
            <div style={{ color: '#475569' }}>
              <div><strong>Thông báo:</strong> {fmt(campaign.announcementDate)}</div>
              <div><strong>Bắt đầu:</strong> {fmt(campaign.startDate)}</div>
              <div><strong>Kết thúc:</strong> {fmt(campaign.endDate)}</div>
            </div>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: '8px 0', color: '#0b1220', textTransform: 'uppercase', fontSize: 13, letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 6, height: 24, background: '#10b981', display: 'inline-block', marginRight: 10, borderRadius: 4 }}></span>
              <Users size={16} style={{ marginRight: 8 }} /> Người tham gia
            </h3>
            <div style={{ color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>{current}</strong> / {max ?? 'Không giới hạn'}</div>
                {percent !== null && <div style={{ color: '#94a3b8' }}>{percent}%</div>}
              </div>

              {/* Progress bar */}
              <div style={{ height: 10, background: '#e6eefc', borderRadius: 8, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: percent ? `${percent}%` : '100%', height: '100%', background: isFull ? '#ef4444' : '#3b82f6' }} />
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: '8px 0', color: '#0b1220', textTransform: 'uppercase', fontSize: 13, letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 6, height: 24, background: '#f59e0b', display: 'inline-block', marginRight: 10, borderRadius: 4 }}></span>
              <Info size={16} style={{ marginRight: 8 }} /> Quy tắc & Phần thưởng
            </h3>
            <div style={{ color: '#475569', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Quy tắc đăng ký</strong>
                <div style={{ marginTop: 6 }}>{campaign.registrationRules ?? 'Không có quy tắc cụ thể.'}</div>
              </div>

              <div>
                <strong>Phần thưởng</strong>
                <div style={{ marginTop: 6 }}>{campaign.rewardDescription ?? 'Chưa có thông tin phần thưởng.'}</div>
              </div>
            </div>
          </section>

        </div>

        <aside style={{ borderLeft: '1px solid #eef2f7', paddingLeft: 18 }}>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mã chiến dịch</div>
            <div style={{ fontWeight: 800, color: '#0b1220', fontSize: 16 }}>{campaign.campaignCode}</div>
          </div>

          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Trạng thái</div>
            <div style={{ marginTop: 6 }}><StatusBadge status={campaign.status} /></div>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(2,6,23,0.03)' }}>
            <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ngày tạo</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{fmt(campaign.createdAt)}</div>
          </div>
        </aside>
      </div>

    </div>
  );
}
