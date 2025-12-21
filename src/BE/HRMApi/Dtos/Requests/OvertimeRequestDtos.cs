namespace HrmApi.Dtos.Requests
{
    // POST body /overtime
    public class CreateOvertimeRequestDto
    {
        public DateTime Date { get; set; }          // date
public string StartTime { get; set; } = default!; 
        public string EndTime { get; set; } = default!;   
        
        public string Reason { get; set; } = default!;
        public string? ProjectId { get; set; }       // project_id (optional)
    }

    // 201 Created response
    public class OvertimeRequestCreatedDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; } = default!;
    }

    
}
