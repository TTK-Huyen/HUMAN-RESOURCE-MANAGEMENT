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

        private readonly IResignationRequestRepository _resignationRepo;
        public RequestApprovalService(
            IEmployeeRequestRepository requestRepo, 
            IEmployeeRepository employeeRepo,
            INotificationPublisher noti,
            IOvertimeRequestRepository otRepo,
            IResignationRequestRepository resignationRepo)
        {
            _requestRepo = requestRepo;
            _employeeRepo = employeeRepo;
            _noti = noti;
            _otRepo = otRepo;
            _resignationRepo = resignationRepo;
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
                        ? "The leave request has been approved."
                        : "The leave request has been rejected."
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
        // PHẦN 2: XỬ LÝ DUYỆT OT (OVERTIME REQUEST) - UPDATE 2.14
        // =========================================================
        public async Task<ManagerOvertimeRequestDetailDto> GetOvertimeRequestDetailAsync(int requestId)
        {
            var otRequest = await _otRepo.GetOvertimeRequestByIdAsync(requestId);
            if (otRequest == null)
            {
                throw new KeyNotFoundException("Overtime request not found");
            }

            var emp = otRequest.Request.Employee;
            double totalHours = (double)otRequest.TotalHours;

            // 1. Tính thật số ngày OT trong tháng (Fix Mock Data)
            int otDaysMonth = await _otRepo.CountOtDaysInMonthAsync(emp.Id, otRequest.Date.Month, otRequest.Date.Year);

            return new ManagerOvertimeRequestDetailDto
            {
                RequestId = otRequest.Id,
                EmployeeId = emp.Id,
                EmployeeName = emp.FullName,
                Department = emp.Department?.Name ?? "N/A",
                OtDate = otRequest.Date,
                StartTime = otRequest.StartTime.ToString(@"hh\:mm"),
                EndTime = otRequest.EndTime.ToString(@"hh\:mm"),
                TotalHours = Math.Round(totalHours, 2),
                Project = otRequest.ProjectName ?? "N/A", 
                Reason = otRequest.Reason,
                OtDaysThisMonth = otDaysMonth, 
                Status = otRequest.Request.Status
            };
        }

        public async Task<OtRequestApprovalResponseDto> ApproveOvertimeRequestAsync(int requestId, RequestStatusUpdateDto dto)
        {
            var otRequest = await _otRepo.GetOvertimeRequestByIdAsync(requestId);
            if (otRequest == null) throw new KeyNotFoundException("Overtime request not found");

            var request = otRequest.Request;
            if (request.Status != "Pending") throw new InvalidOperationException($"Request is already {request.Status}");

            var statusInput = dto.NewStatus?.Trim().ToUpper();
            string newStatus;
            if (statusInput == "APPROVED") newStatus = "Approved";
            else if (statusInput == "REJECTED") newStatus = "Rejected";
            else throw new ArgumentException($"Invalid Status. Accept 'APPROVED' or 'REJECTED'.");

            if (newStatus == "Rejected" && string.IsNullOrWhiteSpace(dto.RejectReason))
            {
                throw new ArgumentException("Rejection reason is required.");
            }

            // --- KIỂM TRA BUSINESS RULES ---
            
            if (newStatus == "Approved")
            {
                // Rule 1: Không quá 4 giờ/ngày
                if ((double)otRequest.TotalHours > 4.0)
                {
                    throw new InvalidOperationException("Cannot approve: Overtime exceeds 4 hours limit per day.");
                }

                // Rule 2: Phải duyệt TRƯỚC khi OT bắt đầu (Update 2.14)
                // Logic: Ghép ngày + giờ bắt đầu để so sánh với thời điểm hiện tại (UTC)
                DateTime otStartDateTime = otRequest.Date.Date.Add(otRequest.StartTime); // Date + Time
                
                // Lưu ý: Cần đảm bảo so sánh cùng múi giờ. Giả sử hệ thống dùng UTC.
                // Nếu quy định khắt khe: Manager phải duyệt trước giờ làm.
                if (DateTime.UtcNow > otStartDateTime)
                {
                    // Tùy chính sách công ty: Có thể chặn luôn hoặc chỉ cảnh báo.
                    // Theo User Story "Only considered valid if...", mình sẽ chặn.
                    throw new InvalidOperationException("Cannot approve: Approval must happen before the OT start time (Policy Rule).");
                }
            }
            // -------------------------------

            // Logic tìm người duyệt (Approver) - Giữ nguyên logic Auto-assign cũ
            Employee? approver = null;
            if (dto.HrId > 0)
            {
                approver = await _employeeRepo.GetByIdAsync(dto.HrId);
                if (approver == null) throw new ArgumentException($"Approver with ID {dto.HrId} not found.");
            }
            else
            {
                var allEmployees = await _employeeRepo.GetAllAsync();
                approver = allEmployees.FirstOrDefault(e => 
                    e.JobTitle != null && 
                    (e.JobTitle.Title.Contains("Manager") || e.JobTitle.Title.Contains("HR") || e.JobTitle.Title.Contains("Admin"))
                ) ?? allEmployees.FirstOrDefault();

                if (approver == null) throw new InvalidOperationException("System error: Could not auto-assign an Approver.");
            }

            // Update Database
            DateTime now = DateTime.UtcNow;
            request.Status = newStatus;
            request.ApprovedAt = now;
            request.ApproverId = approver.Id;
            otRequest.Status = newStatus == "Approved" ? RequestStatus.Approved : RequestStatus.Rejected;

            await _otRepo.SaveChangesAsync();

            // Gửi thông báo
            var requester = request.Employee;
            await _noti.PublishAsync(new NotificationEventDto
            {
                EventType = newStatus == "Approved" ? "REQUEST_APPROVED" : "REQUEST_REJECTED",
                RequestType = "OT",
                RequestId = requestId,
                ActorUserId = approver.Id,
                ActorName = approver.FullName,
                RequesterUserId = requester.Id,
                RequesterEmail = requester.PersonalEmail,
                ManagerUserId = approver.Id,
                ManagerEmail = approver.PersonalEmail,
                Status = newStatus.ToUpper(),
                Message = newStatus == "Approved" 
                    ? $"The overtime request for {otRequest.Date:dd/MM} has been approved."
                    : $"The overtime request for {otRequest.Date:dd/MM} has been rejected."
            });

            return new OtRequestApprovalResponseDto
            {
                Message = "OT request approved successfully.", // Khớp message Spec
                RequestId = requestId,
                NewStatus = newStatus.ToUpper(),
                ApproveAt = now
            };
        }

        // =========================================================
        // PHẦN 3: XỬ LÝ DUYỆT ĐƠN NGHỈ VIỆC (RESIGNATION REQUEST) - MỚI
        // =========================================================
        public async Task<ManagerResignationRequestDetailDto> GetResignationRequestDetailAsync(int requestId)
        {
            var resRequest = await _resignationRepo.GetResignationRequestByIdAsync(requestId);
            if (resRequest == null)
            {
                throw new KeyNotFoundException("Resignation request not found");
            }

            var emp = resRequest.Employee;
            
            return new ManagerResignationRequestDetailDto
            {
                RequestId = resRequest.Id,
                EmployeeId = emp.Id,
                EmployeeName = emp.FullName,
                Department = emp.Department?.Name ?? "N/A",
                LastWorkingDate = resRequest.ResignationDate, // Mapping ProposedLastWorkingDate
                Reason = resRequest.Reason,
                HandoverCompleted = resRequest.HasCompletedHandover,
                HrNote = resRequest.HrNote,
                Status = resRequest.Request.Status,
                CreatedAt = resRequest.CreatedAt
            };
        }

        public async Task<ResignationRequestApprovalResponseDto> ApproveResignationRequestAsync(int requestId, RequestStatusUpdateDto dto)
        {
            // 1. Tìm Request
            var resRequest = await _resignationRepo.GetResignationRequestByIdAsync(requestId);
            if (resRequest == null)
            {
                throw new KeyNotFoundException("Resignation request not found");
            }

            var request = resRequest.Request;
            if (request.Status != "Pending")
            {
                throw new InvalidOperationException($"Request is already {request.Status}");
            }

            // 2. Validate Status
            var statusInput = dto.NewStatus?.Trim().ToUpper();
            string newStatus;
            if (statusInput == "APPROVED") newStatus = "Approved";
            else if (statusInput == "REJECTED") newStatus = "Rejected";
            else throw new ArgumentException($"Invalid Status: '{dto.NewStatus}'. Only accept 'APPROVED' or 'REJECTED'.");

            if (newStatus == "Rejected" && string.IsNullOrWhiteSpace(dto.RejectReason))
            {
                throw new ArgumentException("Rejection reason is required.");
            }

            // 3. Tìm người duyệt (Approver) - Auto Assign nếu HrId = 0
            Employee? approver = null;
            if (dto.HrId > 0)
            {
                approver = await _employeeRepo.GetByIdAsync(dto.HrId);
                if (approver == null) throw new ArgumentException($"Approver with ID {dto.HrId} not found.");
            }
            else
            {
                var allEmployees = await _employeeRepo.GetAllAsync();
                approver = allEmployees.FirstOrDefault(e => 
                    e.JobTitle != null && 
                    (e.JobTitle.Title.Contains("Manager") || e.JobTitle.Title.Contains("HR") || e.JobTitle.Title.Contains("Admin"))
                ) ?? allEmployees.FirstOrDefault();

                if (approver == null) throw new InvalidOperationException("System error: Could not auto-assign an Approver.");
            }

            // 4. Update Trạng thái Request
            DateTime now = DateTime.UtcNow;
            request.Status = newStatus;
            request.ApprovedAt = now;
            request.ApproverId = approver.Id;
            // Lưu lý do từ chối vào Note nếu cần (ResignationRequest có HrNote)
            if (newStatus == "Rejected")
            {
                resRequest.HrNote = dto.RejectReason;
            }

            resRequest.Status = newStatus == "Approved" ? RequestStatus.Approved : RequestStatus.Rejected;

            // 5. BUSINESS RULE: Nếu Approved -> Update trạng thái nhân viên -> "In Offboarding Process"
            if (newStatus == "Approved")
            {
                var employeeToUpdate = resRequest.Employee;
                if (employeeToUpdate != null)
                {
                    // Cập nhật trạng thái nhân viên
                    employeeToUpdate.Status = "In Offboarding Process"; 
                    
                    // (Optional) Có thể set ContractEndDate = LastWorkingDate nếu cần
                    // employeeToUpdate.ContractEndDate = resRequest.ResignationDate;
                }
            }

            await _resignationRepo.SaveChangesAsync();

            // 6. Gửi thông báo
            var requester = resRequest.Employee;
            await _noti.PublishAsync(new NotificationEventDto
            {
                EventType = newStatus == "Approved" ? "RESIGNATION_APPROVED" : "RESIGNATION_REJECTED",
                RequestType = "RESIGNATION",
                RequestId = requestId,
                ActorUserId = approver.Id,
                ActorName = approver.FullName,
                RequesterUserId = requester.Id,
                RequesterEmail = requester.PersonalEmail,
                ManagerUserId = approver.Id,
                ManagerEmail = approver.PersonalEmail,
                Status = newStatus.ToUpper(),
                Message = newStatus == "Approved" 
                    ? "The resignation request has been approved. The offboarding process has started." 
                    : "The resignation request has been rejected."
            });

            return new ResignationRequestApprovalResponseDto
            {
                Message = newStatus == "Approved" 
                    ? "Resignation approved. Offboarding process activated." 
                    : "Resignation rejected.",
                RequestId = requestId,
                NewStatus = newStatus.ToUpper(),
                ApproveAt = now
            };
        }
    }
}