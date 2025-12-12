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

        public async Task<List<DashboardRequestItemDto>> GetDashboardRequestsAsync(int? departmentId, string? keyword)
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

            // Filter: keyword (mã NV hoặc tên NV)
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.Trim();
                // Lưu ý: dùng FullName (mapped) chứ không dùng EmployeeName (NotMapped)
                q = q.Where(r =>
                    r.Employee.EmployeeCode.Contains(keyword) ||
                    r.Employee.FullName.Contains(keyword));
            }

            // NOTE về requestCode:
            // DB/model Request hiện chưa có RequestCode column, nên tạm dùng "REQ-{requestId}"
            return await q
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new DashboardRequestItemDto
                {
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
