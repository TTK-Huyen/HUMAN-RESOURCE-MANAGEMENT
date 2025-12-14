using System.Threading.Tasks;
using HrmApi.Dtos.Requests;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class RequestsDashboardListService : IRequestsDashboardListService
    {
        private readonly IRequestsDashboardRepository _repo;

        public RequestsDashboardListService(IRequestsDashboardRepository repo)
        {
            _repo = repo;
        }

        public async Task<DashboardRequestListResponseDto> GetListAsync(
            DashboardRequestFilterDto filter)
        {
            var items = await _repo.GetDashboardRequestsAsync(
                filter?.DepartmentId,
                filter?.Keyword);

            return new DashboardRequestListResponseDto
            {
                Items = items
            };
        }
    }
}
