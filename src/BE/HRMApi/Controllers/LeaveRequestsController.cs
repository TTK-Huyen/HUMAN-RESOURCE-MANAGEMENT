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
        public async Task<ActionResult<LeaveRequestCreatedDto>> CreateLeaveRequest(
            string employeeCode,
            [FromBody] CreateLeaveRequestDto dto)
        {
            var result = await _service.CreateAsync(employeeCode, dto);

            // Không còn GetDetail nữa, nên trả Created + body đơn giản
            // Có thể dùng Created(...) hoặc Ok(...)
            return Created(string.Empty, result);
            // hoặc: return Ok(result);
        }

    }
}
