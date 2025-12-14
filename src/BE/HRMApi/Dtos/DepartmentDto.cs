namespace HrmApi.Dtos
{
    // Dùng cho việc trả dữ liệu ra API (không chứa logic)
    public class DepartmentDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
    }
}
