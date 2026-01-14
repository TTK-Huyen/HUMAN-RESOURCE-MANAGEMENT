using System;
using System.Linq;
using System.Threading.Tasks;
using HrmApi.Data;
using HrmApi.Dtos.Requests;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class RequestHistoryRepository : IRequestHistoryRepository
    {
        private readonly AppDbContext _db;

        public RequestHistoryRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<RequestApprovalHistoryResponseDto?> GetApprovalHistoryAsync(int requestId)
        {
            // 1) Lấy request
            var req = await _db.Requests
                .AsNoTracking()
                .Where(r => r.RequestId == requestId)
                .Select(r => new
                {
                    r.RequestId,
                    r.EmployeeId,
                    r.CreatedAt,
                    r.Status,
                    r.ApproverId,
                    r.ApprovedAt 
                })
                .FirstOrDefaultAsync();

            if (req == null) return null;

            // 2) Lấy người tạo
            var creator = await _db.Employees
                .AsNoTracking()
                .Where(e => e.Id == req.EmployeeId)
                .Select(e => new { e.EmployeeCode, e.FullName })
                .FirstAsync();

            var response = new RequestApprovalHistoryResponseDto();

            // Event CREATED
            response.Items.Add(new RequestApprovalHistoryItemDto
            {
                Time = req.CreatedAt,
                Status = "CREATED",
                Full_Name = creator.FullName,
                Employee_Id = creator.EmployeeCode
            });

            // Event APPROVED/REJECTED (không trả PENDING)
            // Chỉ add khi request đã có quyết định
            if (!string.Equals(req.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                
                if (req.ApproverId.HasValue)
                {
                    var approver = await _db.Employees
                        .AsNoTracking()
                        .Where(e => e.Id == req.ApproverId.Value)
                        .Select(e => new { e.EmployeeCode, e.FullName })
                        .FirstOrDefaultAsync();

                    if (approver != null)
                    {
                        response.Items.Add(new RequestApprovalHistoryItemDto
                        {
                            Time = req.ApprovedAt ?? req.CreatedAt, // nếu ApprovedAt null, fallback tạm
                            Status = string.Equals(req.Status, "Approved", StringComparison.OrdinalIgnoreCase)
                                ? "APPROVED"
                                : "REJECTED",
                            Full_Name = approver.FullName,
                            Employee_Id = approver.EmployeeCode
                        });
                    }
                }
            }

            // Sort giống UI: mới nhất lên đầu
            response.Items = response.Items.OrderByDescending(x => x.Time).ToList();
            return response;
        }
    }
}
