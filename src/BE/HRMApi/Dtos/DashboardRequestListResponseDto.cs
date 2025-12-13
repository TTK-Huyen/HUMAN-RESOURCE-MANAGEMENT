using System.Collections.Generic;

namespace HrmApi.Dtos.Requests
{
    public class DashboardRequestListResponseDto
    {
        public List<DashboardRequestItemDto> Items { get; set; } = new();
    }
}
