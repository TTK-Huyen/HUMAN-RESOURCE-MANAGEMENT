using System.Collections.Generic;
using System.Threading.Tasks;
using HrmApi.Dtos.Requests;

namespace HrmApi.Repositories
{
    public interface IRequestsDashboardRepository
    {
        Task<List<DashboardRequestItemDto>> GetDashboardRequestsAsync(int? departmentId, string? keyword);
    }
}
