namespace HrmApi.Models
{
    // Ánh xạ đến bảng 'profile_update_requests'
    public class ProfileUpdateHistory
    {
        // Khóa chính: update_request_id
        public int Id { get; set; } 
        
        // Khóa ngoại: employee_id (Người gửi yêu cầu)
        public int EmployeeId { get; set; } 
        // Navigation Property: Người gửi yêu cầu
        public Employee Employee { get; set; } = default!; 

        // request_date
        public DateTime RequestDate { get; set; }

        // status (PENDING, APPROVED, REJECTED)
        public string Status { get; set; } = default!; 

        // Lý do gửi yêu cầu cập nhật
        public string Reason { get; set; } = string.Empty;

        // reviewed_by (ID của HR xử lý, có thể null)
        public int? ReviewedById { get; set; }
        // Navigation Property: Người xử lý
        // Lưu ý: Tùy thuộc vào cách bạn thiết lập FK trong EF Core, 
        // bạn có thể cần cấu hình rõ ràng mối quan hệ tự tham chiếu này.
        public Employee? ReviewedBy { get; set; } 

        // reviewed_at
        public DateTime? ReviewedAt { get; set; }

        // reject_reason
        public string? RejectReason { get; set; }
        
        // comment
        public string? Comment { get; set; }

        // Navigation Collection: Chi tiết của yêu cầu cập nhật
        public ICollection<ProfileUpdateRequestDetail> Details { get; set; } = new List<ProfileUpdateRequestDetail>();
    }
}