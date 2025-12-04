using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("overtime_requests")]
    public class OvertimeRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("ot_date")]
        public DateTime OtDate { get; set; }

        [Column("start_time")]
        public TimeSpan StartTime { get; set; }

        [Column("end_time")]
        public TimeSpan EndTime { get; set; }

        [Column("total_hours")]
        public decimal TotalHours { get; set; }

        [Column("ot_reason")]
        public string? OtReason { get; set; }

        [Column("project_name")]
        public string? ProjectName { get; set; }

        [ForeignKey(nameof(RequestId))]
        public Request Request { get; set; } = null!;
    }
}
