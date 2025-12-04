using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly ILeaveRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository; // nếu có

        public LeaveRequestService(
            ILeaveRequestRepository repository,
            IEmployeeRepository employeeRepository)
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
        }

        public async Task<LeaveRequestCreatedDto> CreateAsync(string employeeCode, CreateLeaveRequestDto dto)
        {
            // Tìm employee theo code
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            var entity = new LeaveRequest
            {
                EmployeeId = employee.Id,
                LeaveType = dto.LeaveType,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                HandoverPersonId = dto.HandoverPersonId,   // chỗ gây lỗi FK
                AttachmentsBase64 = dto.AttachmentsBase64,
                Status = RequestStatus.Pending
            };
            Console.WriteLine($"[DEBUG] Entity.HandoverPersonId = {entity.HandoverPersonId}");
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new LeaveRequestCreatedDto
            {
                RequestId = entity.Id,
                Status = entity.Status.ToString()
            };
        }

        public async Task<LeaveRequestDetailDto?> GetDetailAsync(string employeeCode, int requestId)
        {
            var entity = await _repository.GetByIdForEmployeeAsync(employeeCode, requestId);
            if (entity == null) return null;

            return new LeaveRequestDetailDto
            {
                RequestId = entity.Id,
                EmployeeCode = entity.Employee.EmployeeCode,
                LeaveType = entity.LeaveType,
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                Reason = entity.Reason,
                Status = entity.Status.ToString(),
                CreatedAt = entity.CreatedAt
            };
        }
    }
}
