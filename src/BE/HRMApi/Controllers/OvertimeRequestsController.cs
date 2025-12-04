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

            // Không còn GetOvertimeRequestDetail → dùng Created() đơn giản
            return Created(string.Empty, result);   // 201 Created + body
        }


    }
}
