using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Dtos.Notifications;
using HrmApi.Services.Notifications;

namespace HrmApi.Services
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly ILeaveRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;

        private readonly IEmployeeRequestRepository _employeeRequestRepository;
        private readonly INotificationPublisher _noti;

        public LeaveRequestService(
            ILeaveRequestRepository repository,
            IEmployeeRepository employeeRepository,
            IEmployeeRequestRepository employeeRequestRepository,
            INotificationPublisher noti
            )
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
            _employeeRequestRepository = employeeRequestRepository;
            _noti = noti;
        }

        public async Task<LeaveRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateLeaveRequestDto dto)
        {
            // 1. Tìm employee theo employee_code
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

        
            // 2. Tạo bản ghi ở bảng requests (bảng cha)
            var request = new Request
            {
                EmployeeId  = employee.Id,
                RequestType = "LEAVE",
                CreatedAt   = DateTime.UtcNow,
                Status      = "Pending",
                ApproverId  = null  // sau này flow duyệt sẽ set
            };

            // Nếu bạn có RequestRepository:
            await _employeeRequestRepository.AddAsync(request);
            await _employeeRequestRepository.SaveChangesAsync();

            // Lúc này request.Id đã có giá trị (identity)
            // 3. Map DTO -> Entity
            var entity = new LeaveRequest
            {
                Id = request.RequestId,           // Sử dụng RequestId vừa tạo
                EmployeeId        = employee.Id,          // FK đúng theo ERD
                LeaveType         = dto.LeaveType,
                StartDate         = dto.StartDate,
                EndDate           = dto.EndDate,
                Reason            = dto.Reason,
                HandoverEmployeeId = dto.HandoverPersonId,
                AttachmentsBase64 = dto.AttachmentsBase64,
                Status            = RequestStatus.Pending,
                CreatedAt         = DateTime.UtcNow
            };

            // 4. Lưu DB
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            Employee? manager = null;

            if (employee.DirectManagerId.HasValue)
            {
                manager = await _employeeRepository.GetManagerByIdAsync(employee.DirectManagerId.Value);
            }



            try
            {
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
                    Message = "Yêu cầu nghỉ phép mới cần phê duyệt"
                });
            }
            catch (Exception ex)
            {
                // TODO: log warning (không throw)
            }


            // 5. Trả DTO
            return new LeaveRequestCreatedDto
            {
                RequestId = request.RequestId,
                Status    = entity.Status.ToString()
            };
        }
    }
}
