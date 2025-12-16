using System.Collections.Generic;

namespace HrmApi.Dtos.Requests
{
    public class RequestApprovalHistoryResponseDto
    {
        public List<RequestApprovalHistoryItemDto> Items { get; set; } = new();
    }
}
