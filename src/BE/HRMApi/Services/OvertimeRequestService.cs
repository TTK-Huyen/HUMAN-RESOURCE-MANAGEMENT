using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Dtos.Notifications;
using HrmApi.Services.Notifications;
using System;
using System.Threading.Tasks;
using HrmApi.Messaging;
using HrmApi.Events.Requests;

namespace HrmApi.Services
{
    public class OvertimeRequestService : IOvertimeRequestService
    {
        private readonly IOvertimeRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IEmployeeRequestRepository _requestRepo;
        private readonly INotificationPublisher _noti;
        private readonly IEventBus _eventBus;

        public OvertimeRequestService(
            IOvertimeRequestRepository repository,
            IEmployeeRepository employeeRepo,
            IEmployeeRequestRepository requestRepo,
            IEventBus eventBus)
        {
            _repository = repository;
            _employeeRepo = employeeRepo;
            _requestRepo = requestRepo;
            _eventBus = eventBus;
        }

        public async Task<OvertimeRequestCreatedDto> CreateAsync(string employeeCode, CreateOvertimeRequestDto dto)
        {
            // 1. Tìm nhân viên
            var employee = await _employeeRepo.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // 2. Validate và Parse giờ (Logic mới của bạn)
            if (!TimeSpan.TryParse(dto.StartTime, out var startTime))
                throw new ArgumentException("Invalid StartTime format (expected HH:mm)");

            if (!TimeSpan.TryParse(dto.EndTime, out var endTime))
                throw new ArgumentException("Invalid EndTime format (expected HH:mm)");

            // Validate: End > Start
            if (endTime <= startTime)
                throw new ArgumentException("End time must be later than start time.");
            
            // Tính tổng giờ
            var totalHours = (decimal)(endTime - startTime).TotalHours;

            // 3. Tạo Request chung (Bảng cha)
            var request = new Request
            {
                EmployeeId = employee.Id,
                RequestType = "OT", // Lưu thống nhất là OT (khớp với Notification)
                Status = RequestStatus.Pending.ToString(), // Chuyển enum sang string
                CreatedAt = DateTime.UtcNow
            };
            
            await _requestRepo.AddAsync(request);
            await _requestRepo.SaveChangesAsync(); // Save để lấy RequestId
            
            // 4. Tạo Overtime Request chi tiết (Bảng con)
            var otRequest = new OvertimeRequest
            {
                Id = request.RequestId, // Link 1-1 với bảng Request
                EmployeeId = employee.Id,
                Date = dto.OtDate,
                
                StartTime = startTime, 
                EndTime = endTime,    
                TotalHours = totalHours,
                
                Reason = dto.Reason,
                // Mapping ProjectId vào ProjectName nếu DB chưa update cột
                ProjectName = dto.ProjectId, 
                
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(otRequest);
            await _repository.SaveChangesAsync();

            Employee? manager = null;
            if (employee.DirectManagerId.HasValue)
            {
                manager = await _employeeRepo.GetManagerByIdAsync(employee.DirectManagerId.Value);
            }

            var ev = new RequestSubmittedEvent
            {
                RequestId = request.RequestId,
                RequestType = "OT", // giữ đúng như bạn đang lưu RequestType = "OT"
                ActorUserId = employee.Id,
                ActorName = employee.FullName,
                ManagerUserId = employee.DirectManagerId,
                ManagerEmail = manager?.PersonalEmail,
                RequesterEmail = employee.PersonalEmail,
                Status = "Pending",
                Message = $"Employee {employee.FullName} has submitted a new overtime request."
            };

            await _eventBus.PublishAsync(ev, "request.submitted.OT");


            // 6. Trả về kết quả
            return new OvertimeRequestCreatedDto
            {
                RequestId = request.RequestId,
                Status = RequestStatus.Pending.ToString()
            };
        }

        // Hàm tách riêng logic gửi thông báo để code gọn hơn
        /*private async Task SendNotificationAsync(Employee employee, Request request)
        {
            try
            {
                // Tìm thông tin quản lý trực tiếp
                Employee? manager = null;
                if (employee.DirectManagerId.HasValue)
                {
                    manager = await _employeeRepo.GetManagerByIdAsync(employee.DirectManagerId.Value);
                }

                // Gửi sự kiện sang Notification Service
                await _noti.PublishAsync(new NotificationEventDto
                {
                    EventType = "REQUEST_CREATED",
                    RequestType = "OT", // Thống nhất mã loại yêu cầu là OT
                    RequestId = request.RequestId,
                    
                    ActorUserId = employee.Id,
                    ActorName = employee.FullName,
                    
                    RequesterUserId = employee.Id,
                    RequesterEmail = employee.PersonalEmail,
                    
                    // Người nhận chính là Manager
                    ManagerUserId = employee.DirectManagerId,
                    ManagerEmail = manager?.PersonalEmail,
                    
                    Status = "Pending",
                    Message = $"Nhân viên {employee.FullName} đã gửi yêu cầu tăng ca mới."
                });
            }
            catch (Exception ex)
            {
                // Log lỗi nếu cần thiết, không throw exception để tránh làm lỗi API tạo đơn
                Console.WriteLine($"Failed to send notification: {ex.Message}");
            }
        }*/
    }
}