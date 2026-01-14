using HrmApi.Dtos;
using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface IRequestApprovalService
    {
        Task<ManagerLeaveRequestDetailDto> GetLeaveRequestDetailAsync(int requestId);
        Task<LeaveRequestApprovalResponseDto> ApproveLeaveRequestAsync(int requestId, RequestStatusUpdateDto dto);

        Task<ManagerOvertimeRequestDetailDto> GetOvertimeRequestDetailAsync(int requestId);
        Task<OtRequestApprovalResponseDto> ApproveOvertimeRequestAsync(int requestId, RequestStatusUpdateDto dto);

        Task<ManagerResignationRequestDetailDto> GetResignationRequestDetailAsync(int requestId);
        Task<ResignationRequestApprovalResponseDto> ApproveResignationRequestAsync(int requestId, RequestStatusUpdateDto dto);
    
    }
}