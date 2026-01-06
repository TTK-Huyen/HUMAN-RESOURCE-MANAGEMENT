import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, UserPlus, FileSpreadsheet, 
  ArrowUpDown, MoreHorizontal, X, Briefcase 
} from "lucide-react";

// --- Services ---
import { HRService } from "../../Services/employees.js";

// --- Components có sẵn ---
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination"; // Giả định bạn đã có component này

export default function HRDirectoryPage() {
  const navigate = useNavigate();

  // -- State Data --
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
  });

  // -- State Filter (Giống hệt prototype) --
  const [filters, setFilters] = useState({
    SearchKeyword: "",
    DepartmentId: "",
    Status: "",
    Gender: "",
    EmploymentType: "",
    ContractType: "", // ✅ Đã có trường này
    SortBy: "CreatedDate",
    SortDirection: "Desc"
  });

  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  
  // Fake departments (Hoặc gọi API)
  const departments = [
    { id: 1, name: "IT" },
    { id: 2, name: "HR" },
    { id: 3, name: "Marketing" },
    { id: 4, name: "Sales" },
    { id: 5, name: "Finance" },
    { id: 6, name: "Operations" }
  ];

  // -- Debounce Search --
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedKeyword(filters.SearchKeyword), 500);
    return () => clearTimeout(handler);
  }, [filters.SearchKeyword]);

  // -- Fetch Data --
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        SearchKeyword: debouncedKeyword,
        Page: pagination.page,
        PageSize: pagination.pageSize,
      };
      
      // Xóa các key rỗng
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      console.log("Fetching Params:", params);
      const response = await HRService.fetchAllEmployees(params);

      // Xử lý response (Array hoặc Object có pagination)
      if (response && (Array.isArray(response.data) || Array.isArray(response))) {
        const dataList = Array.isArray(response) ? response : response.data;
        setEmployees(dataList);
        
        if (!Array.isArray(response)) {
            setPagination(prev => ({
                ...prev,
                page: response.page || prev.page,
                totalPages: response.totalPages || 1,
                totalCount: response.totalCount || 0
            }));
        }
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error(err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch
  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.page, 
    pagination.pageSize, 
    debouncedKeyword, 
    filters.DepartmentId, 
    filters.Status, 
    filters.Gender, 
    filters.EmploymentType, 
    filters.ContractType, // ✅ Trigger khi đổi loại hợp đồng
    filters.SortBy, 
    filters.SortDirection
  ]);

  // -- Handlers --
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
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
      ContractType: "",
      SortBy: "CreatedDate",
      SortDirection: "Desc"
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // -- Cấu hình Cột cho Table Component --
  const columns = [
    {
      title: <div onClick={() => handleSort("EmployeeCode")} className="flex items-center gap-1 cursor-pointer">Code <ArrowUpDown size={14} className="opacity-50"/></div>,
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: "10%",
      render: (row) => <span className="font-mono font-semibold text-slate-600">{row.employeeCode || row.employee_code}</span>
    },
    {
      title: <div onClick={() => handleSort("EmployeeName")} className="flex items-center gap-1 cursor-pointer">Employee <ArrowUpDown size={14} className="opacity-50"/></div>,
      dataIndex: "employeeName",
      key: "employeeName",
      width: "25%",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs border border-white shadow-sm">
            {row.employeeName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{row.employeeName}</span>
            <span className="text-xs text-slate-500">{row.employmentType || "Staff"}</span>
          </div>
        </div>
      )
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: "15%"
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      width: "15%"
    },
    {
      // ✅ Cột Contract Type giống prototype
      title: <div onClick={() => handleSort("ContractType")} className="flex items-center gap-1 cursor-pointer">Contract <ArrowUpDown size={14} className="opacity-50"/></div>,
      key: "contractType",
      width: "12%",
      render: (row) => (
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200 whitespace-nowrap">
           {row.contractType || row.contract_type || "-"}
        </span>
      )
    },
    {
      title: "Status",
      key: "status",
      width: "10%",
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      title: "",
      key: "action",
      width: "5%",
      render: (row) => (
        <div className="flex justify-end">
            {/* Nút xem chi tiết */}
            <Button 
                variant="ghost" 
                className="p-1 h-8 w-8 rounded-full"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/hr/profile/${row.employeeCode || row.employee_code}`);
                }}
            >
                <MoreHorizontal size={18} />
            </Button>
        </div>
      )
    }
  ];

  // Helper class cho select inputs
  const selectClass = "form-control pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 min-w-[150px]";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 fade-in-up">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Employee Directory</h2>
          <p className="text-slate-500 text-sm">Manage and view all employee records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={FileSpreadsheet} onClick={() => navigate("import")}>
            Import Excel
          </Button>
          <Button variant="primary" icon={UserPlus} onClick={() => navigate("add")}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* 2. Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        {/* Row 1: Basic Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="SearchKeyword"
              value={filters.SearchKeyword}
              onChange={handleFilterChange}
              placeholder="Search by name, ID or email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <select name="Status" value={filters.Status} onChange={handleFilterChange} className={selectClass}>
            <option value="">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Probation">Probation</option>
          </select>

          <select name="DepartmentId" value={filters.DepartmentId} onChange={handleFilterChange} className={selectClass}>
            <option value="">Department: All</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <div className="flex gap-2 ml-auto">
            <Button variant={showAdvancedFilter ? "secondary" : "ghost"} icon={Filter} onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}>
                Filters
            </Button>
            <Button variant="ghost" className="text-red-500 hover:text-red-600" onClick={clearFilters}>
                <X size={16} /> Clear
            </Button>
          </div>
        </div>

        {/* Row 2: Advanced Filters (Hiện/Ẩn) */}
        {showAdvancedFilter && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
             {/* ✅ Filter Contract Type */}
             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contract Type</label>
                <select name="ContractType" value={filters.ContractType} onChange={handleFilterChange} className={`${selectClass} w-full`}>
                    <option value="">Any Contract</option>
                    <option value="Indefinite">Indefinite (Không thời hạn)</option>
                    <option value="Definite_1_Year">Definite 1 Year</option>
                    <option value="Definite_2_Year">Definite 2 Years</option>
                    <option value="Probation">Probation (Thử việc)</option>
                    <option value="Internship">Internship</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Employment Type</label>
                <select name="EmploymentType" value={filters.EmploymentType} onChange={handleFilterChange} className={`${selectClass} w-full`}>
                    <option value="">Any Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gender</label>
                <select name="Gender" value={filters.Gender} onChange={handleFilterChange} className={`${selectClass} w-full`}>
                    <option value="">Any Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Table Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
            <div className="py-20 flex justify-center">
                <Loading text="Loading employee data..." />
            </div>
        ) : (
            <Table 
                columns={columns} 
                data={employees} 
                emptyText={<EmptyState icon={Search} message="No employees found" subMessage="Try adjusting your filters" />}
                /* Click vào dòng để xem chi tiết */
                onRowClick={(row) => navigate(`/hr/profile/${row.employeeCode || row.employee_code}`)}
            />
        )}
      </div>

      {/* 4. Pagination */}
      {!loading && employees.length > 0 && (
        <div className="flex justify-end">
            <Pagination 
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
        </div>
      )}
    </div>
  );
}