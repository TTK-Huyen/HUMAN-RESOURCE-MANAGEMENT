using System.ComponentModel.DataAnnotations;

namespace HrmApi.Dtos.Employee
{
    public class EmployeeExcelImportDto
    {
        // Các trường này sẽ được server tự động tạo, không bắt buộc nhập trong Excel
        public string EmployeeCode { get; set; } = string.Empty;  // Tự động tạo
        public string Username { get; set; } = string.Empty;       // Tự động tạo
        public string Password { get; set; } = string.Empty;       // Tự động tạo từ CCCD

        // ===== THÔNG TIN CÁ NHÂN =====
        [Required(ErrorMessage = "Full name is required.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Date of birth is required.")]
        public DateTime? DateOfBirth { get; set; }

        [Required(ErrorMessage = "Gender is required.")]
        public string? Gender { get; set; }

        public string? Nationality { get; set; } = "Việt Nam";
        public string? MaritalStatus { get; set; } = "Độc thân";
        public bool? HasChildren { get; set; } = false;

        // ===== THÔNG TIN PHÁP LÝ =====
        [Required(ErrorMessage = "Citizen ID Number is required.")]
        public string? CitizenIdNumber { get; set; }

        public string? PersonalTaxCode { get; set; }
        public string? SocialInsuranceNumber { get; set; }

        // ===== THÔNG TIN LIÊN HỆ =====
        // CompanyEmail sẽ được backend tự động tạo, không cần nhập trong Excel
        public string? CompanyEmail { get; set; }

        [EmailAddress(ErrorMessage = "Personal email is invalid.")]
        public string? PersonalEmail { get; set; }

        // Phone numbers (at least 1 number is required)
        [Required(ErrorMessage = "Phone number 1 is required.")]
        public string? PhoneNumber1 { get; set; }
        public string? PhoneNumber1Description { get; set; }
        public string? PhoneNumber2 { get; set; }
        public string? PhoneNumber2Description { get; set; }

        public string? PhoneNumber => PhoneNumber1;

        // ===== ĐỊA CHỈ =====
        // Birth place (nơi sinh) - BẮT BUỘC
        [Required(ErrorMessage = "Place of birth (province/city) is required.")]
        public string? BirthPlaceProvince { get; set; }
        
        [Required(ErrorMessage = "Place of birth (district) is required.")]
        public string? BirthPlaceDistrict { get; set; }

        // Current address (địa chỉ hiện tại) - BẮT BUỘC
        [Required(ErrorMessage = "Current address (province/city) is required.")]
        public string? CurrentAddressProvince { get; set; }
        
        [Required(ErrorMessage = "Current address (district) is required.")]
        public string? CurrentAddressDistrict { get; set; }

        public string? CurrentAddress { get; set; }  // Có thể để trống, sẽ build từ province + district

        // ===== NGÂN HÀNG =====
        [Required(ErrorMessage = "Bank name is required.")]
        public string? BankName { get; set; }
        
        [Required(ErrorMessage = "Bank account number is required.")]
        public string? BankAccountNumber { get; set; }

        // ===== CÔNG VIỆC =====
        [Required(ErrorMessage = "Department code is required.")]
        public string? DepartmentCode { get; set; }

        [Required(ErrorMessage = "Job title code is required.")]
        public string? JobTitleCode { get; set; }

        public string? DirectManagerCode { get; set; }
        public string? EmploymentType { get; set; } = "Toàn thời gian";
        public string? ContractType { get; set; } = "Vĩnh viễn";

        [Required(ErrorMessage = "The contract start date is mandatory.")]
        public DateTime? ContractStartDate { get; set; }

        public DateTime? ContractEndDate { get; set; }  // Bắt buộc nếu ContractType == "Có thời hạn"

        // ===== PHÂN QUYỀN =====
        [Required(ErrorMessage = "Role name is required.")]
        public string? RoleName { get; set; }

        // ===== METADATA =====
        public int RowNumber { get; set; }  // Để báo lỗi
    }
}
