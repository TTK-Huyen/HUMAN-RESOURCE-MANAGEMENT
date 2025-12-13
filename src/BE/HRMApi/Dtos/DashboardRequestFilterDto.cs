namespace HrmApi.Dtos.Requests
{
    public class DashboardRequestFilterDto
    {
        public int? DepartmentId { get; set; }
        public string? Keyword { get; set; } // tìm theo mã NV hoặc tên
    }
}
