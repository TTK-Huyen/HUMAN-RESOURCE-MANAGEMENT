using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class OvertimeRequestService : IOvertimeRequestService
    {
        private readonly IOvertimeRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;

        public OvertimeRequestService(
            IOvertimeRequestRepository repository,
            IEmployeeRepository employeeRepository)
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
        }

        public async Task<OvertimeRequestCreatedDto> CreateAsync(string employeeCode, CreateOvertimeRequestDto dto)
        {
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // ❌ SAI: bạn viết entity.StartTime ... bên trong {...} → lỗi CS0747
            // ✔ ĐÚNG:
            var entity = new OvertimeRequest
            {
                EmployeeId = employee.Id,
                Date = dto.Date,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Reason = dto.Reason,
                ProjectId = dto.ProjectId,
                Status = RequestStatus.Pending
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new OvertimeRequestCreatedDto
            {
                RequestId = entity.Id,
                Status = entity.Status.ToString()
            };
        }

        public async Task<OvertimeRequestDetailDto?> GetDetailAsync(string employeeCode, int requestId)
        {
            var entity = await _repository.GetByIdForEmployeeAsync(employeeCode, requestId);
            if (entity == null) return null;

            return new OvertimeRequestDetailDto
            {
                RequestId = entity.Id,
                EmployeeCode = entity.Employee.EmployeeCode,

                Date = entity.Date,
                StartTime = entity.StartTime,
                EndTime = entity.EndTime,
                Reason = entity.Reason,
                ProjectId = entity.ProjectId,

                Status = entity.Status.ToString(),
                CreatedAt = entity.CreatedAt
            };
        }
    }
}
