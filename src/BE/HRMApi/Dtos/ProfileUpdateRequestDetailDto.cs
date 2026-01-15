using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace HrmApi.Dtos
{
    public class ProfileUpdateRequestDetailDto
    {
        [JsonPropertyName("request_id")]
        public long RequestId { get; set; }

        [JsonPropertyName("employee_id")]
        public int EmployeeId { get; set; }

        [JsonPropertyName("employee_code")]
        public string EmployeeCode { get; set; } = string.Empty;

        [JsonPropertyName("employee_name")]
        public string EmployeeName { get; set; } = string.Empty;

        [JsonPropertyName("request_date")]
        public DateTime RequestDate { get; set; }

        [JsonPropertyName("request_status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("reviewed_by")]
        public string? ReviewedByName { get; set; }

        [JsonPropertyName("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [JsonPropertyName("reject_reason")]
        public string? RejectReason { get; set; }

        [JsonPropertyName("comment")]
        public string? Comment { get; set; }

        [JsonPropertyName("details")]
        public List<ProfileUpdateRequestDetailItemDto> Details { get; set; } = new();
    }

    public class ProfileUpdateRequestDetailItemDto
    {
        [JsonPropertyName("field_name")]
        public string FieldName { get; set; } = string.Empty;

        [JsonPropertyName("old_value")]
        public string? OldValue { get; set; }

        [JsonPropertyName("new_value")]
        public string NewValue { get; set; } = string.Empty;
    }
}
