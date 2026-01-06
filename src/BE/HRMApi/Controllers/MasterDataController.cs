using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HrmApi.Data;
using HrmApi.Models;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/master-data")]
    public class MasterDataController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MasterDataController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("employee-form")]
        public async Task<IActionResult> GetEmployeeFormMasterData()
        {
            var departments = await _context.Departments
                .Select(d => new { id = d.Id, name = d.Name })
                .ToListAsync();

            var jobTitles = await _context.JobTitles
                .Select(j => new { id = j.Id, name = j.Title })
                .ToListAsync();

            var roles = await _context.Roles
                .Select(r => new { id = r.RoleId, name = r.RoleName })
                .ToListAsync();

            // Managers = User có role MANAGER
            var managers = await _context.UserAccounts
                .Where(u => u.Role.RoleCode == "MANAGER" && u.Status == AccountStatus.ACTIVE)
                .Select(u => new { id = u.EmployeeId, name = u.Employee.FullName })
                .ToListAsync();

            return Ok(new
            {
                departments,
                jobTitles,
                roles,
                managers
            });
        }
    }
}
