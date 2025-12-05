using HrmApi.Dtos.Employee;
using HrmApi.Repositories;
using HrmApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/employees")]
    // [Authorize(Roles = "Employee")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly IProfileUpdateRequestService _profileUpdateRequestService;

        public EmployeeController(IEmployeeService employeeService
            , IProfileUpdateRequestService profileUpdateRequestService)
        {
            _employeeService = employeeService;
            _profileUpdateRequestService = profileUpdateRequestService;
        }

        [HttpGet("{employeeCode}/profile")]
        public async Task<IActionResult> GetProfile(string employeeCode)
        {
            if (string.IsNullOrEmpty(employeeCode))
                return BadRequest("Employee code is required.");
            // var tokenEmployeeCode = User.FindFirstValue("EmployeeCode");
            // if (string.IsNullOrEmpty(tokenEmployeeCode) || tokenEmployeeCode != employeeCode)
            //     return Unauthorized("Access denied.");
            var profile = await _employeeService.GetProfileAsync(employeeCode);
            if (profile == null)
                return NotFound("Profile does not exist or access denied.");
            return Ok(profile);
        }

        [HttpPost("{employeeCode}/profile-update-requests")]
        public async Task<IActionResult> SendProfileUpdateRequest(string employeeCode, [FromBody] ProfileUpdateRequestCreateDto dto)
        {
            // var tokenEmployeeCode = User.FindFirstValue("EmployeeCode");
            // if (string.IsNullOrEmpty(tokenEmployeeCode) || tokenEmployeeCode != employeeCode)
            //     return Unauthorized("Access denied.");
            var result = await _profileUpdateRequestService.SendProfileUpdateRequestAsync(employeeCode, dto);

            if (!result)
                return BadRequest("Invalid request or access denied.");
            return Ok("Profile update request sent and pending approval.");
        }
    }
}
