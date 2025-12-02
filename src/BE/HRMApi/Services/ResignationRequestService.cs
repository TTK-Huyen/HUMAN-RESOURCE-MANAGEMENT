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

        // POST /api/v1/employees/{employeeCode}/requests/resignation
        public async Task<ResignationRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateResignationRequestDto dto)
        {
            // Tìm employee theo mã
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // Map DTO -> Entity
            var entity = new ResignationRequest
            {
                EmployeeId   = employee.Id,
                ResignationDate   = dto.ResignationDate,      // nếu DTO là ResignDate
                Reason       = dto.Reason,
                HandoverToHr = dto.HandoverToHr,    // nếu model/DTO có field này
                Status       = RequestStatus.Pending
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new ResignationRequestCreatedDto
            {
                RequestId = entity.Id,
                Status    = entity.Status.ToString()
            };
        }

        // GET /api/v1/employees/{employeeCode}/requests/resignation/{requestId}
        public async Task<ResignationRequestDetailDto?> GetDetailAsync(
            string employeeCode,
            int requestId)
        {
            var entity = await _repository.GetByIdForEmployeeAsync(employeeCode, requestId);
            if (entity == null)
            {
                return null;
            }

            return new ResignationRequestDetailDto
            {
                RequestId    = entity.Id,
                EmployeeCode = entity.Employee.EmployeeCode,

                ResignationDate   = entity.ResignationDate,
                Reason       = entity.Reason,
                HandoverToHr = entity.HandoverToHr,

                Status       = entity.Status.ToString(),
                CreatedAt    = entity.CreatedAt
            };
        }
    }
}
