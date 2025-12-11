using System.Threading.Tasks;
using HrmApi.Dtos.Requests;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    // SRP: Service này chỉ lo nghiệp vụ dashboard summary
    public class RequestsDashboardService : IRequestsDashboardService
    {
        private readonly IEmployeeRequestRepository _employeeRequestRepository;

        public RequestsDashboardService(IEmployeeRequestRepository employeeRequestRepository)
        {
            _employeeRequestRepository = employeeRequestRepository;
        }

        public async Task<RequestDashboardSummaryDto> GetSummaryAsync(
            RequestDashboardSummaryFilterDto filter)
        {
            filter ??= new RequestDashboardSummaryFilterDto();

            var summary = await _employeeRequestRepository.GetDashboardSummaryAsync(
                filter.DepartmentId,
                filter.Keyword);

            if (summary == null)
            {
                return new RequestDashboardSummaryDto
                {
                    TotalRequests = 0,
                    PendingCount = 0,
                    ApprovedCount = 0,
                    RejectedCount = 0,
                };
            }

            return new RequestDashboardSummaryDto
            {
                TotalRequests = summary.TotalRequests,
                PendingCount = summary.PendingCount,
                ApprovedCount = summary.ApprovedCount,
                RejectedCount = summary.RejectedCount,
            };
        }
    }
}
