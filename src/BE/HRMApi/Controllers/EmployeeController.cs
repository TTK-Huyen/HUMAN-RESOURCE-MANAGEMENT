using HrmApi.Dtos; // [QUAN TRỌNG] Thêm dòng này để dùng RequestFilterDto
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

        // API: Gửi yêu cầu cập nhật (Đã có)
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

        // =========================================================================
        // [THÊM MỚI] API: Lấy danh sách yêu cầu cập nhật của nhân viên
        // =========================================================================
        [HttpGet("{employeeCode}/profile-update-requests", Name = "GetMyProfileUpdateRequests")]
        public async Task<IActionResult> GetMyProfileUpdateRequests(string employeeCode, [FromQuery] string? status)
        {
            // Tạo filter để Service tìm kiếm theo mã nhân viên
            var filter = new RequestFilterDto
            {
                EmployeeCode = employeeCode,
                Status = status
            };

            var result = await _profileUpdateRequestService.SearchAsync(filter);
            return Ok(result);
        }

        // =========================================================================
        // [THÊM MỚI] API: Lấy chi tiết yêu cầu cập nhật của nhân viên
        // =========================================================================
        [HttpGet("{employeeCode}/profile-update-requests/{requestId:long}", Name = "GetMyProfileUpdateRequestDetail")]
        public async Task<IActionResult> GetMyProfileUpdateRequestDetail(string employeeCode, long requestId)
        {
            try
            {
                var detail = await _profileUpdateRequestService.GetDetailEnrichedAsync(requestId);
                
                // Kiểm tra xem request có thuộc về employee này không
                if (detail.EmployeeCode != employeeCode)
                {
                    return Forbid();
                }
                
                return Ok(detail);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error_message = "Request not found" });
            }
        }
        // =========================================================================

        /// <summary>
        /// Tạo nhân viên mới cùng với tài khoản đăng nhập
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto)
        {
            try
            {
                var result = await _employeeService.CreateEmployeeAsync(dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                // map field-specific error
                if (ex.Message == "username")
                    ModelState.AddModelError("username", "Username already exists.");

                if (ex.Message == "companyEmail")
                    ModelState.AddModelError("companyEmail", "Company email already exists.");

                if (ex.Message == "citizenIdNumber")
                    ModelState.AddModelError("citizenIdNumber", "Citizen ID Number already exists.");

                return ValidationProblem(ModelState);
            }
            catch (Exception ex)
            {
                // Get inner exception message if available
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = "Internal server error: " + errorMessage });
            }
        }


        /// <summary>
        /// Lấy danh sách nhân viên với filter và pagination
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllEmployees([FromQuery] EmployeeFilterDto? filter)
        {
            try
            {
                // Nếu không có filter thì sử dụng filter mặc định
                if (filter == null)
                {
                    filter = new EmployeeFilterDto
                    {
                        Page = 1,
                        PageSize = 10,
                        SortBy = "employeename",
                        SortDirection = "ASC"
                    };
                }

                var result = await _employeeService.GetEmployeesWithFilterAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error: " + ex.Message });
            }
        }       
        
        /// <summary>
        /// Lấy danh sách thông tin cơ bản của nhân viên (name, code, dob, gender, citizenID, phone, department, job title)
        /// </summary>
        /// <param name="employeeCode">Mã nhân viên cụ thể (optional). Nếu không truyền, trả về tất cả nhân viên</param>
        [HttpGet("essential")]
        public async Task<IActionResult> GetEssentialEmployeeInfo([FromQuery] string? employeeCode = null)
        {
            try
            {
                var employees = await _employeeService.GetEssentialEmployeeInfoAsync(employeeCode);

                // Nếu tìm kiếm theo employeeCode cụ thể nhưng không tìm thấy
                if (!string.IsNullOrEmpty(employeeCode) && !employees.Any())
                {
                    return NotFound(new { message = $"Employee with code '{employeeCode}' not found or is not active." });
                }

                return Ok(employees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error: " + ex.Message });
            }
        }
    }
}