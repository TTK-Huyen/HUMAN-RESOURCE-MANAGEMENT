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
        [Consumes("application/json")]
        public async Task<ActionResult<LeaveRequestCreatedDto>> CreateLeaveRequest(
            string employeeCode,
            [FromBody] CreateLeaveRequestDto dto) 
        {
            try 
            {
                var result = await _service.CreateAsync(employeeCode, dto);
                return Created(string.Empty, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

    }
}
