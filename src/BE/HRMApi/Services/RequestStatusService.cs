using HrmApi.Dtos.RequestStatus;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class RequestStatusService : IRequestStatusService
    {
        private readonly IEmployeeRequestRepository _repo;
        private readonly IEmployeeRepository _employeeRepository;

        public RequestStatusService(IEmployeeRequestRepository repo, IEmployeeRepository employeeRepository)
        {
            _repo = repo;
            _employeeRepository = employeeRepository;
        }

        public async Task<IReadOnlyList<EmployeeRequestListItemDto>> GetRequestsByEmployeeAsync(
            string employeeCode,
            EmployeeRequestFilterDto filter)
        {
            return await _repo.GetRequestsByEmployeeAsync(employeeCode, filter);
        }

        public async Task<LeaveRequestDetailDto> GetLeaveDetailAsync(string employeeCode, int requestId)
        {
            var leave = await _repo.GetLeaveRequestAsync(employeeCode, requestId);

            if (leave == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            var r = leave.Request;

            // Map HandoverEmployeeId to employee code
            string? handoverEmployeeCode = null;
            if (leave.HandoverEmployeeId.HasValue)
            {
                var handoverEmp = await _employeeRepository.GetByIdAsync(leave.HandoverEmployeeId.Value);
                if (handoverEmp != null)
                {
                    handoverEmployeeCode = handoverEmp.EmployeeCode;
                }
            }

            return new LeaveRequestDetailDto
            {
                RequestId            = leave.RequestId,
                Status               = r.Status,
                CreatedAt            = r.CreatedAt,
                ApprovedAt           = r.ApprovedAt,
                ApproverName         = r.Approver?.FullName,
                RejectReason         = leave.rejectReason,
                LeaveType            = leave.LeaveType,
                StartDate            = leave.StartDate,
                EndDate              = leave.EndDate,
                HandoverToEmployeeCode = handoverEmployeeCode,
                AttachmentPath       = leave.AttachmentPath,
                Reason               = leave.Reason
            };
        }

        public async Task<OvertimeRequestDetailDto> GetOvertimeDetailAsync(string employeeCode, int requestId)
        {
            var ot = await _repo.GetOvertimeRequestAsync(employeeCode, requestId);

            if (ot == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            var r = ot.Request;

            return new OvertimeRequestDetailDto
            {
                RequestId     = ot.RequestId,
                Status        = r.Status,
                CreatedAt     = r.CreatedAt,
                ApprovedAt    = r.ApprovedAt,
                ApproverName  = r.Approver?.FullName,
                RejectReason  = null,
                OtDate        = ot.OtDate,
                StartTime     = ot.StartTime,
                EndTime       = ot.EndTime,
                TotalHours    = ot.TotalHours,
                ProjectName   = ot.ProjectName,
                Reason        = ot.OtReason
            };
        }

        public async Task<ResignationRequestDetailDto> GetResignationDetailAsync(string employeeCode, int requestId)
        {
            var rg = await _repo.GetResignationRequestAsync(employeeCode, requestId);

            if (rg == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            var r = rg.Request;

            return new ResignationRequestDetailDto
            {
                RequestId              = rg.RequestId,
                Status                 = r.Status,
                CreatedAt              = r.CreatedAt,
                ApprovedAt             = r.ApprovedAt,
                ApproverName           = r.Approver?.FullName,
                RejectReason           = null,
                ProposedLastWorkingDate = rg.ProposedLastWorkingDate,
                HasCompletedHandover   = rg.HasCompletedHandover,
                ResignationReason      = rg.ResignReason,
                HrNote                 = rg.HrNote
            };
        }
    }
}
