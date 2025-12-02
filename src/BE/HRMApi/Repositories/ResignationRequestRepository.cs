using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class ResignationRequestRepository : IResignationRequestRepository
    {
        private readonly AppDbContext _context;

        public ResignationRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ResignationRequest?> GetByIdForEmployeeAsync(string employeeCode, int requestId)
        {
            return await _context.ResignationRequests
                .Include(r => r.Employee)
                .AsNoTracking()
                .FirstOrDefaultAsync(r =>
                    r.Id == requestId && r.Employee.EmployeeCode == employeeCode);
        }

        public async Task AddAsync(ResignationRequest request)
        {
            await _context.ResignationRequests.AddAsync(request);
        }

        public Task SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }
    }
}
