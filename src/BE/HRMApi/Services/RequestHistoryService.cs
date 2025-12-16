using System.Threading.Tasks;
using HrmApi.Dtos.Requests;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class RequestHistoryService : IRequestHistoryService
    {
        private readonly IRequestHistoryRepository _repo;

        public RequestHistoryService(IRequestHistoryRepository repo)
        {
            _repo = repo;
        }

        public Task<RequestApprovalHistoryResponseDto?> GetApprovalHistoryAsync(int requestId)
            => _repo.GetApprovalHistoryAsync(requestId);
    }
}
