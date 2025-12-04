using HrSystem.Dtos.RequestStatus;

namespace HrSystem.Services
{
    public interface IRequestStatusService
    {
        Task<IReadOnlyList<EmployeeRequestListItemDto>> GetRequestsByEmployeeAsync(
            string employeeCode,
            EmployeeRequestFilterDto filter);

        Task<LeaveRequestDetailDto> GetLeaveDetailAsync(string employeeCode, int requestId);

        Task<OvertimeRequestDetailDto> GetOvertimeDetailAsync(string employeeCode, int requestId);

        Task<ResignationRequestDetailDto> GetResignationDetailAsync(string employeeCode, int requestId);
    }
}
