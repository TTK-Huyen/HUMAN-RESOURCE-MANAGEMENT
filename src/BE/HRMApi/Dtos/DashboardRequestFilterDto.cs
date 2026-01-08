namespace HrmApi.Dtos.Requests
{
    public class DashboardRequestFilterDto
    {
        public int? DepartmentId { get; set; }
        public string? Keyword { get; set; } // tìm theo mã NV hoặc tên
        // Optional: Giới hạn theo quản lý trực tiếp
        public int? ManagerId { get; set; }
        // Nếu true, chỉ lấy request của nhân viên có DirectManagerId == ManagerId
        public bool OnlyDirectReports { get; set; } = false;
    }
}
