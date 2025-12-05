using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    // Ánh xạ đến bảng 'profile_update_request_details'
    [Table("profile_update_request_details")]
    public class ProfileUpdateRequestDetail
    {
        // Khóa chính: detail_id
        [Key]
        [Column("detail_id")]
        public int Id { get; set; } 
        
        // Khóa ngoại: update_request_id
        [Column("update_request_id")]
        public int UpdateRequestId { get; set; }

        // Navigation Property: Yêu cầu cập nhật cha
        [ForeignKey(nameof(UpdateRequestId))]
        public ProfileUpdateHistory UpdateRequest { get; set; } = default!;
        // Nếu DB/logic của bạn dùng ProfileUpdateRequest thay vì ProfileUpdateHistory
        // thì chỉ cần đổi kiểu ở đây:
        // public ProfileUpdateRequest UpdateRequest { get; set; } = default!;

        // field_name (ADDRESS, BANK_ACCOUNT, PHONE, ...)
        [Column("field_name")]
        public string FieldName { get; set; } = default!; 

        // old_value
        [Column("old_value")]
        public string? OldValue { get; set; }

        // new_value
        [Column("new_value")]
        public string NewValue { get; set; } = default!; 
    }
}
