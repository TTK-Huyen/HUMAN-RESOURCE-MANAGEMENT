namespace HrmApi.Dtos.Requests
{
    // Body dùng cho API tạo đơn nghỉ phép
    public class CreateLeaveRequestDto
    {
        public string LeaveType { get; set; } = default!;   // "Annual", "Sick", ...
        public DateTime StartDate { get; set; }             // Ngày bắt đầu nghỉ
        public DateTime EndDate { get; set; }               // Ngày kết thúc nghỉ
        public string Reason { get; set; } = default!;      // Lý do nghỉ

        // Ai sẽ nhận bàn giao công việc, làm đơn giản là Id của nhân viên khác
        public int HandoverEmployeeId { get; set; }

        // Để sẵn cho future: file đính kèm (optional)
        public string? AttachmentBase64 { get; set; }
    }
}