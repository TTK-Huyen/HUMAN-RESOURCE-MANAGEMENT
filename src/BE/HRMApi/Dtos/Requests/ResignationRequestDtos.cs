namespace HrmApi.Dtos.Requests
{
    // Body dùng cho API tạo đơn thôi việc
    public class CreateResignationRequestDto
    {
        public DateTime ResignationDate { get; set; }       // Ngày chính thức nghỉ
        public string Reason { get; set; } = default!;      // Lý do thôi việc

        // Người/HR phụ trách bàn giao, có thể null
        public int? HandoverToHrEmployeeId { get; set; }
    }
}