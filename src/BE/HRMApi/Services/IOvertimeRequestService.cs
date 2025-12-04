// IOvertimeRequestService.cs
using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface IOvertimeRequestService
    {
        Task<OvertimeRequestCreatedDto> CreateAsync(string employeeCode, CreateOvertimeRequestDto dto);
    }
}
