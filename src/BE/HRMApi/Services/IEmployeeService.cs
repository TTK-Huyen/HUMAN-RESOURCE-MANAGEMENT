using HrmApi.Dtos.Employee;

namespace HrmApi.Services
{
    public interface IEmployeeService
    {
        /// <summary>
        /// Lấy thông tin hồ sơ cá nhân cho employeeCode.
        /// </summary>
        Task<EmployeeProfileDto?> GetProfileAsync(string employeeCode);

        /// <summary>
        /// Lấy thông tin hồ sơ cá nhân theo id, chỉ cho phép truy cập nếu employeeCode khớp với id.
        /// </summary>
        Task<EmployeeProfileDto?> GetProfileByIdAsync(int id, string employeeCode);

        /// <summary>
        /// Gửi yêu cầu cập nhật hồ sơ cho employeeCode.
        /// </summary>
        Task<bool> SendProfileUpdateRequestAsync(string employeeCode, ProfileUpdateRequestCreateDto dto);
    }
}
