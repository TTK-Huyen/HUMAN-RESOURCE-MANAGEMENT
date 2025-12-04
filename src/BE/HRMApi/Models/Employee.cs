using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrSystem.Models
{
    [Table("employees")]
    public class Employee
    {
        [Key]
        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Column("employee_code")]
        public string EmployeeCode { get; set; } = null!;

        [Column("full_name")]
        public string FullName { get; set; } = null!;
        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [Column("gender")]
        public string? Gender { get; set; }

        [Column("phone_number")]
        public string? PhoneNumber { get; set; }

        [Column("personal_email")]
        public string? PersonalEmail { get; set; }

        [Column("company_email")]
        public string? CompanyEmail { get; set; }

        [Column("current_address")]
        public string? CurrentAddress { get; set; }

        [Column("citizen_id")]
        public string? CitizenId { get; set; }

        [Column("personal_tax_code")]
        public string? PersonalTaxCode { get; set; }

        [Column("social_insurance_no")]
        public string? SocialInsuranceNo { get; set; }

        [Column("marital_status")]
        public string? MaritalStatus { get; set; }

        [Column("has_children")]
        public bool HasChildren { get; set; }

        [Column("department_id")]
        public int? DepartmentId { get; set; }

        [Column("position_id")]
        public int? PositionId { get; set; }

        [Column("employment_type")]
        public string? EmploymentType { get; set; }

        [Column("contract_start_date")]
        public DateTime? ContractStartDate { get; set; }

        [Column("contract_end_date")]
        public DateTime? ContractEndDate { get; set; }

        [Column("status")]
        public string Status { get; set; } = "ACTIVE";

        [Column("manager_id")]
        public int? ManagerId { get; set; }

        // Navigation
        // Navigation cho requests NHÂN VIÊN TỰ GỬI 
        [InverseProperty(nameof(Request.Employee))]
        public ICollection<Request> Requests { get; set; } = new List<Request>();

        // Navigation cho requests NHÂN VIÊN LÀ NGƯỜI DUYỆT (Approver) 
        [InverseProperty(nameof(Request.Approver))]
        public ICollection<Request> ApprovedRequests { get; set; } = new List<Request>();
    }
}
