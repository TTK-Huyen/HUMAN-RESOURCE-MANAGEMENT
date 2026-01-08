import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, pageSizeOptions, showPageSelector }) => {
    // Always show pagination controls, even if only one page
    return (
        <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="page-info">
                Page {currentPage} of {totalPages}
            </span>
            <button 
                className="btn-page" 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={16} />
            </button>
            <button 
                className="btn-page" 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight size={16} />
            </button>
            {pageSizeOptions && onPageSizeChange && (
                <>
                    <span>Items per page:</span>
                    <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))} style={{ padding: '6px 12px', borderRadius: 8 }}>
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </>
            )}
            {showPageSelector && (
                <>
                    <span>Page:</span>
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={currentPage}
                        onChange={e => {
                            let val = Number(e.target.value);
                            if (isNaN(val)) val = 1;
                            val = Math.max(1, Math.min(totalPages, val));
                            onPageChange(val);
                        }}
                        style={{ width: 60, padding: '6px 12px', borderRadius: 8 }}
                    />
                </>
            )}
        </div>
    );
};

export default Pagination;