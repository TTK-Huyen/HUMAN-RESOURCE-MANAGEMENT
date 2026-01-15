using HrmApi.Dtos;
using HrmApi.Dtos.Employee;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class ProfileUpdateRequestService : IProfileUpdateRequestService
    {
        private readonly IProfileUpdateRequestRepository _requestRepo;
        private readonly IEmployeeRepository _employeeRepo;
        public ProfileUpdateRequestService(
            IProfileUpdateRequestRepository requestRepo,
            IEmployeeRepository employeeRepo)
        {
            _requestRepo = requestRepo;
            _employeeRepo = employeeRepo;
        }

        // ========= API #1: GET LIST =========
        // ⚠️ INTERFACE yêu cầu: Task<IEnumerable<RequestListItemDto>>
        public async Task<IEnumerable<RequestListItemDto>> SearchAsync(RequestFilterDto filter)
        {
            var requests = await _requestRepo.SearchAsync(filter);

            return requests.Select(r => new RequestListItemDto
            {
                RequestId    = r.UpdateRequestId,
                EmployeeCode = r.Employee.EmployeeCode,
                FullName     = r.Employee.EmployeeName,
                CreatedAt    = r.RequestDate,
                Status       = r.Status
            }).ToList();

        }        // ========= API #2: GET DETAIL (BASIC) =========
        public async Task<RequestDetailDto> GetDetailAsync(long requestId)
        {
            var request = await _requestRepo.FindByIdWithDetailsAsync(requestId);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            return new RequestDetailDto
            {
                RequestId  = request.UpdateRequestId,
                EmployeeId = request.EmployeeId,
                Status     = request.Status,
                Details    = request.Details.Select(d => new RequestDetailItemDto
                {
                    FieldName = d.FieldName,
                    OldValue  = d.OldValue,
                    NewValue  = d.NewValue
                }).ToList()
            };
        }

        // ========= API #2: GET DETAIL (ENRICHED) =========
        public async Task<ProfileUpdateRequestDetailDto> GetDetailEnrichedAsync(long requestId)
        {
            var request = await _requestRepo.FindByIdWithDetailsAsync(requestId);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            var reviewedByName = string.Empty;
            if (request.ReviewedBy.HasValue)
            {
                var reviewer = await _employeeRepo.FindByIdAsync(request.ReviewedBy.Value);
                reviewedByName = reviewer?.EmployeeName ?? "Unknown";
            }

            return new ProfileUpdateRequestDetailDto
            {
                RequestId = request.UpdateRequestId,
                EmployeeId = request.EmployeeId,
                EmployeeCode = request.Employee?.EmployeeCode ?? string.Empty,
                EmployeeName = request.Employee?.EmployeeName ?? string.Empty,
                RequestDate = request.RequestDate,
                Status = request.Status,
                ReviewedByName = reviewedByName,
                ReviewedAt = request.ReviewedAt,
                RejectReason = request.RejectReason,
                Comment = request.Comment,
                Details = request.Details.Select(d => new ProfileUpdateRequestDetailItemDto
                {
                    FieldName = d.FieldName,
                    OldValue = d.OldValue,
                    NewValue = d.NewValue
                }).ToList()
            };
        }

        // ========= API #3: PATCH STATUS =========
        public async Task<RequestStatusResponseDto> ChangeStatusAsync(
            int hrId,
            long requestId,
            RequestStatusUpdateDto dto)
        {
            var normalizedStatus = dto.NewStatus.ToUpper(); // APPROVED / REJECTED

            if (normalizedStatus != "APPROVED" && normalizedStatus != "REJECTED")
            {
                throw new ArgumentException("new_status is invalid");
            }

            if (normalizedStatus == "REJECTED" &&
                string.IsNullOrWhiteSpace(dto.RejectReason))
            {
                throw new ArgumentException("reject_reason is required when status is REJECTED");
            }

            var request = await _requestRepo.FindByIdWithDetailsAsync(requestId);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            // ✅ Nếu APPROVED thì apply thay đổi vào Employee
            if (normalizedStatus == "APPROVED")
            {
                var employee = await _employeeRepo.FindByIdAsync(request.EmployeeId)
                              ?? throw new InvalidOperationException("Employee not found");

                foreach (var d in request.Details)
                {
                    switch (d.FieldName)
                    {
                        case "FULL_NAME":
                            employee.FullName = d.NewValue;
                            break;

                        // TODO: thêm từng field khác theo design của bạn
                        default:
                            break;
                    }
                }

                await _employeeRepo.SaveAsync(employee);
            }

            // ✅ Update status + reviewed_by + reviewed_at + reject_reason
            var intId = checked((int)requestId);
            await _requestRepo.UpdateStatusAsync(
                intId,
                normalizedStatus,
                dto.RejectReason,
                hrId
            );

            return new RequestStatusResponseDto
            {
                RequestId     = requestId,
                RequestStatus = normalizedStatus
            };
        }
    
        public async Task<bool> SendProfileUpdateRequestAsync(string employeeCode, ProfileUpdateRequestCreateDto dto)
        {
            var employee = await _employeeRepo.GetByCodeAsync(employeeCode);
            if (employee == null) return false;
            if (dto.Details == null || !dto.Details.Any()) return false;
            foreach (var detail in dto.Details)
            {
                if (string.IsNullOrWhiteSpace(detail.FieldName) || string.IsNullOrWhiteSpace(detail.NewValue))
                    return false;
            }
            var request = new ProfileUpdateRequest
            {
                EmployeeId = employee.Id,
                RequestDate = DateTime.UtcNow,
                Status = "PENDING",
                Details = dto.Details.Select(d => new ProfileUpdateRequestDetail
                {
                    FieldName = d.FieldName,
                    OldValue = d.OldValue,
                    NewValue = d.NewValue
                }).ToList()
            };
            await _requestRepo.AddAsync(request);
            return await _requestRepo.SaveChangesAsync();
        }
    }

}
