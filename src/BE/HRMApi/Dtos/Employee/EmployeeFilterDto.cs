namespace HrmApi.Dtos.Employee
{
    public class EmployeeFilterDto
    {
        /// <summary>
        /// Tìm kiếm theo tên hoặc mã nhân viên
        /// </summary>
        public string? SearchKeyword { get; set; }
        
        /// <summary>
        /// Filter theo department ID
        /// </summary>
        public int? DepartmentId { get; set; }
        
        /// <summary>
        /// Filter theo job title ID
        /// </summary>
        public int? JobTitleId { get; set; }
        
        /// <summary>
        /// Filter theo status (Active, Inactive, etc.)
        /// </summary>
        public string? Status { get; set; }
        
        /// <summary>
        /// Filter theo gender (Male, Female, Other)
        /// </summary>
        public string? Gender { get; set; }
        
        /// <summary>
        /// Filter theo employment type (Full-time, Part-time, etc.)
        /// </summary>
        public string? EmploymentType { get; set; }
        
        /// <summary>
        /// Filter theo contract type (Indefinite, Fixed-term, etc.)
        /// </summary>
        public string? ContractType { get; set; }
        
        /// <summary>
        /// Filter theo manager ID
        /// </summary>
        public int? DirectManagerId { get; set; }
        
        /// <summary>
        /// Từ ngày sinh (để filter theo độ tuổi)
        /// </summary>
        public DateTime? DateOfBirthFrom { get; set; }
        
        /// <summary>
        /// Đến ngày sinh (để filter theo độ tuổi)
        /// </summary>
        public DateTime? DateOfBirthTo { get; set; }
        
        /// <summary>
        /// Từ ngày bắt đầu hợp đồng
        /// </summary>
        public DateTime? ContractStartDateFrom { get; set; }
        
        /// <summary>
        /// Đến ngày bắt đầu hợp đồng
        /// </summary>
        public DateTime? ContractStartDateTo { get; set; }
        
        /// <summary>
        /// Số trang (pagination)
        /// </summary>
        public int Page { get; set; } = 1;
        
        /// <summary>
        /// Số bản ghi mỗi trang (pagination)
        /// </summary>
        public int PageSize { get; set; } = 10;
        
        /// <summary>
        /// Sắp xếp theo trường nào (EmployeeName, EmployeeCode, etc.)
        /// </summary>
        public string? SortBy { get; set; }
        
        /// <summary>
        /// Chiều sắp xếp (ASC, DESC)
        /// </summary>
        public string SortDirection { get; set; } = "ASC";
    }
}
