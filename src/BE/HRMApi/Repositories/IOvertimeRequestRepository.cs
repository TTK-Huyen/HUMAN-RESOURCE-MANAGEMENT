using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IOvertimeRequestRepository
    {
        Task<OvertimeRequest?> GetByIdForEmployeeAsync(string employeeCode, int requestId);
        Task AddAsync(OvertimeRequest request);
        Task SaveChangesAsync();
    }
}
