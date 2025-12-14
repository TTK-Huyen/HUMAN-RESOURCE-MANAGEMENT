using HrmApi.Dtos;
using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class RequestApprovalService : IRequestApprovalService
    {
        private readonly IEmployeeRequestRepository _requestRepo;
        private readonly IEmployeeRepository _employeeRepo;

        public RequestApprovalService(
            IEmployeeRequestRepository requestRepo, 
            IEmployeeRepository employeeRepo)
        {
            _requestRepo = requestRepo;
            _employeeRepo = employeeRepo;
        }

        public async Task<ManagerLeaveRequestDetailDto> GetLeaveRequestDetailAsync(int requestId)
        {
            // Fetch request (Need to implement GetById in Repo that includes Employee & Dept)
            var leaveRequest = await _requestRepo.GetLeaveRequestByIdAsync(requestId);
            if (leaveRequest == null)
            {
                throw new KeyNotFoundException("Leave request not found");
            }

            var emp = leaveRequest.Request.Employee;
            var deptName = emp.Department?.Name ?? "N/A";
            var positionName = emp.JobTitle?.Title ?? "N/A"; // Assuming JobTitle has Title property
            
            // Mock logic for "Remaining employees in department" (Conflict check)
            // In real app: Count employees in this Dept NOT on leave during StartDate-EndDate
            int remainingEmployees = 10; 
            bool hasConflict = remainingEmployees < 2; 

            // Mock logic for "Remaining leave days"
            // In real app: Fetch from LeaveBalance table
            float remainingLeave = 12.0f;

            return new ManagerLeaveRequestDetailDto
            {
                RequestId = leaveRequest.RequestId,
                EmployeeId = emp.EmployeeCode,
                EmployeeName = emp.FullName,
                Department = deptName,
                Position = positionName,
                LeaveType = leaveRequest.LeaveType,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                Reason = leaveRequest.Reason,
                HandoverPersonName = leaveRequest.HandoverEmployee?.FullName,
                AttachmentPath = leaveRequest.AttachmentPath,
                Status = leaveRequest.Request.Status,
                CreatedAt = leaveRequest.Request.CreatedAt,
                RemainingLeaveDays = remainingLeave,
                RemainingEmployeesInDepartment = remainingEmployees,
                HasConflictWarning = hasConflict
            };
        }

        public async Task<LeaveRequestApprovalResponseDto> ApproveLeaveRequestAsync(int requestId, RequestStatusUpdateDto dto)
        {
            var leaveRequest = await _requestRepo.GetLeaveRequestByIdAsync(requestId);
            if (leaveRequest == null)
            {
                throw new KeyNotFoundException("Leave request not found");
            }

            var request = leaveRequest.Request;

            if (request.Status != "Pending")
            {
                throw new InvalidOperationException($"Request is already {request.Status}");
            }

            // Validations
            if (dto.NewStatus.ToUpper() == "REJECTED" && string.IsNullOrWhiteSpace(dto.RejectReason))
            {
                throw new ArgumentException("Rejection reason is required.");
            }

            // Update Status
            string newStatus = dto.NewStatus.ToUpper() == "APPROVED" ? "Approved" : "Rejected";
            
            request.Status = newStatus;
            request.ApprovedAt = DateTime.UtcNow;
            request.ApproverId = dto.HrId; // Using Employee_ID from DTO as Approver

            leaveRequest.Status = newStatus == "Approved" 
                ? RequestStatus.Approved 
                : RequestStatus.Rejected;

            // TODO: Update Leave Balance if Approved (Logic skipped for now)
            // TODO: Send Notification (Logic skipped for now)

            await _requestRepo.SaveChangesAsync();

            return new LeaveRequestApprovalResponseDto
            {
                Message = $"Leave request {newStatus.ToLower()} successfully",
                RequestId = requestId,
                NewStatus = newStatus.ToUpper()
            };
        }
    }
}