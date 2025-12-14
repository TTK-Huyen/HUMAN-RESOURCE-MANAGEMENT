using HrmApi.Dtos;
using HrmApi.Dtos.Requests;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/leave-requests")]
    public class RequestApprovalController : ControllerBase
    {
        private readonly IRequestApprovalService _approvalService;

        public RequestApprovalController(IRequestApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        // UC 2.11.1: Fetch leave request details
        [HttpGet("{requestId}")]
        public async Task<ActionResult<ManagerLeaveRequestDetailDto>> GetLeaveRequestDetail(int requestId)
        {
            try
            {
                var result = await _approvalService.GetLeaveRequestDetailAsync(requestId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Request not found" });
            }
        }

        // UC 2.11.4: Update status (Approve/Reject)
        [HttpPut("{requestId}/approval")]
        public async Task<ActionResult<LeaveRequestApprovalResponseDto>> ApproveRequest(
            int requestId, 
            [FromBody] RequestStatusUpdateDto dto)
        {
            try
            {
                var result = await _approvalService.ApproveLeaveRequestAsync(requestId, dto);
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
                return Conflict(new { error = ex.Message });
            }
        }
    }
}