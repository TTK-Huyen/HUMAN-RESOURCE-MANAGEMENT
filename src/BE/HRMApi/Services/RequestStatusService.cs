using HrSystem.Dtos.RequestStatus;
using HrSystem.Repositories;

namespace HrSystem.Services
{
    public class RequestStatusService : IRequestStatusService
    {
        private readonly IEmployeeRequestRepository _repo;

        public RequestStatusService(IEmployeeRequestRepository repo)
        {
            _repo = repo;
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

            return new LeaveRequestDetailDto
            {
                RequestId            = leave.RequestId,
                Status               = r.Status,
                CreatedAt            = r.CreatedAt,
                ApprovedAt           = null, // chưa có cột trong DB
                ApproverName         = r.Approver?.FullName,
                RejectReason         = null, // chưa có cột trong DB
                LeaveType            = leave.LeaveType,
                StartDate            = leave.StartDate,
                EndDate              = leave.EndDate,
                HandoverToEmployeeId = leave.HandoverEmployeeId,
                AttachmentPath       = leave.AttachmentPath,
                Reason               = null
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
                ApprovedAt    = null,
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
                ApprovedAt             = null,
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
