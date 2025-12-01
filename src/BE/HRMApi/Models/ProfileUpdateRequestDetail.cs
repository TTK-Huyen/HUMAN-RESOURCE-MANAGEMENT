namespace HrSystem.Models
{
    public class ProfileUpdateRequestDetail
    {
        public int DetailId { get; set; }            // detail_id
        public int UpdateRequestId { get; set; }     // update_request_id
        public string FieldName { get; set; } = null!; // field_name (ADDRESS, BANK_ACCOUNT,...)
        public string? OldValue { get; set; }        // old_value
        public string NewValue { get; set; } = null!; // new_value

        public ProfileUpdateRequest UpdateRequest { get; set; } = null!;
    }
}
