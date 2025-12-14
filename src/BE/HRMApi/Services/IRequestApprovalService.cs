using HrmApi.Dtos;
using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface IRequestApprovalService
    {
        Task<ManagerLeaveRequestDetailDto> GetLeaveRequestDetailAsync(int requestId);
        Task<LeaveRequestApprovalResponseDto> ApproveLeaveRequestAsync(int requestId, RequestStatusUpdateDto dto);
    }
}