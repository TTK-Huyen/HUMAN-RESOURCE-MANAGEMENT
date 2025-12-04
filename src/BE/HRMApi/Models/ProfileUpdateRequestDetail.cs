using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrSystem.Models
{
    [Table("profile_update_request_details")]
    public class ProfileUpdateRequestDetail
    {
        [Key]
        [Column("detail_id")]
        public int DetailId { get; set; }

        [Column("update_request_id")]
        public int UpdateRequestId { get; set; }

        [Column("field_name")]
        public string FieldName { get; set; } = null!;

        [Column("old_value")]
        public string? OldValue { get; set; }

        [Column("new_value")]
        public string NewValue { get; set; } = null!;

        [ForeignKey("UpdateRequestId")]
        public ProfileUpdateRequest UpdateRequest { get; set; } = null!;
    }
}
