using System.Threading.Tasks;
using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface IRequestHistoryService
    {
        Task<RequestApprovalHistoryResponseDto?> GetApprovalHistoryAsync(int requestId);
    }
}
