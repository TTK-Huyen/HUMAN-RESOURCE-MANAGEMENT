using HrmApi.Dtos.RequestStatus;
using HrmApi.Models;
using System.Threading.Tasks;
// Đã xóa dòng duplicate: using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IEmployeeRequestRepository
    {
        Task<List<EmployeeRequestListItemDto>> GetRequestsByEmployeeAsync(
            string employeeCode,
            EmployeeRequestFilterDto filter);

        Task<LeaveRequest?> GetLeaveRequestAsync(string employeeCode, int requestId);

        Task<OvertimeRequest?> GetOvertimeRequestAsync(string employeeCode, int requestId);

        Task<ResignationRequest?> GetResignationRequestAsync(string employeeCode, int requestId);
        
        // --- BỔ SUNG DÒNG NÀY ĐỂ FIX LỖI CS1061 ---
        Task<LeaveRequest?> GetLeaveRequestByIdAsync(int requestId);
        // ------------------------------------------

        Task AddAsync(Request request);
        Task<Request?> GetByIdAsync(int id);
        Task SaveChangesAsync();

        Task<RequestDashboardSummary> GetDashboardSummaryAsync(
            int? departmentId,
            string? keyword,
            int? managerId,
            bool onlyDirectReports);

          }
}