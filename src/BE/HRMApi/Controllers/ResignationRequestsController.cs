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

            // Không còn GetResignationRequestDetail → dùng Created()
            return Created(string.Empty, result);
        }

        
    }
}
