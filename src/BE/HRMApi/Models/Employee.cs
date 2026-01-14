using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("employees")]
    public class Employee
    {
        // Khóa chính: dùng Id nhưng map với employee_id
        [Key]
        [Column("employee_id")]
        public int Id { get; set; }

        // Mã NV
        [Column("employee_code")]
        public string EmployeeCode { get; set; } = default!;

        // Họ tên
        [Column("full_name")]
        public string FullName { get; set; } = null!;

        [NotMapped]
        public string EmployeeName
        {
            get => FullName;
            set => FullName = value;
        }


        // Ngày sinh 
        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        // Giới tính
        [Column("gender")]
        public string? Gender { get; set; } // Male / Female / Other

        // Quốc tịch
        public string Nationality { get; set; } = default!;

        // Thông tin liên lạc
        [Column("company_email")]
        public string? CompanyEmail { get; set; }

        [Column("personal_email")]
        public string? PersonalEmail { get; set; }

        // PhoneNumber
        [Column("phone_number")]
        public string? PhoneNumber { get; set; }

        // Hôn nhân & Con cái
        [Column("marital_status")]
        public string? MaritalStatus { get; set; } // Single / Married / Other

        [Column("has_children")]
        public bool HasChildren { get; set; }

        // NHÂN VIÊN LÀ NGƯỜI GỬI
        [InverseProperty(nameof(Request.Employee))]
        public ICollection<Request> Requests { get; set; } = new List<Request>();

        [InverseProperty(nameof(Request.Approver))]
        public ICollection<Request> ApprovedRequests { get; set; } = new List<Request>();

        // Nhân viên là người gửi đơn nghỉ
        [InverseProperty(nameof(LeaveRequest.Employee))]
        public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();

        // Nhân viên là người được bàn giao công việc khi nghỉ
        [InverseProperty(nameof(LeaveRequest.HandoverEmployee))]
        public ICollection<LeaveRequest> HandoverLeaveRequests { get; set; } = new List<LeaveRequest>();

        public ICollection<OvertimeRequest> OvertimeRequests { get; set; } = new List<OvertimeRequest>();
        public ICollection<ResignationRequest> ResignationRequests { get; set; } = new List<ResignationRequest>();


        // Định danh
        [Column("citizen_id")]
        [StringLength(13, MinimumLength = 13, ErrorMessage = "CCCD phải có đúng 13 chữ số")]
        public string? CitizenIdNumber { get; set; }

        [Column("personal_tax_code")]
        [StringLength(10, MinimumLength = 10, ErrorMessage = "Mã số thuế phải có đúng 10 chữ số")]
        public string? PersonalTaxCode { get; set; } = default!;

        [Column("social_insurance_no")]
        [StringLength(10, MinimumLength = 10, ErrorMessage = "Số bảo hiểm xã hội phải có đúng 10 chữ số")]
        public string? SocialInsuranceNumber { get; set; } = default!;

        // Địa chỉ & Trạng thái
        [Column("current_address")]
        public string? CurrentAddress { get; set; }

        [Column("birth_place_province")]
        public string? BirthPlaceProvince { get; set; }

        [Column("birth_place_district")]
        public string? BirthPlaceDistrict { get; set; }

        [Column("status")]
        public string Status { get; set; } = "ACTIVE"; 

        // Bộ phận & Chức danh
        [Column("department_id")]
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }

        // Dùng JobTitleId nhưng map với position_id của DB
        [Column("position_id")]
        public int? JobTitleId { get; set; }
        public JobTitle? JobTitle { get; set; }

        // Quản lý trực tiếp
        // Map DirectManagerId với manager_id của DB
        [Column("manager_id")]
        public int? DirectManagerId { get; set; } // Có thể null nếu là cấp cao nhất
        public Employee? DirectManager { get; set; } // Navigation

        // Hợp đồng
        [Column("employment_type")]
        public string? EmploymentType { get; set; } // Full-time / Part-time / Internship / Remote

        // DB code 2 không có contract_type, nếu có cột thì thêm [Column("contract_type")]
        public string ContractType { get; set; } = default!; // Ví dụ: Indefinite, Fixed-term

        [Column("contract_start_date")]
        public DateTime? ContractStartDate { get; set; }

        [Column("contract_end_date")]
        public DateTime? ContractEndDate { get; set; } // Có thể null cho hợp đồng không xác định thời hạn

        // Các collection đã có model riêng
        public ICollection<EmployeePhoneNumber> PhoneNumbers { get; set; } = new List<EmployeePhoneNumber>();
        public ICollection<EmployeeBankAccount> BankAccounts { get; set; } = new List<EmployeeBankAccount>();
        public ICollection<EmployeeEducation> Education { get; set; } = new List<EmployeeEducation>();
        public ICollection<ProfileUpdateRequest> ProfileUpdateRequests { get; set; } = new List<ProfileUpdateRequest>();
        }
}
