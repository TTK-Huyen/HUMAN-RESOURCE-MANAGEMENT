using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrmApi.Data;
using HrmApi.Dtos.Requests;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class RequestsDashboardRepository : IRequestsDashboardRepository
    {
        private readonly AppDbContext _db;

        public RequestsDashboardRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<DashboardRequestItemDto>> GetDashboardRequestsAsync(
            int? departmentId,
            string? keyword,
            int? managerId,
            bool onlyDirectReports)
        {
            var q = _db.Requests
                .AsNoTracking()
                .Include(r => r.Employee)
                    .ThenInclude(e => e.Department)
                .Include(r => r.LeaveRequest)
                .Include(r => r.ResignationRequest)
                .Include(r => r.OvertimeRequest)
                .AsQueryable();

            // Filter: department
            if (departmentId.HasValue)
            {
                q = q.Where(r => r.Employee.DepartmentId == departmentId.Value);
            }

            // Filter: chỉ lấy request của báo cáo trực tiếp (managerId)
            if (onlyDirectReports && managerId.HasValue)
            {
                q = q.Where(r => r.Employee.DirectManagerId == managerId.Value);
            }

            // Filter: keyword (mã NV hoặc tên NV)
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.Trim();
                
                q = q.Where(r =>
                    r.Employee.EmployeeCode.Contains(keyword) ||
                    r.Employee.FullName.Contains(keyword));
            }

            return await q
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new DashboardRequestItemDto
                {
                    RequestId = r.RequestId,
                    RequestCode = "REQ-" + r.RequestId,
                    RequestType = r.RequestType,
                    Status = r.Status,
                    DecidedAt = r.ApprovedAt,

                    Employee = new DashboardEmployeeDto
                    {
                        Id = r.Employee.Id,
                        FullName = r.Employee.FullName,
                        DepartmentName = r.Employee.Department != null ? r.Employee.Department.Name : ""
                    },

                    EffectiveDate =
                        r.RequestType == "LEAVE" && r.LeaveRequest != null
                            ? (DateTime?)r.LeaveRequest.StartDate
                        : r.RequestType == "RESIGNATION" && r.ResignationRequest != null
                            ? (DateTime?)r.ResignationRequest.ProposedLastWorkingDate
                        : r.RequestType == "OT" && r.OvertimeRequest != null
                            ? (DateTime?)r.OvertimeRequest.OtDate
                        : null
                })
                .ToListAsync();
        }
    }
}
