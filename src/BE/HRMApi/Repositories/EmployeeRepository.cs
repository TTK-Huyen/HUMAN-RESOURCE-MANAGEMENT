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
    }
}
