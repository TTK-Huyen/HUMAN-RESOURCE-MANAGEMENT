using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
namespace HrmApi.Dtos.Requests
{
    // POST body /leave
    public class CreateLeaveRequestDto
    {
        public string LeaveType { get; set; } = default!;   // leave_type
        public DateTime StartDate { get; set; }             // start_date
        public DateTime EndDate { get; set; }               // end_date
        public string Reason { get; set; } = default!;      // reason

        public int? HandoverPersonId { get; set; } 
        
        public string? AttachmentsBase64 { get; set; }      // attachments (optional)

        public IFormFile? File { get; set; }          // handover_person_id
    }

    // Response 201
    public class LeaveRequestCreatedDto
    {
        public int RequestId { get; set; }                  // request_id
        public string Status { get; set; } = default!;      // "Pending"
    }

    
}
