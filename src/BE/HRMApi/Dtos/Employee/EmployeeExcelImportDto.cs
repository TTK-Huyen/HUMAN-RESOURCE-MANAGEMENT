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
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ngày sinh là bắt buộc")]
        public DateTime? DateOfBirth { get; set; }

        [Required(ErrorMessage = "Giới tính là bắt buộc")]
        public string? Gender { get; set; }

        public string? Nationality { get; set; } = "Việt Nam";
        public string? MaritalStatus { get; set; } = "Độc thân";
        public bool? HasChildren { get; set; } = false;

        // ===== THÔNG TIN PHÁP LÝ =====
        [Required(ErrorMessage = "CCCD là bắt buộc")]
        public string? CitizenIdNumber { get; set; }

        public string? PersonalTaxCode { get; set; }
        public string? SocialInsuranceNumber { get; set; }

        // ===== THÔNG TIN LIÊN HỆ =====
        // CompanyEmail sẽ được backend tự động tạo, không cần nhập trong Excel
        public string? CompanyEmail { get; set; }

        [EmailAddress(ErrorMessage = "Email cá nhân không hợp lệ")]
        public string? PersonalEmail { get; set; }

        // Phone numbers (ít nhất 1 số bắt buộc)
        [Required(ErrorMessage = "Số điện thoại 1 là bắt buộc")]
        public string? PhoneNumber1 { get; set; }
        public string? PhoneNumber1Description { get; set; }
        public string? PhoneNumber2 { get; set; }
        public string? PhoneNumber2Description { get; set; }

        // Tương thích ngược
        public string? PhoneNumber => PhoneNumber1;

        // ===== ĐỊA CHỈ =====
        // Birth place (nơi sinh) - BẮT BUỘC
        [Required(ErrorMessage = "Tỉnh/Thành phố nơi sinh là bắt buộc")]
        public string? BirthPlaceProvince { get; set; }
        
        [Required(ErrorMessage = "Quận/Huyện nơi sinh là bắt buộc")]
        public string? BirthPlaceDistrict { get; set; }

        // Current address (địa chỉ hiện tại) - BẮT BUỘC
        [Required(ErrorMessage = "Tỉnh/Thành phố địa chỉ hiện tại là bắt buộc")]
        public string? CurrentAddressProvince { get; set; }
        
        [Required(ErrorMessage = "Quận/Huyện địa chỉ hiện tại là bắt buộc")]
        public string? CurrentAddressDistrict { get; set; }

        public string? CurrentAddress { get; set; }  // Có thể để trống, sẽ build từ province + district

        // ===== NGÂN HÀNG =====
        [Required(ErrorMessage = "Tên ngân hàng là bắt buộc")]
        public string? BankName { get; set; }
        
        [Required(ErrorMessage = "Số tài khoản ngân hàng là bắt buộc")]
        public string? BankAccountNumber { get; set; }

        // ===== CÔNG VIỆC =====
        [Required(ErrorMessage = "Mã phòng ban là bắt buộc")]
        public string? DepartmentCode { get; set; }

        [Required(ErrorMessage = "Mã chức danh là bắt buộc")]
        public string? JobTitleCode { get; set; }

        public string? DirectManagerCode { get; set; }
        public string? EmploymentType { get; set; } = "Toàn thời gian";
        public string? ContractType { get; set; } = "Vĩnh viễn";

        [Required(ErrorMessage = "Ngày bắt đầu hợp đồng là bắt buộc")]
        public DateTime? ContractStartDate { get; set; }

        public DateTime? ContractEndDate { get; set; }  // Bắt buộc nếu ContractType == "Có thời hạn"

        // ===== PHÂN QUYỀN =====
        [Required(ErrorMessage = "Phân quyền (RoleName) là bắt buộc")]
        public string? RoleName { get; set; }

        // ===== METADATA =====
        public int RowNumber { get; set; }  // Để báo lỗi
    }
}
