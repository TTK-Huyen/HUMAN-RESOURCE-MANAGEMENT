using System.Threading.Tasks;
using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface IRequestsDashboardService
    {
        Task<RequestDashboardSummaryDto> GetSummaryAsync(
            RequestDashboardSummaryFilterDto filter);
    }
}
