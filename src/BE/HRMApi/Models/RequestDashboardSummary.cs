using System;

namespace HrmApi.Models
{
    public class RequestDashboardSummary
    {
        public int TotalRequests { get; set; }
        public int PendingCount { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
    }
}
