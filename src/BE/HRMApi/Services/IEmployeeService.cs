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
        
        /// <summary>
        /// Tạo nhân viên mới cùng với tài khoản đăng nhập
        /// </summary>
        Task<CreateEmployeeResponseDto> CreateEmployeeAsync(CreateEmployeeDto dto);
        
        /// <summary>
        /// Lấy danh sách tất cả nhân viên
        /// </summary>
        Task<IEnumerable<EmployeeProfileDto>> GetAllEmployeesAsync();
        
        /// <summary>
        /// Lấy danh sách nhân viên với filter và pagination
        /// </summary>
        Task<PaginatedEmployeeResponseDto> GetEmployeesWithFilterAsync(EmployeeFilterDto filter);
          /// <summary>
        /// Lấy danh sách thông tin cơ bản của nhân viên (name, code, dob, gender, citizenID, phone, department, job title)
        /// </summary>
        /// <param name="employeeCode">Mã nhân viên cụ thể (optional). Nếu null hoặc empty, trả về tất cả nhân viên</param>
        Task<IEnumerable<EssentialEmployeeDto>> GetEssentialEmployeeInfoAsync(string? employeeCode = null);

        
    }
}
