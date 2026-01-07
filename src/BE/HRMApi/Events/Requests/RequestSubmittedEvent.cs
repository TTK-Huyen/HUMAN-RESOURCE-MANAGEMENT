namespace HrmApi.Events.Requests
{
    public class RequestSubmittedEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public int RequestId { get; set; }
        public string RequestType { get; set; } = default!; // LEAVE | OT | RESIGNATION
        public int ActorUserId { get; set; }               // người gửi request
        public string ActorName { get; set; } = default!;
        public int? ManagerUserId { get; set; }
        public string? ManagerEmail { get; set; }
        public string? RequesterEmail { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
        public string Message { get; set; } = default!;
    }
}
