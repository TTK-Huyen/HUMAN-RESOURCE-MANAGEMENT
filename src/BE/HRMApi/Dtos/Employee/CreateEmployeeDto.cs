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

        // Phone numbers (max 2)
        public List<PhoneNumberInfo> PhoneNumbers { get; set; } = new();

        // Birth place (required)
        [Required]
        public AddressInfo BirthPlace { get; set; } = new();

        // Current address (required)
        [Required]
        public AddressInfo CurrentAddress { get; set; } = new();

        // Bank account info (required)
        [Required]
        public BankAccountInfo BankAccount { get; set; } = new();

        public string? MaritalStatus { get; set; }

        public bool HasChildren { get; set; }

        [Required, RegularExpression(@"^\d{13}$", ErrorMessage = "Citizen ID Number must contain exactly 13 digits")]
        public string? CitizenIdNumber { get; set; }

        public string? PersonalTaxCode { get; set; }
        public string? SocialInsuranceNumber { get; set; }

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

    public class PhoneNumberInfo
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string Description { get; set; } = "Personal"; // Personal, Emergency, Work
    }

    public class AddressInfo
    {
        [Required]
        public string Province { get; set; } = string.Empty;
        [Required]
        public string District { get; set; } = string.Empty;
    }

    public class BankAccountInfo
    {
        [Required]
        public string BankName { get; set; } = string.Empty;
        [Required]
        public string AccountNumber { get; set; } = string.Empty;
    } 
}