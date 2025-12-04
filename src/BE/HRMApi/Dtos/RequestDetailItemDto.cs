using System.Text.Json.Serialization;

namespace HrmApi.Dtos
{
    public class RequestDetailItemDto
    {
        [JsonPropertyName("field_name")]
        public string FieldName { get; set; } = null!;

        [JsonPropertyName("old_value")]
        public string? OldValue { get; set; }

        [JsonPropertyName("new_value")]
        public string NewValue { get; set; } = null!;
    }
}
