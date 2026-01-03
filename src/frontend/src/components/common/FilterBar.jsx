import React from 'react';
import { Search, Filter } from 'lucide-react';

const FilterBar = ({ 
    keyword, 
    setKeyword, 
    deptId, 
    setDeptId, 
    departments = [], 
    placeholder = "Search..." // <--- 1. Tách ra và gán mặc định
}) => {
    return (
        <div className="filter-bar">
            <div className="input-group search-wrapper">
                <Search size={18} color="#94a3b8"/>
                <input 
                    placeholder={placeholder} // <--- 2. Dùng prop ở đây
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>
            
            {/* Chỉ hiện dropdown nếu có danh sách departments truyền vào */}
            {departments.length > 0 && (
                <div className="input-group filter-select-wrapper">
                    <Filter size={18} color="#94a3b8"/>
                    <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default FilterBar;