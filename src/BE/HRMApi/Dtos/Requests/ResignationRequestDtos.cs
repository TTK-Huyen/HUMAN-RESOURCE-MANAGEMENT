using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HrmApi.Dtos.Requests
{
    // POST body /resignation
    public class CreateResignationRequestDto
    {
        [Required]
        [JsonPropertyName("proposedLastWorkingDate")] // Map với JSON FE
        public DateTime ProposedLastWorkingDate { get; set; }

        [Required]
        [JsonPropertyName("reason")]
        public string Reason { get; set; } = string.Empty;
    }

    public class ResignationRequestCreatedDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; } = default!;
    }
}