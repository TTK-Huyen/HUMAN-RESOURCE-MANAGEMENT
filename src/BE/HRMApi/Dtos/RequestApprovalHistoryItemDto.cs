using System;

namespace HrmApi.Dtos.Requests
{
    public class RequestApprovalHistoryItemDto
    {
        public DateTime Time { get; set; }
        public string Status { get; set; } = null!;       // CREATED | APPROVED | REJECTED
        public string Full_Name { get; set; } = null!;
        public string Employee_Id { get; set; } = null!;
    }
}
