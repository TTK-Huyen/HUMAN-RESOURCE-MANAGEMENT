using HrmApi.Models;
using HrmApi.Dtos.Employee;

namespace HrmApi.Repositories
{
    public interface IEmployeeRepository
    {
        /// <summary>
        /// Tìm employee theo mã employeeCode (ví dụ: "EMP001").
        /// </summary>
        Task<bool> ExistsByCompanyEmailAsync(string companyEmail);
        Task<bool> ExistsByCitizenIdAsync(string citizenIdNumber);

        Task<Employee?> GetByCodeAsync(string employeeCode);

        Task<Employee?> GetByIdAsync(int id);
        Task<Employee?> GetManagerByIdAsync(int managerId);

        /// <summary>
        /// Lấy thông tin hồ sơ cá nhân đầy đủ (bao gồm các navigation properties) theo mã employeeCode.
        /// </summary>
        Task<Employee?> GetProfileByCodeAsync(string employeeCode);

        /// <summary>
        /// Lấy thông tin hồ sơ cá nhân đầy đủ theo id (bao gồm các navigation properties).
        /// </summary>
        Task<Employee?> GetProfileByIdAsync(int id);

        Task<int> SaveChangesAsync();
        
        Task<Employee?> FindByIdAsync(int id);
        Task SaveAsync(Employee employee);
        
        /// <summary>
        /// Thêm employee mới vào database
        /// </summary>
        Task AddAsync(Employee employee);
        
        /// <summary>
        /// Lấy danh sách tất cả employees
        /// </summary>
        Task<List<Employee>> GetAllEmployeesAsync();
        
        /// <summary>
        /// Lấy danh sách employees với filter và pagination
        /// </summary>
        Task<(List<Employee> employees, int totalCount)> GetEmployeesWithFilterAsync(EmployeeFilterDto filter);
          /// <summary>
        /// Lấy danh sách thông tin cơ bản của nhân viên (name, code, dob, gender, citizenID, phone, department, job title)
        /// </summary>
        /// <param name="employeeCode">Mã nhân viên cụ thể (optional). Nếu null hoặc empty, trả về tất cả nhân viên</param>
        Task<List<Employee>> GetEssentialEmployeeInfoAsync(string? employeeCode = null);

        Task<List<Employee>> GetAllAsync();
    }
}
