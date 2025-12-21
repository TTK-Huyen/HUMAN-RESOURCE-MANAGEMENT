using HrmApi.Dtos;
using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Dtos.Notifications;
using HrmApi.Services.Notifications;

namespace HrmApi.Services
{
    public class RequestApprovalService : IRequestApprovalService
    {
        private readonly IEmployeeRequestRepository _requestRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly INotificationPublisher _noti;
        private readonly IOvertimeRequestRepository _otRepo; 

        public RequestApprovalService(
            IEmployeeRequestRepository requestRepo, 
            IEmployeeRepository employeeRepo,
            INotificationPublisher noti,
            IOvertimeRequestRepository otRepo)
        {
            _requestRepo = requestRepo;
            _employeeRepo = employeeRepo;
            _noti = noti;
            _otRepo = otRepo;
        }

        // =========================================================
        // PHẦN 1: XỬ LÝ DUYỆT ĐƠN NGHỈ PHÉP (LEAVE REQUEST)
        // =========================================================
        public async Task<ManagerLeaveRequestDetailDto> GetLeaveRequestDetailAsync(int requestId)
        {
            var leaveRequest = await _requestRepo.GetLeaveRequestByIdAsync(requestId);
            if (leaveRequest == null)
            {
                throw new KeyNotFoundException("Leave request not found");
            }

            var emp = leaveRequest.Request.Employee;
            var deptName = emp.Department?.Name ?? "N/A";
            var positionName = emp.JobTitle?.Title ?? "N/A";
            
            // Mock data
            int remainingEmployees = 10; 
            bool hasConflict = remainingEmployees < 2; 
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

            if (dto.NewStatus.ToUpper() == "REJECTED" && string.IsNullOrWhiteSpace(dto.RejectReason))
            {
                throw new ArgumentException("Rejection reason is required.");
            }

            string newStatus = dto.NewStatus.ToUpper() == "APPROVED" ? "Approved" : "Rejected";
            
            request.Status = newStatus;
            request.ApprovedAt = DateTime.UtcNow;
            request.ApproverId = dto.HrId; 

            leaveRequest.Status = newStatus == "Approved" 
                ? RequestStatus.Approved 
                : RequestStatus.Rejected;

            await _requestRepo.SaveChangesAsync();
            
            var requester = leaveRequest.Request.Employee;
            var actor = await _employeeRepo.GetByIdAsync(dto.HrId);

            if (actor != null) 
            {
                await _noti.PublishAsync(new NotificationEventDto
                {
                    EventType = newStatus == "Approved" ? "REQUEST_APPROVED" : "REQUEST_REJECTED",
                    RequestType = "LEAVE",
                    RequestId = requestId,
                    ActorUserId = actor.Id,
                    ActorName = actor.FullName,
                    RequesterUserId = requester.Id,
                    RequesterEmail = requester.PersonalEmail,
                    ManagerUserId = actor.Id,
                    ManagerEmail = actor.PersonalEmail,
                    Status = newStatus.ToUpper(),
                    Message = newStatus == "Approved"
                        ? "Yêu cầu nghỉ phép đã được duyệt"
                        : "Yêu cầu nghỉ phép đã bị từ chối"
                });
            }

            return new LeaveRequestApprovalResponseDto
            {
                Message = $"Leave request {newStatus.ToLower()} successfully",
                RequestId = requestId,
                NewStatus = newStatus.ToUpper()
            };
        }

        // =========================================================
        // PHẦN 2: XỬ LÝ DUYỆT OT (OVERTIME REQUEST)
        // =========================================================
        public async Task<ManagerOvertimeRequestDetailDto> GetOvertimeRequestDetailAsync(int requestId)
        {
            var otRequest = await _otRepo.GetOvertimeRequestByIdAsync(requestId);
            if (otRequest == null)
            {
                throw new KeyNotFoundException("Overtime request not found");
            }

            var emp = otRequest.Request.Employee;
            
            // Tính số giờ: Cần ép kiểu double vì TotalHours trong DB của bạn là decimal
            double totalHours = (double)otRequest.TotalHours; 
            int otDaysMonth = 2; // Mock data

            return new ManagerOvertimeRequestDetailDto
            {
                RequestId = otRequest.Id,
                EmployeeId = emp.EmployeeCode,
                EmployeeName = emp.FullName,
                Department = emp.Department?.Name ?? "N/A",
                
                // --- SỬA LỖI TẠI ĐÂY ---
                OtDate = otRequest.Date, // Dùng propery Date thay vì OvertimeDate
                // -----------------------

                StartTime = otRequest.StartTime.ToString(@"hh\:mm"),
                EndTime = otRequest.EndTime.ToString(@"hh\:mm"),
                TotalHours = Math.Round(totalHours, 2),
                
                // --- SỬA LỖI TẠI ĐÂY ---
                Project = otRequest.ProjectName, // Dùng property ProjectName thay vì Project
                // -----------------------

                Reason = otRequest.Reason,
                OtDaysThisMonth = otDaysMonth,
                Status = otRequest.Request.Status
            };
        }

        public async Task<OtRequestApprovalResponseDto> ApproveOvertimeRequestAsync(int requestId, RequestStatusUpdateDto dto)
        {
            var otRequest = await _otRepo.GetOvertimeRequestByIdAsync(requestId);
            if (otRequest == null)
            {
                throw new KeyNotFoundException("Overtime request not found");
            }

            var request = otRequest.Request;
            if (request.Status != "Pending")
            {
                throw new InvalidOperationException($"Request is already {request.Status}");
            }

            if (dto.NewStatus.ToUpper() == "REJECTED" && string.IsNullOrWhiteSpace(dto.RejectReason))
            {
                throw new ArgumentException("Rejection reason is required.");
            }

            // Rule: Không quá 4 giờ/ngày
            // Ép kiểu decimal sang double để so sánh
            if (dto.NewStatus.ToUpper() == "APPROVED" && (double)otRequest.TotalHours > 4.0)
            {
                throw new InvalidOperationException("Cannot approve: Overtime exceeds 4 hours limit per day.");
            }

            string newStatus = dto.NewStatus.ToUpper() == "APPROVED" ? "Approved" : "Rejected";
            DateTime now = DateTime.UtcNow;

            request.Status = newStatus;
            request.ApprovedAt = now;
            request.ApproverId = dto.HrId; 

            otRequest.Status = newStatus == "Approved" 
                ? RequestStatus.Approved 
                : RequestStatus.Rejected;

            await _otRepo.SaveChangesAsync();

            var requester = request.Employee;
            var approver = await _employeeRepo.GetByIdAsync(dto.HrId);

            if (approver != null)
            {
                // Format ngày dùng otRequest.Date
                await _noti.PublishAsync(new NotificationEventDto
                {
                    EventType = newStatus == "Approved" ? "OT_APPROVED" : "OT_REJECTED",
                    RequestType = "OVERTIME",
                    RequestId = requestId,
                    ActorUserId = approver.Id,
                    ActorName = approver.FullName,
                    RequesterUserId = requester.Id,
                    RequesterEmail = requester.PersonalEmail,
                    ManagerUserId = approver.Id,
                    ManagerEmail = approver.PersonalEmail,
                    Status = newStatus.ToUpper(),
                    Message = $"Yêu cầu OT ngày {otRequest.Date:dd/MM} đã được {newStatus}" 
                });
            }

            return new OtRequestApprovalResponseDto
            {
                Message = $"OT request {newStatus.ToLower()} successfully.",
                RequestId = requestId,
                NewStatus = newStatus.ToUpper(),
                ApproveAt = now
            };
        }
    }
}