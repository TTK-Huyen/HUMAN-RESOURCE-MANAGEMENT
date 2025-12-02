using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class OvertimeRequestRepository : IOvertimeRequestRepository
    {
        private readonly AppDbContext _context;

        public OvertimeRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<OvertimeRequest?> GetByIdForEmployeeAsync(string employeeCode, int requestId)
        {
            return await _context.OvertimeRequests
                .Include(r => r.Employee)
                .AsNoTracking()
                .FirstOrDefaultAsync(r =>
                    r.Id == requestId && r.Employee.EmployeeCode == employeeCode);
        }

        public async Task AddAsync(OvertimeRequest request)
        {
            await _context.OvertimeRequests.AddAsync(request);
        }

        public Task SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }
    }
}
