using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IEmployeeRepository
    {
        /// <summary>
        /// Tìm employee theo mã employeeCode (ví dụ: "EMP001").
        /// </summary>
        Task<Employee?> GetByCodeAsync(string employeeCode);

        /// <summary>
        /// Lấy thông tin hồ sơ cá nhân đầy đủ (bao gồm các navigation properties) theo mã employeeCode.
        /// </summary>
        Task<Employee?> GetProfileByCodeAsync(string employeeCode);
    }
}
