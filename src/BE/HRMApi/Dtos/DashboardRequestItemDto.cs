using System;

namespace HrmApi.Dtos.Requests
{
    public class DashboardRequestItemDto
    {
        public string RequestCode { get; set; } = null!;
        public string RequestType { get; set; } = null!;
        public DashboardEmployeeDto Employee { get; set; } = null!;
        public DateTime? EffectiveDate { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? DecidedAt { get; set; }
    }

    public class DashboardEmployeeDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string DepartmentName { get; set; } = null!;
    }
}
