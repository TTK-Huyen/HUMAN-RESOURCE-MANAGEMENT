using HrSystem.Data;
using HrSystem.Dtos;
using HrSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Repositories
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

        public async Task UpdateStatusAsync(long id, string newStatus, string? reason, int hrId)
        {
            var request = await _context.ProfileUpdateRequests
                .FirstOrDefaultAsync(r => r.UpdateRequestId == id);

            if (request == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            request.Status = newStatus;       // "APPROVED" | "REJECTED"
            request.RejectReason = reason;
            request.ReviewedBy = hrId;
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
