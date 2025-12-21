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

        public async Task AddAsync(OvertimeRequest request)
        {
            await _context.OvertimeRequests.AddAsync(request);
        }

        public Task SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }

        public async Task<OvertimeRequest?> GetOvertimeRequestByIdAsync(int requestId)
        {
            return await _context.OvertimeRequests
                .Include(o => o.Request)
                    .ThenInclude(r => r.Employee)
                        .ThenInclude(e => e.Department)
                .Include(o => o.Request)
                    .ThenInclude(r => r.Employee)
                        .ThenInclude(e => e.JobTitle)
                .FirstOrDefaultAsync(o => o.Id == requestId);
        }
    }
}
