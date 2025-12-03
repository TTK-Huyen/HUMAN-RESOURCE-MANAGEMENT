namespace HrmApi.Models
{
    // Ánh xạ đến bảng 'profile_update_request_details'
    public class ProfileUpdateRequestDetail
    {
        // Khóa chính: detail_id
        public int Id { get; set; } 
        
        // Khóa ngoại: update_request_id
        public int UpdateRequestId { get; set; }
        // Navigation Property: Yêu cầu cập nhật cha
        public ProfileUpdateHistory UpdateRequest { get; set; } = default!;

        // field_name (ADDRESS, BANK_ACCOUNT, PHONE, ...)
        public string FieldName { get; set; } = default!; 

        // old_value
        public string? OldValue { get; set; }

        // new_value
        public string NewValue { get; set; } = default!; 
    }
}