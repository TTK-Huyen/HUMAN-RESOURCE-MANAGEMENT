using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IOvertimeRequestRepository
    {
        Task AddAsync(OvertimeRequest request);
        Task SaveChangesAsync();

        Task<OvertimeRequest?> GetOvertimeRequestByIdAsync(int requestId);
    
        Task<int> CountOtDaysInMonthAsync(int employeeId, int month, int year);
    }

}
