using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface ILeaveRequestRepository
    {
        Task<LeaveRequest?> GetByIdForEmployeeAsync(string employeeCode, int requestId);
        Task AddAsync(LeaveRequest request);
        Task SaveChangesAsync();
    }
}
