using System.Collections.Generic;
using System.Threading.Tasks;
using HrmApi.Dtos;
using HrmApi.Dtos.Mappers;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    // Chịu trách nhiệm: nghiệp vụ liên quan đến Department
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _departmentRepository;

        public DepartmentService(IDepartmentRepository departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        public async Task<IReadOnlyCollection<DepartmentDto>> GetAllAsync()
        {
            var departments = await _departmentRepository.GetAllAsync();
            return departments.ToDtos();
        }
    }
}
