using HrmApi.Dtos;           // <--- QUAN TRỌNG: Thêm dòng này để nhận diện RequestStatusUpdateDto
using HrmApi.Dtos.Requests;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1")]
    public class RequestApprovalController : ControllerBase
    {
        private readonly IRequestApprovalService _approvalService;

        public RequestApprovalController(IRequestApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        // =============================================
        // PHẦN 1: LEAVE REQUEST (NGHỈ PHÉP)
        // =============================================

        // GET: /api/v1/manager/leave-requests/{id}
        [HttpGet("manager/leave-requests/{id}")]
        public async Task<ActionResult<ManagerLeaveRequestDetailDto>> GetLeaveRequestDetail(int id)
        {
            try
            {
                var result = await _approvalService.GetLeaveRequestDetailAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Leave request not found" });
            }
        }

        // PUT: /api/v1/manager/leave-requests/{id}/approval
        [HttpPut("manager/leave-requests/{id}/approval")]
        public async Task<ActionResult<LeaveRequestApprovalResponseDto>> ApproveLeaveRequest(
            int id, 
            [FromBody] RequestStatusUpdateDto dto)
        {
            try
            {
                var result = await _approvalService.ApproveLeaveRequestAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Request not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // =============================================
        // PHẦN 2: OVERTIME REQUEST (LÀM THÊM GIỜ)
        // =============================================

        // GET: /api/v1/getdetail-overtime-requests/{code}
        [HttpGet("getdetail-overtime-requests/{code}")]
        public async Task<ActionResult<ManagerOvertimeRequestDetailDto>> GetOvertimeRequestDetail(int code)
        {
            try
            {
                var result = await _approvalService.GetOvertimeRequestDetailAsync(code);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Overtime Request not found" });
            }
        }

        // PUT: /api/v1/overtime-requests/{requestId}/approval
        [HttpPut("overtime-requests/{requestId}/approval")]
        public async Task<ActionResult<OtRequestApprovalResponseDto>> ApproveOvertimeRequest(
            int requestId, 
            [FromBody] RequestStatusUpdateDto dto) // <-- Dòng này sẽ hết lỗi sau khi thêm using HrmApi.Dtos;
        {
            try
            {
                var result = await _approvalService.ApproveOvertimeRequestAsync(requestId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Request not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // Trả về lỗi nếu vi phạm rule (vd: quá 4 tiếng)
                return BadRequest(new { error = ex.Message });
            }
        }

        // ... (Các endpoint Leave và Overtime cũ giữ nguyên) ...

        // =============================================
        // PHẦN 3: RESIGNATION REQUEST (NGHỈ VIỆC) - MỚI
        // =============================================

        // GET: /api/v1/getdetail-resignation-requests/{code}
        [HttpGet("getdetail-resignation-requests/{code}")]
        public async Task<ActionResult<ManagerResignationRequestDetailDto>> GetResignationRequestDetail(int code)
        {
            try
            {
                // code ở đây là requestId
                var result = await _approvalService.GetResignationRequestDetailAsync(code);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Resignation Request not found" });
            }
        }

        // PUT: /api/v1/resignation-requests/{requestId}/approval
        [HttpPut("resignation-requests/{requestId}/approval")]
        public async Task<ActionResult<ResignationRequestApprovalResponseDto>> ApproveResignationRequest(
            int requestId, 
            [FromBody] RequestStatusUpdateDto dto)
        {
            try
            {
                var result = await _approvalService.ApproveResignationRequestAsync(requestId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Request not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}