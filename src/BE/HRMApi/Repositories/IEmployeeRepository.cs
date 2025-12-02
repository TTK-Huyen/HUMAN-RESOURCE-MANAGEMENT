using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IEmployeeRepository
    {
        /// <summary>
        /// Tìm employee theo mã employeeCode (ví dụ: "EMP001").
        /// </summary>
        Task<Employee?> GetByCodeAsync(string employeeCode);
    }
}
