namespace HrmApi.Dtos.Notifications
{
    public class NotificationEventDto
    {
        public Guid EventId { get; set; } = Guid.NewGuid();

        // REQUEST_CREATED | REQUEST_APPROVED | REQUEST_REJECTED
        public string EventType { get; set; } = default!;

        // LEAVE | OT | RESIGNATION  (khớp RequestType bạn đang lưu trong bảng requests)
        public string RequestType { get; set; } = default!;
        public int RequestId { get; set; }

        // Ai gây ra hành động (requester khi tạo, manager/hr khi approve/reject)
        public int ActorUserId { get; set; }
        public string ActorName { get; set; } = default!;

        // Người tạo request
        public int RequesterUserId { get; set; }
        public string? RequesterEmail { get; set; }

        // Người duyệt (tuỳ flow)
        public int? ManagerUserId { get; set; }
        public string? ManagerEmail { get; set; }

        public string Status { get; set; } = default!;  // PENDING/APPROVED/REJECTED
        public string Message { get; set; } = default!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
