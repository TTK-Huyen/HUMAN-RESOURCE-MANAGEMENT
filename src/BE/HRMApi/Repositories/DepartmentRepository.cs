using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly AppDbContext _context;

        public DepartmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyCollection<Department>> GetAllAsync()
        {
            return await _context.Departments
                                 .AsNoTracking()
                                 .OrderBy(d => d.Name)
                                 .ToListAsync();
        }
    }
}
