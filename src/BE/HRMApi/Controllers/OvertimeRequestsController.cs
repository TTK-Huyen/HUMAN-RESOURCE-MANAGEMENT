using HrmApi.Dtos.Requests;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/employees/{employeeCode}/requests/overtime")]
    public class OvertimeRequestsController : ControllerBase
    {
        private readonly IOvertimeRequestService _service;

        public OvertimeRequestsController(IOvertimeRequestService service)
        {
            _service = service;
        }

        [HttpPost]
        [ProducesResponseType(typeof(OvertimeRequestCreatedDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OvertimeRequestCreatedDto>> CreateOvertimeRequest(
            string employeeCode,
            [FromBody] CreateOvertimeRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.CreateAsync(employeeCode, dto);

            return CreatedAtAction(
                nameof(GetOvertimeRequestDetail),
                new { employeeCode, requestId = result.RequestId },
                result);
        }

        [HttpGet("{requestId:int}")]
        [ProducesResponseType(typeof(OvertimeRequestDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OvertimeRequestDetailDto>> GetOvertimeRequestDetail(
            string employeeCode,
            int requestId)
        {
            var result = await _service.GetDetailAsync(employeeCode, requestId);
            if (result == null)
                return NotFound(new { message = "Overtime request not found for this employee." });

            return Ok(result);
        }
    }
}
