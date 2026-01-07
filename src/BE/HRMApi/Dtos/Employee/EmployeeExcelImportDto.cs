using System.ComponentModel.DataAnnotations;

namespace HrmApi.Dtos.Employee
{
    public class EmployeeExcelImportDto
    {
        [Required(ErrorMessage = "Mã nhân viên là bắt buộc")]
        public string EmployeeCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; } = string.Empty;

        // Bắt buộc theo yêu cầu pháp lý
        [Required(ErrorMessage = "Ngày sinh (DateOfBirth) là bắt buộc")]
        public DateTime? DateOfBirth { get; set; }

        [Required(ErrorMessage = "Giới tính (Gender) là bắt buộc")]
        public string? Gender { get; set; }

        [Required(ErrorMessage = "CCCD / CitizenIdNumber là bắt buộc")]
        public string? CitizenIdNumber { get; set; }

        [Required(ErrorMessage = "Mã phòng ban (DepartmentCode) là bắt buộc")]
        public string? DepartmentCode { get; set; }

        [Required(ErrorMessage = "Mã chức danh (JobTitleCode) là bắt buộc")]
        public string? JobTitleCode { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu hợp đồng (ContractStartDate) là bắt buộc")]
        public DateTime? ContractStartDate { get; set; }

        [Required(ErrorMessage = "Quốc tịch (Nationality) là bắt buộc")]
        public string? Nationality { get; set; }

        // Conditional required: nếu ContractType == "Fixed-term" thì ContractEndDate bắt buộc
        public DateTime? ContractEndDate { get; set; }

        // Optional fields (thực sự có thể để trống lúc tạo)
        public string? PhoneNumber { get; set; }
        public string? CompanyEmail { get; set; }
        public string? PersonalEmail { get; set; }
        public string? CurrentAddress { get; set; }
        public string? RoleName { get; set; }
        public string? EmploymentType { get; set; }
        public string? ContractType { get; set; }
        public string? DirectManagerCode { get; set; }
        public string? MaritalStatus { get; set; }
        public bool? HasChildren { get; set; }
        public string? PersonalTaxCode { get; set; }
        public string? SocialInsuranceNumber { get; set; }

        // New fields for enhanced employee data
        // Phone numbers (tối đa 2 số)
        public string? PhoneNumber1 { get; set; }
        public string? PhoneNumber1Description { get; set; }
        public string? PhoneNumber2 { get; set; }
        public string? PhoneNumber2Description { get; set; }

        // Birth place (nơi sinh)
        public string? BirthPlaceProvince { get; set; }
        public string? BirthPlaceDistrict { get; set; }

        // Bank account (tài khoản ngân hàng)
        public string? BankName { get; set; }
        public string? BankAccountNumber { get; set; }

        // Row number for error reporting
        public int RowNumber { get; set; }
    }
}
