using HrSystem.Models;

namespace HrSystem.Repositories
{
    public interface IEmployeeRepository
    {
        Task<Employee?> FindByIdAsync(int id);
        Task SaveAsync(Employee employee);
    }
}
