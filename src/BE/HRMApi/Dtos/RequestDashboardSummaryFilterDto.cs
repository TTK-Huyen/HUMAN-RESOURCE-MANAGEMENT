namespace HrmApi.Dtos.Requests
{
    // Chỉ chứa dữ liệu filter từ query string, không chứa logic
    public class RequestDashboardSummaryFilterDto
    {
        public int? DepartmentId { get; set; }
        public string? Keyword { get; set; } // mã hoặc tên nhân viên
        // Giới hạn theo quản lý trực tiếp
        public int? ManagerId { get; set; }
        public bool OnlyDirectReports { get; set; } = false;
    }
}
