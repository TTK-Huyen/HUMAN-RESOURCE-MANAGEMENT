using HrmApi.Data;
using HrmApi.Dtos;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class ProfileUpdateRequestRepository : IProfileUpdateRequestRepository
    {
        private readonly AppDbContext _context;

        public ProfileUpdateRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProfileUpdateRequest>> SearchAsync(RequestFilterDto filter)
        {
            var query = _context.ProfileUpdateRequests
                .Include(r => r.Employee)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                var status = filter.Status.ToUpper();
                query = query.Where(r => r.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(filter.EmployeeCode))
            {
                query = query.Where(r => r.Employee.EmployeeCode == filter.EmployeeCode);
            }

            return await query
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();
        }

        public async Task<ProfileUpdateRequest?> FindByIdWithDetailsAsync(long id)
        {
            return await _context.ProfileUpdateRequests
                .Include(r => r.Details)
                .Include(r => r.Employee)
                .FirstOrDefaultAsync(r => r.UpdateRequestId == id);
        }

        public async Task UpdateStatusAsync(int id, string newStatus, string? reason, int hrId)
        {
            var hrExists = await _context.Employees
                .AnyAsync(e => e.EmployeeId == hrId);

            if (!hrExists)
            {
                throw new Exception($"HrId {hrId} not found in employees table");
            }

            var entity = await _context.ProfileUpdateRequests.FindAsync(id);
            if (entity == null)
            {
                throw new Exception($"ProfileUpdateRequest {id} not found");
            }

            entity.Status       = newStatus;
            entity.RejectReason = reason;
            entity.ReviewedBy   = hrId;
            entity.ReviewedAt   = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
