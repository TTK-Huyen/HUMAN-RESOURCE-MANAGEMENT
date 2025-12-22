using HrmApi.Dtos;
using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface IRequestApprovalService
    {
        // --- PHẦN CŨ (LEAVE REQUEST) ---
        Task<ManagerLeaveRequestDetailDto> GetLeaveRequestDetailAsync(int requestId);
        Task<LeaveRequestApprovalResponseDto> ApproveLeaveRequestAsync(int requestId, RequestStatusUpdateDto dto);

        // --- PHẦN MỚI BỔ SUNG (OVERTIME REQUEST) ---
        // Bạn thiếu 2 dòng này nên Controller không gọi được
        Task<ManagerOvertimeRequestDetailDto> GetOvertimeRequestDetailAsync(int requestId);
        Task<OtRequestApprovalResponseDto> ApproveOvertimeRequestAsync(int requestId, RequestStatusUpdateDto dto);

        Task<ManagerResignationRequestDetailDto> GetResignationRequestDetailAsync(int requestId);
        Task<ResignationRequestApprovalResponseDto> ApproveResignationRequestAsync(int requestId, RequestStatusUpdateDto dto);
    
    }
}