using System.Collections.Generic;
using System.Threading.Tasks;
using HrmApi.Dtos;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")] // → /api/v1/departments
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        // GET /api/v1/departments
        [HttpGet]
        public async Task<ActionResult<IReadOnlyCollection<DepartmentDto>>> GetDepartments()
        {
            var departments = await _departmentService.GetAllAsync();
            return Ok(departments);
        }
    }
}
