using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class OvertimeRequestService : IOvertimeRequestService
    {
        private readonly IOvertimeRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IEmployeeRequestRepository _requestRepo;

        public OvertimeRequestService(
            IOvertimeRequestRepository repository,
            IEmployeeRepository employeeRepo,
            IEmployeeRequestRepository requestRepo)
        {
            _repository = repository;
            _employeeRepo = employeeRepo;
            _requestRepo = requestRepo;
        }

        public async Task<OvertimeRequestCreatedDto> CreateAsync(string employeeCode, CreateOvertimeRequestDto dto)
        {
            var employee = await _employeeRepo.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // --- XỬ LÝ PARSE GIỜ TẠI ĐÂY ---
            // Tự động hiểu cả "18:00" lẫn "18:00:00"
            if (!TimeSpan.TryParse(dto.StartTime, out var startTime))
                throw new ArgumentException("Invalid StartTime format (expected HH:mm)");

            if (!TimeSpan.TryParse(dto.EndTime, out var endTime))
                throw new ArgumentException("Invalid EndTime format (expected HH:mm)");

            // Validate logic: End > Start
            if (endTime <= startTime)
                throw new ArgumentException("End time must be later than start time.");
            
            // Tính tổng giờ
            var totalHours = (decimal)(endTime - startTime).TotalHours;
            // -------------------------------

            // 1. Tạo Request chung
            var request = new Request
            {
                EmployeeId = employee.Id,
                RequestType = "OVERTIME",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            await _requestRepo.AddAsync(request);
            await _requestRepo.SaveChangesAsync();

            // 2. Tạo Overtime Request chi tiết
            var otRequest = new OvertimeRequest
            {
                Id = request.RequestId, // Link 1-1
                EmployeeId = employee.Id,
                Date = dto.Date,
                
                StartTime = startTime, // Lưu giá trị đã parse
                EndTime = endTime,     // Lưu giá trị đã parse
                TotalHours = totalHours,
                
                Reason = dto.Reason,
                ProjectName = dto.ProjectId, // Mapping tạm ProjectId vào ProjectName hoặc cột tương ứng
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(otRequest);
            await _repository.SaveChangesAsync();

            return new OvertimeRequestCreatedDto
            {
                RequestId = request.RequestId,
                Status = "Pending"
            };
        }
    }
}