using System.ComponentModel.DataAnnotations;

namespace HrmApi.Dtos.Employee
{
    public class CreateEmployeeDto
    {
        [Required]
        public string EmployeeName { get; set; } = string.Empty;

        [Required]
        public DateTime? DateOfBirth { get; set; }

        [Required]
        public string? Gender { get; set; }   // "Male"/"Female"/"Other"

        public string? Nationality { get; set; } = "Vietnamese";

        [Required, EmailAddress]
        public string? CompanyEmail { get; set; }

        [EmailAddress]
        public string? PersonalEmail { get; set; }

        public string? PhoneNumber { get; set; }

        public string? MaritalStatus { get; set; }

        public bool HasChildren { get; set; }

        [Required, RegularExpression(@"^\d{13}$", ErrorMessage = "Citizen ID Number must contain exactly 13 digits")]
        public string? CitizenIdNumber { get; set; }

        public string? PersonalTaxCode { get; set; }
        public string? SocialInsuranceNumber { get; set; }
        public string? CurrentAddress { get; set; }

        [Required]
        public int? DepartmentId { get; set; }

        [Required]
        public int? JobTitleId { get; set; }

        public int? DirectManagerId { get; set; }

        [Required]
        public string EmploymentType { get; set; } = "Full-time";

        public string ContractType { get; set; } = "Indefinite";

        [Required]
        public DateTime ContractStartDate { get; set; }

        public DateTime? ContractEndDate { get; set; }

        [Required]
        public int RoleId { get; set; } // UI đã gửi roleId
    }
}
