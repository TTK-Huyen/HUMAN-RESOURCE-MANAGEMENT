namespace HrSystem.Models
{
    public class Employee
    {
        public int EmployeeId { get; set; }             // employee_id
        public string EmployeeCode { get; set; } = null!; // employee_code
        public string FullName { get; set; } = null!;   // full_name

        public DateTime? DateOfBirth { get; set; }      // date_of_birth
        public string? Gender { get; set; }             // MALE/FEMALE/OTHER

        public string? PhoneNumber { get; set; }        // phone_number
        public string? PersonalEmail { get; set; }      // personal_email
        public string? CompanyEmail { get; set; }       // company_email

        public string? CurrentAddress { get; set; }     // current_address
        public string? CitizenId { get; set; }          // citizen_id
        public string? PersonalTaxCode { get; set; }    // personal_tax_code
        public string? SocialInsuranceNo { get; set; }  // social_insurance_no

        public string? MaritalStatus { get; set; }      // SINGLE/MARRIED/...
        public bool HasChildren { get; set; }           // has_children

        public int? DepartmentId { get; set; }          // department_id
        public int? PositionId { get; set; }            // position_id

        public string? EmploymentType { get; set; }     // FULLTIME/PARTTIME/INTERN

        public DateTime? ContractStartDate { get; set; } // contract_start_date
        public DateTime? ContractEndDate { get; set; }   // contract_end_date

        public string Status { get; set; } = "ACTIVE";   // ACTIVE/INACTIVE/RESIGNED
        public int? ManagerId { get; set; }              // manager_id

        // Navigation
        public Department? Department { get; set; }
        public Position? Position { get; set; }
        public Employee? Manager { get; set; }

        public ICollection<Employee> Subordinates { get; set; }
            = new List<Employee>();

        public ICollection<ProfileUpdateRequest> ProfileUpdateRequests { get; set; }
            = new List<ProfileUpdateRequest>();
    }
}
