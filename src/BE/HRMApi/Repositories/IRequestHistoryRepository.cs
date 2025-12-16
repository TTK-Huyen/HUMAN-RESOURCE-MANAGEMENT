using System.Threading.Tasks;
using HrmApi.Dtos.Requests;

namespace HrmApi.Repositories
{
    public interface IRequestHistoryRepository
    {
        Task<RequestApprovalHistoryResponseDto?> GetApprovalHistoryAsync(int requestId);
    }
}
