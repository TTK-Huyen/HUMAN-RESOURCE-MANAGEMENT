namespace HrSystem.Controllers;

[ApiController]
[Route("api/v1/hr/profile-update-requests")]
public class HrProfileUpdateRequestController : ControllerBase
{
    private readonly IProfileUpdateRequestService _service;
     public HrProfileUpdateRequestController(IProfileUpdateRequestService service)
    {
        _service = service;
    }

    // GET /api/v1/hr/profile-update-requests?status=pending&employeeCode=E001
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RequestListItemDto>>> GetRequests(
        [FromQuery] string? status,
        [FromQuery] string? employeeCode)
    {
        var filter = new RequestFilterDto
        {
            Status = status,
            EmployeeCode = employeeCode
        };

        var result = await _service.SearchAsync(filter);
        return Ok(result); // 200, body là JSON array như spec
    }

    // GET /api/v1/hr/profile-update-requests/{requestId}
    [HttpGet("{requestId:long}")]
    public async Task<ActionResult<RequestDetailDto>> GetRequestDetail(long requestId)
    {
        try
        {
            var dto = await _service.GetDetailAsync(requestId);
            return Ok(dto); // 200, JSON object detail
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error_message = "Request not found" });
        }
    }

    // PATCH /api/v1/hr/profile-update-requests/{requestId}/status
    [HttpPatch("{requestId:long}/status")]
    public async Task<ActionResult<RequestStatusResponseDto>> UpdateStatus(
        long requestId,
        [FromBody] RequestStatusUpdateDto body)
    {
        try
        {
            // lấy hrId từ token, giả sử claim name "sub"
            var hrId = int.Parse(User.FindFirst("sub")!.Value);

            var result = await _service.ChangeStatusAsync(hrId, requestId, body);
            return Ok(result); 
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error_message = ex.Message }); // 400
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error_message = "Request not found" }); // 404
        }
    }
}
