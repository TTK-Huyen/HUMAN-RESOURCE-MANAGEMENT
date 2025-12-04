using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("leave_requests")]
    public class LeaveRequest
    {

        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("leave_type")]
        public string LeaveType { get; set; } = null!; // PAID/UNPAID/SICK/OTHER

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("half_day")]
        public string? HalfDay { get; set; }           // MORNING/AFTERNOON/null

        // leave_requests.request_id
        public int Id { get; set; }

        // FK → employees.employee_id
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;
        public string Reason { get; set; } = default!;
      

        // handover_employee_id trong ERD (optional)
        public int? HandoverEmployeeId { get; set; }

        // Loại nghỉ (Paid, Sick, ...)


        // Bạn đang dùng base64 thay vì attachment_path → ok cho đồ án
        public string? AttachmentsBase64 { get; set; }

 


        // Bạn đang dùng base64 thay vì attachment_path → ok cho đồ án

        [Column("attachment_path")]
        public string? AttachmentPath { get; set; }

        [ForeignKey(nameof(RequestId))]
        public Request Request { get; set; } = null!;

        [ForeignKey(nameof(HandoverEmployeeId))]
        public Employee? HandoverEmployee { get; set; }
    }
}
