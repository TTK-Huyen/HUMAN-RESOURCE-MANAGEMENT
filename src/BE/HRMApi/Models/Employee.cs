using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrSystem.Models
{
    [Table("employees")]
    public class Employee
    {
        public int Id { get; set; }
        // Employee Code đã có
        public string EmployeeCode { get; set; } = default!; 

        // Các thuộc tính cơ bản
        public string EmployeeName { get; set; } = default!;
        public DateTime DateOfBirth { get; set; } // Format dd/mm/yyyy sẽ được xử lý khi hiển thị/nhập
        public string Gender { get; set; } = default!; // Male / Female / Other
        public string Nationality { get; set; } = default!; // Country

        // Thông tin liên lạc & Cá nhân
        public string? CompanyEmail { get; set; }
        public string? PersonalEmail { get; set; }
        public string MaritalStatus { get; set; } = default!; // Single / Married / Other
        public bool HasChildren { get; set; } // Yes/No
        
        // Định danh
        public string? CitizenIdNumber { get; set; }
        public string PersonalTaxCode { get; set; } = default!;
        public string SocialInsuranceNumber { get; set; } = default!;

        // Địa chỉ & Trạng thái
        public string CurrentAddress { get; set; } = default!;
        public string Status { get; set; } = default!; // Ví dụ: Active, On Leave, Terminated

        // Mối quan hệ với các bảng khác (Foreign Keys & Navigation Properties)
        
        // Bộ phận & Chức danh
        public int DepartmentId { get; set; }
        public Department Department { get; set; } = default!;

        public int JobTitleId { get; set; }
        public JobTitle JobTitle { get; set; } = default!;

        // Quản lý trực tiếp (Tự tham chiếu hoặc tham chiếu đến một Employee khác)
        public int? DirectManagerId { get; set; } // Có thể null nếu là cấp cao nhất
        public Employee? DirectManager { get; set; } // Navigation property cho Quản lý

        // Hợp đồng
        public string EmploymentType { get; set; } = default!; // Full-time / Part-time / Internship / Remote
        public string ContractType { get; set; } = default!; // Ví dụ: Indefinite, Fixed-term

        // Sử dụng một model riêng cho hợp đồng nếu muốn quản lý nhiều hợp đồng
        // Hoặc các thuộc tính đơn giản cho hợp đồng hiện tại:
        public DateTime ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; } // Có thể null cho hợp đồng không xác định thời hạn

        // Các collection đã có model riêng
        public ICollection<EmployeePhoneNumber> PhoneNumbers { get; set; } = new List<EmployeePhoneNumber>();
        public ICollection<EmployeeBankAccount> BankAccounts { get; set; } = new List<EmployeeBankAccount>();
        public ICollection<EmployeeEducation> Education { get; set; } = new List<EmployeeEducation>();
        public ICollection<ProfileUpdateHistory> ProfileUpdateHistory { get; set; } = new List<ProfileUpdateHistory>();
    }
}