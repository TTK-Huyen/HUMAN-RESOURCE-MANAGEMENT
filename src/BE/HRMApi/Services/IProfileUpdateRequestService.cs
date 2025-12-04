using HrmApi.Dtos;

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
    }
}
