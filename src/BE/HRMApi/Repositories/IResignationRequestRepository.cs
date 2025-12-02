using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IResignationRequestRepository
    {
        Task<ResignationRequest?> GetByIdForEmployeeAsync(string employeeCode, int requestId);
        Task AddAsync(ResignationRequest request);
        Task SaveChangesAsync();
    }
}
