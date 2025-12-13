using System;

namespace HrmApi.Dtos.Requests
{
    public class RequestDashboardSummaryDto
    {
        public int TotalRequests { get; set; }
        public int PendingCount { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
    }
}
