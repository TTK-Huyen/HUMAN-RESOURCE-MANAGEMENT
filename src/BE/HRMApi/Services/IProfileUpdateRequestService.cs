using HrmApi.Dtos;
using HrmApi.Dtos.Employee;

namespace HrmApi.Services
{
    public interface IProfileUpdateRequestService
    {
        Task<IEnumerable<RequestListItemDto>> SearchAsync(RequestFilterDto filter);
        Task<RequestDetailDto> GetDetailAsync(long requestId);

        Task<RequestStatusResponseDto> ChangeStatusAsync(
            int hrId,
            long requestId,
            RequestStatusUpdateDto dto);

        Task<bool> CreateRequestAsync(string employeeCode, ProfileUpdateRequestCreateDto dto);
    }
}
