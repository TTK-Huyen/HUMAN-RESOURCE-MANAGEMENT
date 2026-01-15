using HrmApi.Dtos;
using HrmApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/hr/profile-update-requests")]
    // [Authorize(Roles = "HR")]
    public class HrProfileUpdateRequestController : ControllerBase
    {
        private readonly IProfileUpdateRequestService _service;

        public HrProfileUpdateRequestController(IProfileUpdateRequestService service)
        {
            _service = service;
        }

        // ========= API #1: GET LIST =========
        // GET /api/v1/hr/profile-update-requests?status=pending&employeeCode=E001
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RequestListItemDto>>> GetRequests(
            [FromQuery] string? status,
            [FromQuery] string? employeeCode)
        {
            var filter = new RequestFilterDto
            {
                Status = status,
                EmployeeCode = employeeCode
            };

            var result = await _service.SearchAsync(filter);
            Console.WriteLine("Filter parameters:");
            Console.Write(filter);
            return Ok(result); // 200, JSON array
        }

        // ========= API #2: GET DETAIL =========
        // GET /api/v1/hr/profile-update-requests/{requestId}
        [HttpGet("{requestId:long}")]
        public async Task<ActionResult<RequestDetailDto>> GetRequestDetail(long requestId)
        {
            try
            {
                var dto = await _service.GetDetailAsync(requestId);
                return Ok(dto); // 200
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error_message = "Request not found" }); // 404
            }
        }

        // ========= API #2B: GET DETAIL (ENRICHED - FOR HR APPROVAL) =========
        // GET /api/v1/hr/profile-update-requests/{requestId}/detailed
        [HttpGet("{requestId:long}/detailed")]
        public async Task<ActionResult<ProfileUpdateRequestDetailDto>> GetRequestDetailEnriched(long requestId)
        {
            try
            {
                var dto = await _service.GetDetailEnrichedAsync(requestId);
                return Ok(dto); // 200
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error_message = "Request not found" }); // 404
            }
        }

        // ========= API #3: PATCH STATUS =========
        // PATCH /api/v1/hr/profile-update-requests/{requestId}/status
        [HttpPatch("{requestId:long}/status")]
        public async Task<ActionResult<RequestStatusResponseDto>> UpdateStatus(
            long requestId,
            [FromBody] RequestStatusUpdateDto body)
        {
            try
            {
                // LẤY HR ID TỪ BODY DTO (Swagger gửi lên)
                var hrId = body.HrId;

                var result = await _service.ChangeStatusAsync(hrId, requestId, body);
                return Ok(result); // 200
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error_message = ex.Message }); // 400
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error_message = "Request not found" }); // 404
            }
        }
    }
}
