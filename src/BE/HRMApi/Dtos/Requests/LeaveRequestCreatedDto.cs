    // Response trả về sau khi tạo đơn thành công
    public class LeaveRequestCreatedDto
    {
        public int RequestId { get; set; }                  // Khóa chính của LeaveRequest
        public string Status { get; set; } = default!;      // "Pending", "Approved", ...
    }
