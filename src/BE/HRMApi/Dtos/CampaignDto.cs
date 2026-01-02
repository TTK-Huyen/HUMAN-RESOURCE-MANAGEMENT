using System.ComponentModel.DataAnnotations;

namespace HrmApi.Dtos
{
    public class CampaignCreateDto
    {
        public string CampaignName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? AnnouncementDate { get; set; }
        public string? RewardDescription { get; set; }
        public int CreatedBy { get; set; } // ID nhân viên HR
        public int? MaxParticipants { get; set; }
    }

    public class CampaignResponseDto
    {
        public string CampaignCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? ErrorCode { get; set; }
    }
}