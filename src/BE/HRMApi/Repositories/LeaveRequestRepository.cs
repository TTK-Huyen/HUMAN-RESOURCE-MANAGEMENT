using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class LeaveRequestRepository : ILeaveRequestRepository
    {
        private readonly AppDbContext _context;

        public LeaveRequestRepository(AppDbContext context)
        {
            _context = context;
        }


        public async Task AddAsync(LeaveRequest request)
        {
            await _context.LeaveRequests.AddAsync(request);
        }

        public Task SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }
    }
}
