using HrmApi.Dtos.Auth;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (result == null)
                return Unauthorized("Invalid username or password.");
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            try
            {
                var success = await _authService.RegisterAsync(dto);
                if (!success)
                    return BadRequest("Username already exists or invalid data.");
                return Ok(new { message = "Registration successful." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("accounts")]
        public async Task<IActionResult> GetAllAccounts()
        {
            // Lấy danh sách tất cả account (có thể trả về thông tin cơ bản, không trả về password)
            var accounts = await _authService.GetAllAccountsAsync();
            return Ok(accounts);
        }
    }
}