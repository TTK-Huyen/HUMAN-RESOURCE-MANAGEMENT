using System;

namespace HrmApi.Dtos.Campaigns
{
    public class CampaignListFilterDto
    {
        public string? Name { get; set; }      // lọc theo tên campaign
        public string? Status { get; set; }    // Approved / Completed / ...
        public DateTime? StartDate { get; set; } // >=
        public DateTime? EndDate { get; set; }   // <=
    }
}
