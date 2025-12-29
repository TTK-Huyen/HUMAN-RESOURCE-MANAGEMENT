using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Dtos.Notifications;
using HrmApi.Services.Notifications;
using Microsoft.AspNetCore.Hosting;
using HrmApi.Data; // ⚠️ LƯU Ý: Hãy chắc chắn namespace này đúng với nơi bạn để HrmDbContext
using Microsoft.EntityFrameworkCore;

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

        public LeaveRequestService(
            ILeaveRequestRepository repository,
            IEmployeeRepository employeeRepository,
            IEmployeeRequestRepository employeeRequestRepository,
            INotificationPublisher noti,
            IWebHostEnvironment env,
            AppDbContext context // Inject Context vào đây
            )
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
            _employeeRequestRepository = employeeRequestRepository;
            _noti = noti;
            _env = env;
            _context = context;
        }

        public async Task<LeaveRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateLeaveRequestDto dto)
        {
            // 1. Tìm và Validate nhân viên
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // 2. Validate người bàn giao
            if (dto.HandoverPersonId.HasValue)
            {
                var handoverEmp = await _employeeRepository.GetByIdAsync(dto.HandoverPersonId.Value);
                if (handoverEmp == null)
                    throw new ArgumentException($"Nhân viên bàn giao ID {dto.HandoverPersonId} không tồn tại.");
                
                if (handoverEmp.Id == employee.Id)
                    throw new ArgumentException("Không thể bàn giao cho chính mình.");
            }

            // 3. Xử lý File Upload (BASE64) - Sửa đoạn này để hết lỗi dto.File
            string? savedFilePath = null;
            if (!string.IsNullOrEmpty(dto.AttachmentsBase64))
            {
                try 
                {
                    // Convert Base64 -> Byte Array
                    var fileBytes = Convert.FromBase64String(dto.AttachmentsBase64);
                    
                    // Tạo tên file ngẫu nhiên (vì Base64 ko có tên gốc, ta tự đặt đuôi .png/.jpg/.pdf hoặc mặc định)
                    // Ở đây mình để mặc định là bin hoặc bạn có thể check header base64 để đoán đuôi.
                    // Để đơn giản, mình giả định là file ảnh hoặc doc.
                    var fileName = $"{Guid.NewGuid()}_attachment.dat"; 
                    
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
                    HandoverEmployeeId = dto.HandoverPersonId, // Đã có trong DTO
                    AttachmentPath    = savedFilePath,
                    Status            = RequestStatus.Pending,
                    CreatedAt         = DateTime.UtcNow
                };

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                await transaction.CommitAsync();

                _ = SendNotificationAsync(employee, request);

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
        private async Task SendNotificationAsync(Employee employee, Request request)
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
        }
    }
}