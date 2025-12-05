using HrmApi.Dtos.RequestStatus;
using HrmApi.Models;

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
        
        // Thêm mới Request chung
        Task AddAsync(Request request);
        Task<Request?> GetByIdAsync(int id);
        Task SaveChangesAsync();
    }
}