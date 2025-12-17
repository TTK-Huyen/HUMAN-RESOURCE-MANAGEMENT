using System.ComponentModel.DataAnnotations;

namespace HrmApi.Dtos.Employee
{
    public class CreateEmployeeDto
    {
        [Required]
        public string EmployeeCode { get; set; } = string.Empty;
        
        [Required]
        public string EmployeeName { get; set; } = string.Empty;
        
        public DateTime? DateOfBirth { get; set; }
        
        public string? Gender { get; set; }
        
        public string? Nationality { get; set; } = "Vietnamese";
        
        public string? CompanyEmail { get; set; }
        
        public string? PersonalEmail { get; set; }
        
        public string? PhoneNumber { get; set; }
        
        public string? MaritalStatus { get; set; }
        
        public bool HasChildren { get; set; }
        
        public string? CitizenIdNumber { get; set; }
        
        public string? PersonalTaxCode { get; set; }
        
        public string? SocialInsuranceNumber { get; set; }
        
        public string? CurrentAddress { get; set; }
        
        public int? DepartmentId { get; set; }
        
        public int? JobTitleId { get; set; }
        
        public int? DirectManagerId { get; set; }
        
        public string EmploymentType { get; set; } = "Full-time";
        
        public string ContractType { get; set; } = "Indefinite";
        
        public DateTime ContractStartDate { get; set; }
        
        public DateTime? ContractEndDate { get; set; }
        
        // Thông tin tài khoản
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
        public string Password { get; set; } = string.Empty;
        
        public int RoleId { get; set; } = 1; // Default: Employee
    }
}
