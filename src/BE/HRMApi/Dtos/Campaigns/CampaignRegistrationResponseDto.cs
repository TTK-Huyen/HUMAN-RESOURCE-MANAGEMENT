using System;

namespace HrmApi.Dtos.Campaigns
{
    public class CampaignRegisterResponseDto
    {
        public int RegistrationId { get; set; }
        public string CampaignCode { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime RegistrationDate { get; set; }
    }
}