using HrmApi.Data;
using HrmApi.Dtos.RequestStatus;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class EmployeeRequestRepository : IEmployeeRequestRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeRequestListItemDto>> GetRequestsByEmployeeAsync(
            string employeeCode,
            EmployeeRequestFilterDto filter)
        {
            var results = new List<EmployeeRequestListItemDto>();

            var normalizedStatus = filter.Status?.ToUpperInvariant();
            var typeFilter = filter.Type?.ToLowerInvariant();

            // ------ LEAVE ------
            if (typeFilter == null || typeFilter == "leave")
            {
                var q = _context.LeaveRequests
                    .Include(l => l.Request)
                        .ThenInclude(r => r.Employee)
                    .Include(l => l.Request)
                        .ThenInclude(r => r.Approver)
                    .Where(l => l.Request.Employee.EmployeeCode == employeeCode);

                if (!string.IsNullOrEmpty(normalizedStatus))
                {
                    q = q.Where(l => l.Request.Status.ToUpper() == normalizedStatus);
                }

                if (filter.FromDate.HasValue)
                {
                    q = q.Where(l => l.Request.CreatedAt >= filter.FromDate.Value);
                }

                if (filter.ToDate.HasValue)
                {
                    q = q.Where(l => l.Request.CreatedAt <= filter.ToDate.Value);
                }

                var leaveItems = await q
                    .Select(l => new EmployeeRequestListItemDto
                    {
                        RequestId     = l.RequestId,
                        Type          = "LEAVE",
                        CreatedAt     = l.Request.CreatedAt,
                        EffectiveDate = l.StartDate,
                        Status        = l.Request.Status,
                        ApproverName  = l.Request.Approver != null
                                            ? l.Request.Approver.FullName
                                            : null,
                        ApprovedAt    = l.Request.ApprovedAt
                    })
                    .ToListAsync();

                results.AddRange(leaveItems);
            }

            // ------ OVERTIME ------
            if (typeFilter == null || typeFilter == "ot" || typeFilter == "overtime")
            {
                var q = _context.OvertimeRequests
                    .Include(o => o.Request)
                        .ThenInclude(r => r.Employee)
                    .Include(o => o.Request)
                        .ThenInclude(r => r.Approver)
                    .Where(o => o.Request.Employee.EmployeeCode == employeeCode);

                if (!string.IsNullOrEmpty(normalizedStatus))
                {
                    q = q.Where(o => o.Request.Status.ToUpper() == normalizedStatus);
                }

                if (filter.FromDate.HasValue)
                {
                    q = q.Where(o => o.Request.CreatedAt >= filter.FromDate.Value);
                }

                if (filter.ToDate.HasValue)
                {
                    q = q.Where(o => o.Request.CreatedAt <= filter.ToDate.Value);
                }

                var otItems = await q
                    .Select(o => new EmployeeRequestListItemDto
                    {
                        RequestId     = o.RequestId,
                        Type          = "OVERTIME",
                        CreatedAt     = o.Request.CreatedAt,
                        EffectiveDate = o.OtDate,
                        Status        = o.Request.Status,
                        ApproverName  = o.Request.Approver != null
                                            ? o.Request.Approver.FullName
                                            : null,
                        ApprovedAt    = o.Request.ApprovedAt
                    })
                    .ToListAsync();

                results.AddRange(otItems);
            }

            // ------ RESIGNATION ------
            if (typeFilter == null || typeFilter == "resignation")
            {
                var q = _context.ResignationRequests
                    .Include(rg => rg.Request)
                        .ThenInclude(r => r.Employee)
                    .Include(rg => rg.Request)
                        .ThenInclude(r => r.Approver)
                    .Where(rg => rg.Request.Employee.EmployeeCode == employeeCode);

                if (!string.IsNullOrEmpty(normalizedStatus))
                {
                    q = q.Where(rg => rg.Request.Status.ToUpper() == normalizedStatus);
                }

                if (filter.FromDate.HasValue)
                {
                    q = q.Where(rg => rg.Request.CreatedAt >= filter.FromDate.Value);
                }

                if (filter.ToDate.HasValue)
                {
                    q = q.Where(rg => rg.Request.CreatedAt <= filter.ToDate.Value);
                }

                var resignItems = await q
                    .Select(rg => new EmployeeRequestListItemDto
                    {
                        RequestId     = rg.RequestId,
                        Type          = "RESIGNATION",
                        CreatedAt     = rg.Request.CreatedAt,
                        EffectiveDate = rg.ProposedLastWorkingDate,
                        Status        = rg.Request.Status,
                        ApproverName  = rg.Request.Approver != null
                                            ? rg.Request.Approver.FullName
                                            : null,
                        ApprovedAt    = rg.Request.ApprovedAt
                    })
                    .ToListAsync();

                results.AddRange(resignItems);
            }

            // Sắp xếp & phân trang (theo CreatedAt desc)
            var page     = filter.Page  < 1 ? 1 : filter.Page;
            var pageSize = filter.PageSize < 1 ? 10 : filter.PageSize;

            return results
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
        }

        public async Task<LeaveRequest?> GetLeaveRequestAsync(string employeeCode, int requestId)
        {
            return await _context.LeaveRequests
                .Include(l => l.Request)
                    .ThenInclude(r => r.Employee)
                .Include(l => l.Request)
                    .ThenInclude(r => r.Approver)
                .Where(l => l.Id == requestId &&
                            l.Request.Employee.EmployeeCode == employeeCode)
                .FirstOrDefaultAsync();
        }

        public async Task<OvertimeRequest?> GetOvertimeRequestAsync(string employeeCode, int requestId)
        {
            return await _context.OvertimeRequests
                .Include(o => o.Request)
                    .ThenInclude(r => r.Employee)
                .Include(o => o.Request)
                    .ThenInclude(r => r.Approver)
                .Where(o => o.Id == requestId &&
                            o.Request.Employee.EmployeeCode == employeeCode)
                .FirstOrDefaultAsync();
        }

        public async Task<ResignationRequest?> GetResignationRequestAsync(string employeeCode, int requestId)
        {
            return await _context.ResignationRequests
                .Include(rg => rg.Request)
                    .ThenInclude(r => r.Employee)
                .Include(rg => rg.Request)
                    .ThenInclude(r => r.Approver)
                .Where(rg => rg.Id == requestId &&
                             rg.Request.Employee.EmployeeCode == employeeCode)
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(Request request)
        {
            await _context.Requests.AddAsync(request);
        }

        public async Task<Request?> GetByIdAsync(int id)
        {
            return await _context.Requests
                .Include(r => r.Employee)
                .Include(r => r.Approver)
                .FirstOrDefaultAsync(r => r.EmployeeId == id);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        //summary
        public async Task<RequestDashboardSummary> GetDashboardSummaryAsync(
            int? departmentId,
            string? keyword,
            int? managerId,
            bool onlyDirectReports)
        {
            // Query từ các child tables (Leave, OT, Resignation) vì Requests table không chứa tất cả
            var results = new List<(string Status, int Count)>();

            // --- LEAVE REQUESTS ---
            var leaveQuery = _context.LeaveRequests
                .Include(l => l.Request)
                    .ThenInclude(r => r.Employee)
                .AsQueryable();

            if (departmentId.HasValue)
            {
                leaveQuery = leaveQuery.Where(l => l.Employee.DepartmentId == departmentId.Value);
            }
            if (onlyDirectReports && managerId.HasValue)
            {
                leaveQuery = leaveQuery.Where(l => l.Employee.DirectManagerId == managerId.Value);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim();
                leaveQuery = leaveQuery.Where(l =>
                    l.Employee.EmployeeCode.Contains(kw) ||
                    l.Employee.FullName.Contains(kw));
            }

            var leaveByStatus = await leaveQuery
                .GroupBy(l => l.Request.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            results.AddRange(leaveByStatus.Select(x => (x.Status, x.Count)));

            // --- OVERTIME REQUESTS ---
            var otQuery = _context.OvertimeRequests
                .Include(o => o.Request)
                    .ThenInclude(r => r.Employee)
                .AsQueryable();

            if (departmentId.HasValue)
            {
                otQuery = otQuery.Where(o => o.Employee.DepartmentId == departmentId.Value);
            }
            if (onlyDirectReports && managerId.HasValue)
            {
                otQuery = otQuery.Where(o => o.Employee.DirectManagerId == managerId.Value);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim();
                otQuery = otQuery.Where(o =>
                    o.Employee.EmployeeCode.Contains(kw) ||
                    o.Employee.FullName.Contains(kw));
            }

            var otByStatus = await otQuery
                .GroupBy(o => o.Request.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            results.AddRange(otByStatus.Select(x => (x.Status, x.Count)));

            // --- RESIGNATION REQUESTS ---
            var resQuery = _context.ResignationRequests
                .Include(r => r.Request)
                    .ThenInclude(r => r.Employee)
                .AsQueryable();

            if (departmentId.HasValue)
            {
                resQuery = resQuery.Where(r => r.Employee.DepartmentId == departmentId.Value);
            }
            if (onlyDirectReports && managerId.HasValue)
            {
                resQuery = resQuery.Where(r => r.Employee.DirectManagerId == managerId.Value);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim();
                resQuery = resQuery.Where(r =>
                    r.Employee.EmployeeCode.Contains(kw) ||
                    r.Employee.FullName.Contains(kw));
            }

            var resByStatus = await resQuery
                .GroupBy(r => r.Request.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            results.AddRange(resByStatus.Select(x => (x.Status, x.Count)));

            // --- AGGREGATE ---
            var total = results.Sum(x => x.Count);
            int pending = results.Where(x => x.Status == "Pending").Sum(x => x.Count);
            int approved = results.Where(x => x.Status == "Approved").Sum(x => x.Count);
            int rejected = results.Where(x => x.Status == "Rejected").Sum(x => x.Count);

            return new RequestDashboardSummary
            {
                TotalRequests = total,
                PendingCount = pending,
                ApprovedCount = approved,
                RejectedCount = rejected,
            };
        }

        // Add this method to the class
        public async Task<LeaveRequest?> GetLeaveRequestByIdAsync(int requestId)
        {
            return await _context.LeaveRequests
                .Include(l => l.Request)
                    .ThenInclude(r => r.Employee)
                        .ThenInclude(e => e.Department)
                .Include(l => l.Request)
                    .ThenInclude(r => r.Employee)
                        .ThenInclude(e => e.JobTitle) // Ensure JobTitle is included
                .Include(l => l.HandoverEmployee)
                .FirstOrDefaultAsync(l => l.Id == requestId);
        }
    }
}

