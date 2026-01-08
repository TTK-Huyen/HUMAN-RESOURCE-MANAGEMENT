using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Dtos.Notifications;
using HrmApi.Services.Notifications;
using HrmApi.Messaging;
using HrmApi.Events.Requests;

namespace HrmApi.Services
{
    public class ResignationRequestService : IResignationRequestService
    {
        private readonly IResignationRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;

        private readonly IEmployeeRequestRepository _employeeRequestRepository;
        private readonly INotificationPublisher _noti;
        private readonly IEventBus _eventBus;

        public ResignationRequestService(
            IResignationRequestRepository repository,
            IEmployeeRepository employeeRepository,
            IEmployeeRequestRepository employeeRequestRepository,
            IEventBus eventBus
            )
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
            _employeeRequestRepository = employeeRequestRepository;
            _eventBus = eventBus;
        }

        public async Task<ResignationRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateResignationRequestDto dto)
        {
            // 1. Tìm employee theo mã
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // 2. Tạo bản ghi ở bảng requests (bảng cha)
            var request = new Request
            {
                EmployeeId  = employee.Id,
                RequestType = "RESIGNATION",
                CreatedAt   = DateTime.UtcNow,
                Status      = "Pending",
                ApproverId  = null  // sau này flow duyệt sẽ set
            };

            // Nếu bạn có RequestRepository:
            await _employeeRequestRepository.AddAsync(request);
            await _employeeRequestRepository.SaveChangesAsync();
            // 2. Map DTO -> Entity
            var entity = new ResignationRequest
            {
                Id                      = request.RequestId, // Sử dụng RequestId vừa tạo
                EmployeeId              = employee.Id,       // FK
                ResignationDate         = dto.ProposedLastWorkingDate,
                Reason                  = dto.Reason,
                Status                  = RequestStatus.Pending,
                CreatedAt               = DateTime.UtcNow
            };

            // 3. Lưu DB
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            Employee? manager = null;
            if (employee.DirectManagerId.HasValue)
            {
                manager = await _employeeRepository.GetManagerByIdAsync(employee.DirectManagerId.Value);
            }

            var ev = new RequestSubmittedEvent
            {
                RequestId = request.RequestId,
                RequestType = "RESIGNATION",
                ActorUserId = employee.Id,
                ActorName = employee.FullName,
                ManagerUserId = employee.DirectManagerId,
                ManagerEmail = manager?.PersonalEmail,
                RequesterEmail = employee.PersonalEmail,
                Status = "Pending",
                Message = $"Nhân viên {employee.FullName} đã gửi yêu cầu nghỉ việc mới."
            };

            await _eventBus.PublishAsync(ev, "request.submitted.RESIGNATION");


            // 4. Trả về DTO
            return new ResignationRequestCreatedDto
            {
                RequestId = request.RequestId,
                Status    = entity.Status.ToString()
            };
        }
    }
}
