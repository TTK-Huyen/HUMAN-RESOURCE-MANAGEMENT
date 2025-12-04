using HrSystem.Dtos;

namespace HrSystem.Services
{
    public interface IProfileUpdateRequestService
    {
        Task<IEnumerable<RequestListItemDto>> SearchAsync(RequestFilterDto filter);
        Task<RequestDetailDto> GetDetailAsync(long requestId);

        Task<RequestStatusResponseDto> ChangeStatusAsync(
            int hrId,
            long requestId,
            RequestStatusUpdateDto dto);
    }
}
