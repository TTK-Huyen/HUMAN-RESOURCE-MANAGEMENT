using System;

namespace HrmApi.Dtos.Campaigns
{
    public class CampaignRegistrationStatusResponseDto
    {
        public string CampaignCode { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Registered / Cancelled / NotRegistered
        public DateTime? RegistrationDate { get; set; }
        public DateTime? CancelDate { get; set; }
        public string? CancelReason { get; set; }
    }
}
