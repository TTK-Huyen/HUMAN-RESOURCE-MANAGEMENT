// HRDirectoryPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HRService } from "../../Services/employees.js";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  X,
  UserPlus,
  FileSpreadsheet,
  MoreHorizontal
} from "lucide-react";

export default function HRDirectoryPage() {
  // State quản lý danh sách và phân trang
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
  });

  // State quản lý bộ lọc
  const [filters, setFilters] = useState({
    SearchKeyword: "",
    DepartmentId: "",
    Status: "",
    Gender: "",
    EmploymentType: "",
    SortBy: "CreatedDate",
    SortDirection: "Desc"
  });

  // State UI
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(false);
  // State dùng để debounce search keyword
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.SearchKeyword);

  const navigate = useNavigate();

  // Effect cho debounce search keyword
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(filters.SearchKeyword);
    }, 500); // Wait 500ms after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [filters.SearchKeyword]);

  // Hàm gọi API lấy danh sách nhân viên
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Kết hợp filters (dùng debouncedKeyword thay vì filters.SearchKeyword trực tiếp) 
      // và pagination để tạo params
      const params = {
        ...filters,
        SearchKeyword: debouncedKeyword, // Dùng giá trị đã debounce
        Page: pagination.page,
        PageSize: pagination.pageSize,
      };
      
      // Lọc bỏ các giá trị rỗng
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log("🚀 [API CALL] Fetching with Params:", params);
      
      // Nếu muốn debug xem query string trông như thế nào:
      const queryString = new URLSearchParams(params).toString();
      console.log("🔗 [API URL PREVIEW]: /api/v1/employees?" + queryString);

      const response = await HRService.fetchAllEmployees(params);
      
      console.log("✅ [API RESPONSE] Raw Data:", response);

      if (response && Array.isArray(response.data)) {
        setEmployees(response.data);
        setPagination(prev => ({
          ...prev,
          page: response.page || prev.page,
          totalPages: response.totalPages || 1,
          totalCount: response.totalCount || 0
        }));
      } else if (Array.isArray(response)) {
        setEmployees(response);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("❌ [API ERROR]:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect chính để gọi API
  // Chạy khi pagination thay đổi, HOẶC khi debouncedKeyword thay đổi, 
  // HOẶC khi các filter khác thay đổi (trừ SearchKeyword vì đã có debouncedKeyword lo)
  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.page, 
    pagination.pageSize, 
    debouncedKeyword, // Trigger khi search keyword đã debounce xong
    filters.DepartmentId,
    filters.Status,
    filters.Gender,
    filters.EmploymentType,
    filters.SortBy,
    filters.SortDirection
  ]);

  useEffect(() => {
    // Giả lập load phòng ban
    setDepartments([
      { id: 1, name: "IT" },
      { id: 2, name: "HR" },
      { id: 3, name: "Marketing" },
      { id: 4, name: "Sales" },
      { id: 5, name: "Finance" },
      { id: 6, name: "Operations" }
    ]);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // Reset về trang 1 khi filter thay đổi
    if (name !== "SearchKeyword") {
        setPagination(prev => ({ ...prev, page: 1 }));
    } else {
        // Với search keyword, ta cũng reset page về 1 nhưng việc gọi API sẽ do effect debounce xử lý
        setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      SortBy: field,
      SortDirection: prev.SortBy === field && prev.SortDirection === "Asc" ? "Desc" : "Asc"
    }));
  };

  const clearFilters = () => {
    setFilters({
      SearchKeyword: "",
      DepartmentId: "",
      Status: "",
      Gender: "",
      EmploymentType: "",
      SortBy: "CreatedDate",
      SortDirection: "Desc"
    });
    setDebouncedKeyword(""); // Clear cả debounce
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <>
      <style>{`
        /* --- General Layout --- */
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- Header --- */
        .card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #fff;
        }

        .header-title h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.025em;
        }
        
        .header-title p {
            margin: 0.25rem 0 0 0;
            color: #64748b;
            font-size: 0.875rem;
        }

        /* --- Filters --- */
        .filter-section {
          padding: 1.25rem 1.5rem;
          background-color: #fff;
          border-bottom: 1px solid #f1f5f9;
        }

        .filter-primary-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .form-control {
          width: 100%;
          height: 40px;
          padding: 0 1rem 0 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #1e293b;
          background-color: #fff;
          transition: all 0.2s ease;
        }
        
        .form-select {
            padding-left: 1rem;
            min-width: 160px;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-repeat: no-repeat;
            background-size: 1.5em 1.5em;
            padding-right: 2.5rem;
        }

        .form-control:hover {
            border-color: #cbd5e1;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn {
          height: 40px;
          padding: 0 1rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
          justify-content: center;
        }

        .btn-primary { 
            background-color: #2563eb; 
            color: white; 
            box-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);
        }
        .btn-primary:hover { 
            background-color: #1d4ed8; 
            transform: translateY(-1px);
        }

        .btn-outline { 
            background-color: white; 
            border-color: #e2e8f0; 
            color: #475569; 
        }
        .btn-outline:hover { 
            background-color: #f8fafc; 
            border-color: #cbd5e1; 
            color: #0f172a;
        }
        
        .btn-ghost { 
            background-color: transparent; 
            color: #64748b; 
        }
        .btn-ghost:hover { 
            background-color: #f1f5f9; 
            color: #334155; 
        }
        
        .btn-icon-only {
            width: 40px;
            padding: 0;
        }

        .advanced-filters-grid {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px dashed #e2e8f0;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1rem;
        }
        
        .filter-group label {
            display: block;
            margin-bottom: 0.375rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.025em;
        }

        /* --- Table --- */
        .table-container {
          overflow-x: auto;
          background-color: #fff;
        }

        .table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }

        .table th {
          background-color: #f8fafc;
          color: #475569;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.875rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.15s;
        }
        
        .table th:hover {
            background-color: #f1f5f9;
            color: #1e293b;
        }

        .table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 0.875rem;
          vertical-align: middle;
        }

        .table tr:last-child td {
          border-bottom: none;
        }

        .table tbody tr {
            transition: background-color 0.15s ease;
        }

        .table tbody tr:hover { 
            background-color: #f8fafc; 
            cursor: pointer; 
        }

        /* Avatar & Name */
        .user-cell {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            color: #475569;
            border: 1px solid white;
            box-shadow: 0 0 0 1px #e2e8f0;
        }
        
        .user-info {
            display: flex;
            flex-direction: column;
        }
        
        .user-name {
            font-weight: 600;
            color: #0f172a;
            line-height: 1.2;
        }
        
        .user-role {
            font-size: 0.75rem;
            color: #64748b;
        }

        /* Status Badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
        }
        .status-active { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .status-inactive { background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .status-probation { background-color: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; }

        /* --- Footer & Pagination --- */
        .card-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #fff;
        }
        
        .pagination-meta {
            color: #64748b;
            font-size: 0.875rem;
        }
        
        .pagination-container {
            display: flex;
            gap: 0.25rem;
            align-items: center;
        }
        
        .btn-page {
            min-width: 36px;
            height: 36px;
            padding: 0 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            color: #64748b;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .btn-page:hover:not(:disabled) {
            border-color: #cbd5e1;
            color: #0f172a;
            background-color: #f8fafc;
        }
        
        .btn-page.active {
            background-color: #eff6ff;
            color: #2563eb;
            border-color: #bfdbfe;
        }
        
        .btn-page:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Loading State */
        .loading-container {
            padding: 4rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
        }
        
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Empty State */
        .empty-state {
            padding: 4rem 2rem;
            text-align: center;
            color: #64748b;
        }
        .empty-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 1rem;
            color: #cbd5e1;
        }
      `}</style>

      <div className="page-container fade-in-up">
        <div className="card">
          
          {/* HEADER */}
          <div className="card-header">
            <div className="header-title">
              <h2>Employee Directory</h2>
              <p>Manage and view all employee records</p>
            </div>
            <div className="btn-group" style={{display: 'flex', gap: '10px'}}>
              <button className="btn btn-outline" onClick={() => navigate("import")}>
                <FileSpreadsheet size={18} />
                Import Excel
              </button>
              <button className="btn btn-primary" onClick={() => navigate("add")}>
                <UserPlus size={18} />
                Add Employee
              </button>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="filter-section">
            <div className="filter-primary-row">
              {/* Search: name="SearchKeyword" khớp với key trong filters state */}
              <div className="search-wrapper">
                  <Search className="search-icon" size={18} />
                  <input 
                      type="text" 
                      className="form-control"
                      style={{paddingLeft: '2.5rem'}}
                      name="SearchKeyword"
                      placeholder="Search by name, ID or email..." 
                      value={filters.SearchKeyword}
                      onChange={handleFilterChange}
                  />
              </div>
              
              {/* Quick Filters */}
              <select className="form-control form-select" name="Status" value={filters.Status} onChange={handleFilterChange} style={{width: 'auto'}}>
                  <option value="">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Probation">Probation</option>
              </select>

              <select className="form-control form-select" name="DepartmentId" value={filters.DepartmentId} onChange={handleFilterChange} style={{width: 'auto'}}>
                  <option value="">Department: All</option>
                  {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
              </select>

              {/* Actions */}
              <div style={{marginLeft: 'auto', display: 'flex', gap: '0.5rem'}}>
                <button 
                    className={`btn ${showAdvancedFilter ? 'btn-outline' : 'btn-ghost'}`} 
                    onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                >
                    <Filter size={18} /> Filters
                </button>

                {(filters.SearchKeyword || filters.Status || filters.DepartmentId || filters.Gender || filters.EmploymentType) && (
                    <button className="btn btn-ghost" onClick={clearFilters} style={{color: '#ef4444'}}>
                        <X size={18} /> Clear
                    </button>
                )}
              </div>
            </div>

            {/* ADVANCED FILTER PANEL */}
            {showAdvancedFilter && (
               <div className="advanced-filters-grid fade-in-up">
                  <div className="filter-group">
                      <label>Gender</label>
                      <select className="form-control form-select" name="Gender" style={{paddingLeft: '1rem', width: '100%'}} value={filters.Gender} onChange={handleFilterChange}>
                          <option value="">Any Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                      </select>
                  </div>
                  <div className="filter-group">
                      <label>Employment Type</label>
                      <select className="form-control form-select" name="EmploymentType" style={{paddingLeft: '1rem', width: '100%'}} value={filters.EmploymentType} onChange={handleFilterChange}>
                          <option value="">Any Type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Internship">Internship</option>
                      </select>
                  </div>
                  {/* Add more filters here if needed */}
               </div>
            )}
          </div>

          {/* TABLE CONTENT */}
          <div className="table-container">
            {loading ? (
               <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading employee data...</p>
               </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("EmployeeCode")} style={{width: '120px'}}>
                        Code <ArrowUpDown size={14} style={{display:'inline', marginLeft:4, opacity:0.5}}/>
                    </th>
                    <th onClick={() => handleSort("EmployeeName")} style={{minWidth: '250px'}}>
                        Employee <ArrowUpDown size={14} style={{display:'inline', marginLeft:4, opacity:0.5}}/>
                    </th>
                    <th onClick={() => handleSort("Department")}>Department</th>
                    <th onClick={() => handleSort("JobTitle")}>Job Title</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th style={{width: '60px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(employees) && employees.length > 0 ? (
                    employees.map((emp) => (
                      <tr 
                        key={emp.employeeCode || emp.employee_code} 
                        onClick={() => navigate(`/hr/profile/${emp.employeeCode || emp.employee_code}`)} 
                      >
                        <td style={{fontFamily: 'monospace', fontWeight: 600, color: '#334155'}}>
                            {emp.employeeCode || 'N/A'}
                        </td>
                        <td>
                           <div className="user-cell">
                               <div className="user-avatar">
                                   {emp.employeeName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                               <div className="user-info">
                                   <div className="user-name">{emp.employeeName || 'Unknown Name'}</div>
                                   <div className="user-role">{emp.employmentType || emp.jobTitle || 'Staff'}</div>
                               </div>
                           </div>
                        </td>
                        <td>{emp.department || '-'}</td>
                        <td>{emp.jobTitle || '-'}</td>
                        <td style={{color: '#64748b'}}>{emp.companyEmail || emp.personalEmail || '-'}</td>
                        <td>
                          <span className={`status-badge ${
                              emp.status === 'Active' ? 'status-active' : 
                              emp.status === 'Probation' ? 'status-probation' : 'status-inactive'
                          }`}>
                            {emp.status || 'Active'}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-ghost btn-icon-only">
                                <MoreHorizontal size={18} />
                            </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                          <div className="empty-state">
                              <Search className="empty-icon" />
                              <h3>No employees found</h3>
                              <p>Try adjusting your search or filters to find what you're looking for.</p>
                              <button className="btn btn-outline" style={{marginTop: '1rem'}} onClick={clearFilters}>
                                  Clear all filters
                              </button>
                          </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION FOOTER */}
          <div className="card-footer">
              <div className="pagination-meta">
                  Showing <span style={{fontWeight: 600, color: '#0f172a'}}>{(pagination.page - 1) * pagination.pageSize + 1}</span> to <span style={{fontWeight: 600, color: '#0f172a'}}>{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}</span> of <span style={{fontWeight: 600, color: '#0f172a'}}>{pagination.totalCount}</span> results
              </div>
              
              <div className="pagination-container">
                  <button 
                      className="btn-page" 
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                  >
                      <ChevronLeft size={16} />
                  </button>
                  
                  {/* Page numbers logic could be improved for large ranges */}
                  <button className="btn-page active">{pagination.page}</button>
                  {pagination.totalPages > 1 && <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>of {pagination.totalPages}</span>}

                  <button 
                      className="btn-page" 
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                  >
                      <ChevronRight size={16} />
                  </button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}