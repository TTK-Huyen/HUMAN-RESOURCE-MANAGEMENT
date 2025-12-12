using System.Threading.Tasks;
using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface IRequestsDashboardListService
    {
        Task<DashboardRequestListResponseDto> GetListAsync(
            DashboardRequestFilterDto filter);
    }
}
