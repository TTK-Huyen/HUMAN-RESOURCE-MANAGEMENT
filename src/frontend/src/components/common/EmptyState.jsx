import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({ message = "No data found", subMessage = "Try adjusting your search or filters" }) => {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: 8, border: '1px dashed #e2e8f0' }}>
      <div style={{ background: '#e2e8f0', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <SearchX size={32} color="#94a3b8" />
      </div>
      <h3 style={{ margin: '0 0 4px', color: '#334155' }}>{message}</h3>
      <p style={{ margin: 0, fontSize: 13 }}>{subMessage}</p>
    </div>
  );
};

export default EmptyState;