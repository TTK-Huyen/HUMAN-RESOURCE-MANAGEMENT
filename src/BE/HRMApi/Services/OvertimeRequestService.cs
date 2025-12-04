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

        public async Task<OvertimeRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateOvertimeRequestDto dto)
        {
            // 1. Tìm employee theo mã
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // 2. Map DTO -> Entity
            var totalHours = (dto.EndTime - dto.StartTime).TotalHours;

            var entity = new OvertimeRequest
            {
                EmployeeId = employee.Id,      // FK theo ERD
                Date       = dto.Date,
                StartTime  = dto.StartTime,
                EndTime    = dto.EndTime,
                TotalHours = totalHours,
                Reason     = dto.Reason,
                ProjectId  = dto.ProjectId,
                Status     = RequestStatus.Pending,
                CreatedAt  = DateTime.UtcNow
            };

            // 3. Lưu DB
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            // 4. Trả DTO
            return new OvertimeRequestCreatedDto
            {
                RequestId = entity.Id,
                Status    = entity.Status.ToString()
            };
        }
    }
}
