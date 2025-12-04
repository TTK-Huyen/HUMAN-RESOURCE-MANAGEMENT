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
    }
}
