using HrSystem.Dtos.RequestStatus;
using HrSystem.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Controllers
{
    [ApiController]
    [Route("api/v1/employees/{employeeCode}/requests")]
    public class RequestStatusController : ControllerBase
    {
        private readonly IRequestStatusService _requestService;

        public RequestStatusController(IRequestStatusService requestService)
        {
            _requestService = requestService;
        }

        // 1) GET LIST
        // GET /api/v1/employees/{employeeCode}/requests?type=&status=&fromDate=&toDate=&page=&pageSize=
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeRequestListItemDto>>> GetRequests(
            string employeeCode,
            [FromQuery] EmployeeRequestFilterDto filter)
        {
            var result = await _requestService.GetRequestsByEmployeeAsync(employeeCode, filter);
            return Ok(result);
        }

        // 2) GET DETAIL - LEAVE
        // GET /api/v1/employees/{employeeCode}/requests/leave/{requestId}
        [HttpGet("leave/{requestId:int}")]
        public async Task<ActionResult<LeaveRequestDetailDto>> GetLeaveRequestDetail(
            string employeeCode,
            int requestId)
        {
            try
            {
                var dto = await _requestService.GetLeaveDetailAsync(employeeCode, requestId);
                return Ok(dto);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error_message = "Request not found" });
            }
        }

        // 3) GET DETAIL - OVERTIME
        // GET /api/v1/employees/{employeeCode}/requests/overtime/{requestId}
        [HttpGet("overtime/{requestId:int}")]
        public async Task<ActionResult<OvertimeRequestDetailDto>> GetOvertimeRequestDetail(
            string employeeCode,
            int requestId)
        {
            try
            {
                var dto = await _requestService.GetOvertimeDetailAsync(employeeCode, requestId);
                return Ok(dto);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error_message = "Request not found" });
            }
        }

        // 4) GET DETAIL - RESIGNATION
        // GET /api/v1/employees/{employeeCode}/requests/resignation/{requestId}
        [HttpGet("resignation/{requestId:int}")]
        public async Task<ActionResult<ResignationRequestDetailDto>> GetResignationRequestDetail(
            string employeeCode,
            int requestId)
        {
            try
            {
                var dto = await _requestService.GetResignationDetailAsync(employeeCode, requestId);
                return Ok(dto);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error_message = "Request not found" });
            }
        }
    }
}
