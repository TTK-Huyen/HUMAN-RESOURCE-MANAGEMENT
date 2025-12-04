using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class ResignationRequestService : IResignationRequestService
    {
        private readonly IResignationRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;

        public ResignationRequestService(
            IResignationRequestRepository repository,
            IEmployeeRepository employeeRepository)
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
        }

        public async Task<ResignationRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateResignationRequestDto dto)
        {
            // 1. Tìm employee theo mã
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // 2. Map DTO -> Entity
            var entity = new ResignationRequest
            {
                EmployeeId              = employee.Id,       // FK
                ResignationDate         = dto.ResignationDate,
                Reason                  = dto.Reason,
                HandoverToHrEmployeeId  = dto.HandoverToHr,
                Status                  = RequestStatus.Pending,
                CreatedAt               = DateTime.UtcNow
            };

            // 3. Lưu DB
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            // 4. Trả về DTO
            return new ResignationRequestCreatedDto
            {
                RequestId = entity.Id,
                Status    = entity.Status.ToString()
            };
        }
    }
}
