using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface ILeaveRequestService
    {
        Task<LeaveRequestCreatedDto> CreateAsync(string employeeCode, CreateLeaveRequestDto dto);
        Task<LeaveRequestDetailDto?> GetDetailAsync(string employeeCode, int requestId);
    }
}
