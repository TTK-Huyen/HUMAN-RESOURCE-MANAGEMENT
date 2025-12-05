using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly ILeaveRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;

        private readonly IEmployeeRequestRepository _employeeRequestRepository;
        public LeaveRequestService(
            ILeaveRequestRepository repository,
            IEmployeeRepository employeeRepository,
            IEmployeeRequestRepository employeeRequestRepository
            )
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
            _employeeRequestRepository = employeeRequestRepository;
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

            // 5. Trả DTO
            return new LeaveRequestCreatedDto
            {
                RequestId = request.RequestId,
                Status    = entity.Status.ToString()
            };
        }
    }
}
