using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Employee?> GetByCodeAsync(string employeeCode)
        {
            // So sánh theo mã nhân viên, bỏ qua hoa thường nếu muốn
            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                // .FirstOrDefaultAsync(e => e.EmployeeCode.ToLower() == employeeCode.ToLower());
        }

        public async Task<Employee?> GetProfileByCodeAsync(string employeeCode)
        {
            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.DirectManager)
                .Include(e => e.PhoneNumbers)
                .Include(e => e.BankAccounts)
                .Include(e => e.Education)
                .Include(e => e.ProfileUpdateHistory)
                .ThenInclude(h => h.Details)
                .FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
        }

        public async Task<Employee?> GetProfileByIdAsync(int id)
        {
            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.DirectManager)
                .Include(e => e.PhoneNumbers)
                .Include(e => e.BankAccounts)
                .Include(e => e.Education)
                .Include(e => e.ProfileUpdateHistory)
                .ThenInclude(h => h.Details)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public void AddProfileUpdateRequest(ProfileUpdateHistory request)
        {
            _context.ProfileUpdateHistories.Add(request);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
