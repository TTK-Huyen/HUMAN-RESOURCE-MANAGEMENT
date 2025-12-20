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

            // 2. Validate người bàn giao (Tránh lỗi Foreign Key Crash)
            if (dto.HandoverPersonId.HasValue)
            {
                var handoverEmp = await _employeeRepository.FindByIdAsync(dto.HandoverPersonId.Value);
                if (handoverEmp == null)
                {
                    // Trả về lỗi rõ ràng cho FE thay vì lỗi 500 DB
                    throw new ArgumentException($"Nhân viên bàn giao với ID {dto.HandoverPersonId} không tồn tại.");
                }
                if (handoverEmp.Id == employee.Id)
                {
                    throw new ArgumentException("Không thể bàn giao công việc cho chính mình.");
                }
            }

            // 3. Xử lý File Upload (Đã sửa lỗi đường dẫn)
            string? savedFilePath = null;
            if (dto.File != null && dto.File.Length > 0)
            {
                var fileName = $"{Guid.NewGuid()}_{dto.File.FileName}";
                
                // FIX: Lấy đường dẫn gốc chuẩn, tránh lặp 'wwwroot'
                string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadFolder = Path.Combine(rootPath, "uploads");

                if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);
                
                var filePath = Path.Combine(uploadFolder, fileName);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }
                
                savedFilePath = $"/uploads/{fileName}";
            }

            // 4. Bắt đầu Transaction (Đảm bảo dữ liệu nhất quán)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Bước 4.1: Tạo Request (Bảng cha)
                var request = new Request
                {
                    EmployeeId  = employee.Id,
                    RequestType = "LEAVE",
                    CreatedAt   = DateTime.UtcNow,
                    Status      = "Pending",
                    ApproverId  = null 
                };

                await _employeeRequestRepository.AddAsync(request);
                await _employeeRequestRepository.SaveChangesAsync(); // Lúc này RequestId đã được tạo

                // Bước 4.2: Tạo LeaveRequest (Bảng con)
                var entity = new LeaveRequest
                {
                    Id                = request.RequestId, // Link ID với bảng cha
                    EmployeeId        = employee.Id,
                    LeaveType         = dto.LeaveType,
                    StartDate         = dto.StartDate,
                    EndDate           = dto.EndDate,
                    Reason            = dto.Reason,
                    HandoverEmployeeId = dto.HandoverPersonId,
                    AttachmentPath    = savedFilePath,
                    Status            = RequestStatus.Pending,
                    CreatedAt         = DateTime.UtcNow
                };

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                // Nếu cả 2 bước trên thành công thì mới Commit
                await transaction.CommitAsync();

                // 5. Gửi thông báo (Chỉ gửi khi transaction thành công)
                // (Logic này giữ nguyên, có thể tách ra hàm riêng nếu muốn gọn code)
                _ = SendNotificationAsync(employee, request); // Gọi không cần await để trả về response nhanh hơn

                return new LeaveRequestCreatedDto
                {
                    RequestId = request.RequestId,
                    Status    = entity.Status.ToString()
                };
            }
            catch (Exception)
            {
                // Nếu có lỗi, hoàn tác mọi thay đổi DB trong block này
                await transaction.RollbackAsync();
                throw; // Ném lỗi ra để Controller xử lý tiếp
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