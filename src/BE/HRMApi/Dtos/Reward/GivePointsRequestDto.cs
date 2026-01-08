using System.ComponentModel.DataAnnotations;

namespace HrmApi.Dtos.Reward
{
    public class GivePointsRequestDto
    {
        [Required(ErrorMessage = "Target Employee ID is required.")]
        public int TargetEmployeeId { get; set; } 

        [Required(ErrorMessage = "Points amount is required.")]
        [Range(1, 10000, ErrorMessage = "Points must be between 1 and 10,000.")]
        public int Points { get; set; }

        [Required(ErrorMessage = "Reason is required.")]
        [StringLength(250, MinimumLength = 5, ErrorMessage = "Reason must be between 5 and 250 characters.")]
        public string Reason { get; set; } = null!;
    }
}