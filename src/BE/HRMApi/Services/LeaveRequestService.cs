using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Dtos.Notifications;
using HrmApi.Services.Notifications;
using Microsoft.AspNetCore.Hosting;
using HrmApi.Data;
using Microsoft.EntityFrameworkCore;
using HrmApi.Messaging;
using HrmApi.Events.Requests;

namespace HrmApi.Services
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly ILeaveRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IEmployeeRequestRepository _employeeRequestRepository;
        private readonly INotificationPublisher _noti;
        private readonly IWebHostEnvironment _env;
        private readonly AppDbContext _context; // Thêm Context để dùng Transaction
        private readonly IEventBus _eventBus;

        public LeaveRequestService(
            ILeaveRequestRepository repository,
            IEmployeeRepository employeeRepository,
            IEmployeeRequestRepository employeeRequestRepository,
            IEventBus eventBus,
            IWebHostEnvironment env,
            AppDbContext context // Inject Context vào đây
            )
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
            _employeeRequestRepository = employeeRequestRepository;
            _eventBus = eventBus;
            _env = env;
            _context = context;
        }

        public async Task<LeaveRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateLeaveRequestDto dto)
        {
            // 1. Validate and retrieve employee
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // 2. Validate handover person
            int? handoverEmployeeId = null;
            if (!string.IsNullOrEmpty(dto.HandoverPersonCode))
            {
                var handoverEmp = await _employeeRepository.GetByCodeAsync(dto.HandoverPersonCode);
                if (handoverEmp == null)
                    throw new ArgumentException($"Handover employee with code {dto.HandoverPersonCode} does not exist.");
                
                if (handoverEmp.Id == employee.Id)
                    throw new ArgumentException("Cannot handover to yourself.");
                
                handoverEmployeeId = handoverEmp.Id;
            }

            // 3. Xử lý File Upload (BASE64) - Sửa đoạn này để hết lỗi dto.File
            string? savedFilePath = null;
            if (!string.IsNullOrEmpty(dto.AttachmentsBase64))
            {
                try 
                {
                    // Convert Base64 -> Byte Array
                    var fileBytes = Convert.FromBase64String(dto.AttachmentsBase64);
                    
                    // --- SỬA ĐOẠN NÀY ---
                    // Lấy đuôi file gốc (ví dụ .pdf, .png) từ dto.FileName
                    // Nếu không có tên file thì mặc định là .dat
                    string extension = ".dat";
                    if (!string.IsNullOrEmpty(dto.FileName))
                    {
                        // Path.GetExtension sẽ lấy cả dấu chấm, ví dụ ".pdf"
                        extension = Path.GetExtension(dto.FileName);
                    }

                    // Đặt tên file: Guid + đuôi file gốc (để tránh trùng tên nhưng vẫn mở được)
                    var fileName = $"{Guid.NewGuid()}{extension}"; 
                    // --------------------
                    
                    string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var uploadFolder = Path.Combine(rootPath, "uploads");

                    if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);
                    
                    var filePath = Path.Combine(uploadFolder, fileName);
                    
                    // Ghi file xuống đĩa
                    await File.WriteAllBytesAsync(filePath, fileBytes);
                    
                    savedFilePath = $"/uploads/{fileName}";
                }
                catch (FormatException)
                {
                    // Bỏ qua lỗi nếu chuỗi base64 không hợp lệ
                }
            }

            // 4. Transaction (Giữ nguyên)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var request = new Request
                {
                    EmployeeId  = employee.Id,
                    RequestType = "LEAVE",
                    CreatedAt   = DateTime.UtcNow,
                    Status      = "Pending"
                };

                await _employeeRequestRepository.AddAsync(request);
                await _employeeRequestRepository.SaveChangesAsync();

                var entity = new LeaveRequest
                {
                    Id                = request.RequestId,
                    EmployeeId        = employee.Id,
                    LeaveType         = dto.LeaveType,
                    StartDate         = dto.StartDate,
                    EndDate           = dto.EndDate,
                    Reason            = dto.Reason,
                    HandoverEmployeeId = handoverEmployeeId,
                    AttachmentPath    = savedFilePath,
                    Status            = RequestStatus.Pending,
                    CreatedAt         = DateTime.UtcNow
                };

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                await transaction.CommitAsync();

                Employee? manager = null;
                if (employee.DirectManagerId.HasValue)
                {
                    manager = await _employeeRepository.GetManagerByIdAsync(employee.DirectManagerId.Value);
                }

                var ev = new RequestSubmittedEvent
                {
                    RequestId = request.RequestId,
                    RequestType = "LEAVE",
                    ActorUserId = employee.Id,
                    ActorName = employee.FullName,
                    ManagerUserId = employee.DirectManagerId,
                    ManagerEmail = manager?.PersonalEmail,
                    RequesterEmail = employee.PersonalEmail,
                    Status = "Pending",
                    Message = $"Nhân viên {employee.FullName} đã gửi yêu cầu nghỉ phép mới."
                };

                await _eventBus.PublishAsync(ev, "request.submitted.LEAVE");
                return new LeaveRequestCreatedDto
                {
                    RequestId = request.RequestId,
                    Status    = entity.Status.ToString()
                };
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Tách hàm gửi thông báo cho code gọn gàng hơn
       /* private async Task SendNotificationAsync(Employee employee, Request request)
        {
            try
            {
                Employee? manager = null;
                if (employee.DirectManagerId.HasValue)
                {
                    manager = await _employeeRepository.GetManagerByIdAsync(employee.DirectManagerId.Value);
                }

                await _noti.PublishAsync(new NotificationEventDto
                {
                    EventType = "REQUEST_CREATED",
                    RequestType = "LEAVE",
                    RequestId = request.RequestId,
                    ActorUserId = employee.Id,
                    ActorName = employee.FullName,
                    RequesterUserId = employee.Id,
                    RequesterEmail = employee.PersonalEmail,
                    ManagerUserId = employee.DirectManagerId,
                    ManagerEmail = manager?.PersonalEmail,
                    Status = "Pending",
                    Message = $"Nhân viên {employee.FullName} đã gửi yêu cầu nghỉ phép mới."
                });
            }
            catch
            {
                // Gửi noti thất bại không nên làm fail cả request tạo đơn
            }
        }*/
    }
}