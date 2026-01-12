import React, { useState } from 'react';
import { 
  Users, Clock, CheckCircle, XCircle, Eye, 
  Search, Filter, Calendar, FileText, ChevronRight 
} from 'lucide-react';

// --- MOCK DATA (Dữ liệu giả lập) ---

const ManagerDashboard = () => {
  const [requests, setRequests] = useState(MOCK_DATA);
  const [selectedReq, setSelectedReq] = useState(null); // State cho Modal
  const [filterDept, setFilterDept] = useState('');
  const [searchId, setSearchId] = useState('');

  // Xử lý lọc
  const filteredData = requests.filter(item => {
    return (
      (filterDept === '' || item.department.includes(filterDept)) &&
      (searchId === '' || item.employeeId.toLowerCase().includes(searchId.toLowerCase()) || item.employeeName.toLowerCase().includes(searchId.toLowerCase()))
    );
  });

  // Helper render status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock size={12}/> Pending</span>;
      case 'approved': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle size={12}/> Approved</span>;
      case 'rejected': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1"><XCircle size={12}/> Rejected</span>;
      default: return null;
    }
  };

  // Helper render type icon
  const getTypeIcon = (typeCode) => {
     if(typeCode === 'leave') return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={16}/></div>
     if(typeCode === 'overtime') return <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock size={16}/></div>
     return <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText size={16}/></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Requests Dashboard</h1>
        <p className="text-slate-500">Hello Manager, you have 2 requests pending approval today.</p>
      </div>

      {/* 1. THỐNG KÊ (STATS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Requests</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">124</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><FileText size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">12</p>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><Clock size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">98</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckCircle size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-1">14</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full"><XCircle size={24} /></div>
        </div>
      </div>

      {/* 2. BỘ LỌC (FILTERS) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 border px-3 py-2 rounded-lg bg-gray-50 flex-1 min-w-[200px]">
          <Search size={18} className="text-slate-400"/>
          <input 
            type="text" 
            placeholder="Search by name or employee ID..." 
            className="bg-transparent outline-none text-sm w-full"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 border px-3 py-2 rounded-lg bg-gray-50 w-64">
          <Filter size={18} className="text-slate-400"/>
          <select 
            className="bg-transparent outline-none text-sm w-full text-slate-600"
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">All departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
        
        <button className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg font-medium hover:bg-slate-700 transition">
          Export report
        </button>
      </div>

      {/* 3. BẢNG DỮ LIỆU (DATA TABLE) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="p-4 border-b">Request Info</th>
              <th className="p-4 border-b">Employee</th>
              <th className="p-4 border-b">Department</th>
              <th className="p-4 border-b">Dates</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(req.typeCode)}
                    <div>
                        <div className="font-semibold text-slate-700 text-sm">{req.type}</div>
                        <div className="text-xs text-blue-500 hover:underline cursor-pointer">{req.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={req.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-slate-700">{req.employeeName}</div>
                      <div className="text-xs text-slate-400">{req.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{req.department}</td>
                <td className="p-4">
                    <div className="text-xs">
                        <span className="text-slate-400">Sub:</span> {req.submittedDate} <br/>
                        <span className="text-slate-400">Eff:</span> <span className="font-medium text-slate-700">{req.effectiveDate}</span>
                    </div>
                </td>
                <td className="p-4">{getStatusBadge(req.status)}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => setSelectedReq(req)}
                    className="text-slate-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500">No requests found.</div>
        )}
      </div>

      {/* 4. MODAL CHI TIẾT (DETAIL MODAL) */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end transition-opacity">
          {/* Drawer Effect: trượt từ phải sang */}
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Chi tiết yêu cầu</h2>
                <span className="text-sm text-slate-500">{selectedReq.id}</span>
              </div>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-800">
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              
              {/* Employee Card */}
              <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
                 <img src={selectedReq.avatar} alt="" className="w-12 h-12 rounded-full"/>
                 <div>
                    <h3 className="font-bold text-slate-800">{selectedReq.employeeName}</h3>
                    <p className="text-sm text-slate-500">{selectedReq.department} • {selectedReq.employeeId}</p>
                 </div>
              </div>

              {/* Request Details */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-slate-500">Request type</div>
                    <div className="font-medium text-slate-800 text-right">{selectedReq.type}</div>
                    
                    <div className="text-slate-500">Submitted</div>
                    <div className="font-medium text-slate-800 text-right">{selectedReq.submittedDate}</div>
                    
                    <div className="text-slate-500">Effective date</div>
                    <div className="font-medium text-slate-800 text-right">{selectedReq.effectiveDate}</div>

                    <div className="text-slate-500">Status</div>
                    <div className="flex justify-end">{getStatusBadge(selectedReq.status)}</div>
                </div>
                <div className="mt-4">
                    <div className="text-slate-500 text-sm mb-1">Reason:</div>
                    <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded border border-slate-100">
                      Requesting leave for family matters. Please approve.
                    </p>
                </div>
              </div>

              {/* Approval Log Timeline */}
              <div>
                 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Approval Log</h4>
                 <div className="space-y-0 relative border-l-2 border-slate-200 ml-2 pl-6 pb-2">
                    {selectedReq.logs.map((log, index) => (
                        <div key={index} className="mb-6 relative">
                            <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white box-content"></div>
                            <p className="text-xs text-slate-400">{log.time}</p>
                            <p className="text-sm font-medium text-slate-800">{log.action}</p>
                            <p className="text-xs text-slate-500">By: {log.user}</p>
                        </div>
                    ))}
                    {selectedReq.status === 'pending' && (
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white box-content animate-pulse"></div>
                            <p className="text-sm text-yellow-600 font-medium italic">Pending...</p>
                        </div>
                    )}
                 </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            {selectedReq.status === 'pending' ? (
                <div className="mt-8 pt-4 border-t flex gap-3">
                    <button className="flex-1 py-3 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition">
                        Từ chối (Reject)
                    </button>
                    <button className="flex-1 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 shadow-md shadow-green-200 transition">
                        Duyệt (Approve)
                    </button>
                </div>
            ) : (
                <div className="mt-8 pt-4 border-t text-center text-slate-400 text-sm">
                    Yêu cầu này đã hoàn tất, không thể thao tác.
                </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;