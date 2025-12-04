using HrSystem.Data;
using HrSystem.Dtos.RequestStatus;
using HrSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Repositories
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
                        ApprovedAt    = null // hiện chưa có cột trong DB
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
                        ApprovedAt    = null
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
                        ApprovedAt    = null
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
                .Where(l => l.RequestId == requestId &&
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
                .Where(o => o.RequestId == requestId &&
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
                .Where(rg => rg.RequestId == requestId &&
                             rg.Request.Employee.EmployeeCode == employeeCode)
                .FirstOrDefaultAsync();
        }
    }
}
