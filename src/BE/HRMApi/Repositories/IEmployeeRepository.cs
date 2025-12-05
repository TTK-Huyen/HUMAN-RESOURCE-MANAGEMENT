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

        /// <summary>
        /// Lấy thông tin hồ sơ cá nhân đầy đủ theo id (bao gồm các navigation properties).
        /// </summary>
        Task<Employee?> GetProfileByIdAsync(int id);

        /// <summary>
        /// Thêm mới một yêu cầu cập nhật hồ sơ.
        /// </summary>
        void AddProfileUpdateRequest(ProfileUpdateHistory request);

        /// <summary>
        /// Lưu thay đổi vào database.
        /// </summary>
        Task<int> SaveChangesAsync();
        
        Task<Employee?> FindByIdAsync(int id);
        Task SaveAsync(Employee employee);
    }
}
