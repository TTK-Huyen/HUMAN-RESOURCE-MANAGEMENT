using HrmApi.Dtos;
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

        }

        // ========= API #2: GET DETAIL =========
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
    }
}
