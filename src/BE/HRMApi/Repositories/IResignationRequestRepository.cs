using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IResignationRequestRepository
    {
    
        Task AddAsync(ResignationRequest request);
        Task SaveChangesAsync();
    
        Task<ResignationRequest?> GetResignationRequestByIdAsync(int requestId);
    }
}
