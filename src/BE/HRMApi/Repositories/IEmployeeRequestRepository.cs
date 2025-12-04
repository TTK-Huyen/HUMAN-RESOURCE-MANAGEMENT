using HrSystem.Dtos.RequestStatus;
using HrSystem.Models;

namespace HrSystem.Repositories
{
    public interface IEmployeeRequestRepository
    {
        Task<List<EmployeeRequestListItemDto>> GetRequestsByEmployeeAsync(
            string employeeCode,
            EmployeeRequestFilterDto filter);

        Task<LeaveRequest?> GetLeaveRequestAsync(string employeeCode, int requestId);

        Task<OvertimeRequest?> GetOvertimeRequestAsync(string employeeCode, int requestId);

        Task<ResignationRequest?> GetResignationRequestAsync(string employeeCode, int requestId);
    }
}
