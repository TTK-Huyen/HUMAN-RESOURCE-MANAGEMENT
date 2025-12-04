using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface ILeaveRequestRepository
    {
        Task AddAsync(LeaveRequest request);
        Task SaveChangesAsync();
    }
}
