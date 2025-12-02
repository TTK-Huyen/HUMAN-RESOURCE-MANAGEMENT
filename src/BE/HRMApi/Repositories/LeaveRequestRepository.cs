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

        public async Task<LeaveRequest?> GetByIdForEmployeeAsync(string employeeCode, int requestId)
        {
            return await _context.LeaveRequests
                .Include(r => r.Employee)
                .AsNoTracking()
                .FirstOrDefaultAsync(r =>
                    r.Id == requestId && r.Employee.EmployeeCode == employeeCode);
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
