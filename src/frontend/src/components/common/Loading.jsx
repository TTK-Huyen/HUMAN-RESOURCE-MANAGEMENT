import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ fullScreen = false, text = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', zIndex: 9999
      }}>
        <Loader2 className="spin-animation" size={48} color="#3b82f6" />
        <span style={{ marginTop: 10, color: '#64748b', fontWeight: 500 }}>{text}</span>
        <style>{`.spin-animation { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  
  // Loading nhỏ gọn dùng trong thẻ div hoặc nút bấm
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#94a3b8' }}>
       <Loader2 className="spin-animation" size={24} style={{ marginRight: 8 }} />
       <span>{text}</span>
       <style>{`.spin-animation { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Loading;