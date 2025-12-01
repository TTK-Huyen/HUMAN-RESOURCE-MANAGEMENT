namespace HrmApi.Dtos.Requests
{
    // Body dùng cho API tạo đơn tăng ca
    public class CreateOvertimeRequestDto
    {
        public DateTime Date { get; set; }                  // Ngày tăng ca
        public TimeSpan StartTime { get; set; }             // Giờ bắt đầu (18:00, 19:30, ...)
        public TimeSpan EndTime { get; set; }               // Giờ kết thúc
        public string Reason { get; set; } = default!;      // Lý do tăng ca

        // Dành cho hệ thống nào có quản lý dự án, có thể null nếu không dùng
        public int? ProjectId { get; set; }
    }
}