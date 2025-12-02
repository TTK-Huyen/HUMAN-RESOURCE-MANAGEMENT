using HrmApi.Dtos.Requests;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/employees/{employeeCode}/requests/resignation")]
    public class ResignationRequestsController : ControllerBase
    {
        private readonly IResignationRequestService _service;

        public ResignationRequestsController(IResignationRequestService service)
        {
            _service = service;
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResignationRequestCreatedDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ResignationRequestCreatedDto>> CreateResignationRequest(
            string employeeCode,
            [FromBody] CreateResignationRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.CreateAsync(employeeCode, dto);

            return CreatedAtAction(
                nameof(GetResignationRequestDetail),
                new { employeeCode, requestId = result.RequestId },
                result);
        }

        [HttpGet("{requestId:int}")]
        [ProducesResponseType(typeof(ResignationRequestDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ResignationRequestDetailDto>> GetResignationRequestDetail(
            string employeeCode,
            int requestId)
        {
            var result = await _service.GetDetailAsync(employeeCode, requestId);
            if (result == null)
                return NotFound(new { message = "Resignation request not found for this employee." });

            return Ok(result);
        }
    }
}
