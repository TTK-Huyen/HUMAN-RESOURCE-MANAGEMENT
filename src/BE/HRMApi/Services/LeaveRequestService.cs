using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly ILeaveRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;

        public LeaveRequestService(
            ILeaveRequestRepository repository,
            IEmployeeRepository employeeRepository)
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
        }

        public async Task<LeaveRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateLeaveRequestDto dto)
        {
            // 1. Tìm employee theo employee_code
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // 2. Map DTO -> Entity
            var entity = new LeaveRequest
            {
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

            // 3. Lưu DB
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            // 4. Trả DTO
            return new LeaveRequestCreatedDto
            {
                RequestId = entity.Id,
                Status    = entity.Status.ToString()
            };
        }
    }
}
