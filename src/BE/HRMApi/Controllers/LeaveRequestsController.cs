using HrmApi.Dtos.Requests;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/employees/{employeeCode}/requests/leave")]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly ILeaveRequestService _service;

        public LeaveRequestsController(ILeaveRequestService service)
        {
            _service = service;
        }

        [HttpPost]
        [ProducesResponseType(typeof(LeaveRequestCreatedDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LeaveRequestCreatedDto>> CreateLeaveRequest(
            string employeeCode,
            [FromBody] CreateLeaveRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.CreateAsync(employeeCode, dto);

            // Location header: /api/v1/employees/{code}/requests/leave/{id}
            return CreatedAtAction(
                nameof(GetLeaveRequestDetail),
                new { employeeCode, requestId = result.RequestId },
                result);
        }

        [HttpGet("{requestId:int}")]
        [ProducesResponseType(typeof(LeaveRequestDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<LeaveRequestDetailDto>> GetLeaveRequestDetail(
            string employeeCode,
            int requestId)
        {
            var result = await _service.GetDetailAsync(employeeCode, requestId);
            if (result == null)
                return NotFound(new { message = "Leave request not found for this employee." });

            return Ok(result);
        }
    }
}
