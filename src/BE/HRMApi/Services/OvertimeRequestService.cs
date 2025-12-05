using HrmApi.Dtos.Requests;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class OvertimeRequestService : IOvertimeRequestService
    {
        private readonly IOvertimeRequestRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;

        private readonly IEmployeeRequestRepository _employeeRequestRepository;

        public OvertimeRequestService(
            IOvertimeRequestRepository repository,
            IEmployeeRepository employeeRepository,
            IEmployeeRequestRepository employeeRequestRepository
            )
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
            _employeeRequestRepository = employeeRequestRepository;
        }

        public async Task<OvertimeRequestCreatedDto> CreateAsync(
            string employeeCode,
            CreateOvertimeRequestDto dto)
        {
            // 1. Tìm employee theo mã
            var employee = await _employeeRepository.GetByCodeAsync(employeeCode)
                           ?? throw new InvalidOperationException("Employee not found");

            // 2. Tính tổng giờ OT (double -> decimal)
            var totalHours = (dto.EndTime - dto.StartTime).TotalHours;

            // 2. Tạo bản ghi ở bảng requests (bảng cha)
            var request = new Request
            {
                EmployeeId  = employee.Id,
                RequestType = "OT",
                CreatedAt   = DateTime.UtcNow,
                Status      = "Pending",
                ApproverId  = null  // sau này flow duyệt sẽ set
            };

            // Nếu bạn có RequestRepository:
            await _employeeRequestRepository.AddAsync(request);
            await _employeeRequestRepository.SaveChangesAsync();

            // 3. Map DTO -> Entity
            var entity = new OvertimeRequest
            {
                Id         = request.RequestId,    // Sử dụng RequestId vừa tạo
                EmployeeId = employee.Id,      // FK theo ERD
                Date       = dto.Date,
                StartTime  = dto.StartTime,
                EndTime    = dto.EndTime,
                TotalHours = (decimal)totalHours,
                Reason     = dto.Reason,
                ProjectId  = dto.ProjectId,
                Status     = RequestStatus.Pending,
                CreatedAt  = DateTime.UtcNow
            };

            // 4. Lưu DB
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            // 5. Trả DTO
            return new OvertimeRequestCreatedDto
            {
                RequestId = request.RequestId,
                Status    = entity.Status.ToString()
            };
        }
    }
}
