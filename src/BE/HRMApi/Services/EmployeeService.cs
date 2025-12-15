using HrmApi.Dtos.Employee;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Security;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IProfileUpdateRequestRepository _profileUpdateRequestRepository;
        private readonly IUserAccountRepository _userAccountRepository;
        private readonly IPasswordHasher _passwordHasher;

        public EmployeeService(
            IEmployeeRepository employeeRepository, 
            IProfileUpdateRequestRepository profileUpdateRequestRepository,
            IUserAccountRepository userAccountRepository,
            IPasswordHasher passwordHasher)
        {
            _employeeRepository = employeeRepository;
            _profileUpdateRequestRepository = profileUpdateRequestRepository;
            _userAccountRepository = userAccountRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<EmployeeProfileDto?> GetProfileAsync(string employeeCode)
        {
            var employee = await _employeeRepository.GetProfileByCodeAsync(employeeCode);
            if (employee == null) return null;

            // Mapping từ Employee sang EmployeeProfileDto
            var dto = new EmployeeProfileDto
            {
                EmployeeName = employee.EmployeeName,
                EmployeeCode = employee.EmployeeCode,
                DateOfBirth = employee.DateOfBirth?.ToString("dd/MM/yyyy"),
                Gender = employee.Gender,
                Nationality = employee.Nationality,
                CompanyEmail = employee.CompanyEmail,
                PersonalEmail = employee.PersonalEmail,
                MaritalStatus = employee.MaritalStatus,
                HasChildren = employee.HasChildren,
                CitizenIdNumber = employee.CitizenIdNumber,
                PersonalTaxCode = employee.PersonalTaxCode,
                SocialInsuranceNumber = employee.SocialInsuranceNumber,
                CurrentAddress = employee.CurrentAddress,
                Status = employee.Status,
                Department = employee.Department?.Name ?? string.Empty,
                JobTitle = employee.JobTitle?.Title ?? string.Empty,
                EmploymentType = employee.EmploymentType,
                ContractType = employee.ContractType,
                ContractStartDate = employee.ContractStartDate?.ToString("dd/MM/yyyy"),
                ContractEndDate = employee.ContractEndDate?.ToString("dd/MM/yyyy"),
                DirectManager = employee.DirectManager?.EmployeeName,
                PhoneNumbers = employee.PhoneNumbers.Select(p => new EmployeePhoneNumberDto
                {
                    PhoneNumber = p.PhoneNumber,
                    Description = p.Description
                }).ToList(),
                BankAccounts = employee.BankAccounts.Select(b => new EmployeeBankAccountDto
                {
                    BankName = b.BankName,
                    AccountNumber = b.AccountNumber,
                    AccountHolderName = b.AccountHolderName,
                    IsPrimary = b.IsPrimary
                }).ToList(),
                Education = employee.Education.Select(ed => new EmployeeEducationDto
                {
                    Degree = ed.Degree,
                    Major = ed.Major,
                    University = ed.University,
                    GraduationYear = ed.GraduationYear.Year,
                    OtherCertificates = ed.OtherCertificates
                }).ToList()
                // ProfileUpdateRequests = employee.ProfileUpdateRequests.Select(h => new ProfileUpdateRequestsDto
                // {
                //     Id = h.EmployeeId,
                //     RequestDate = h.RequestDate,
                //     Status = h.Status,
                //     ReviewedBy = h.ReviewedBy?.EmployeeName,
                //     ReviewedAt = h.ReviewedAt,
                //     RejectReason = h.RejectReason,
                //     Comment = h.Comment
                // }).ToList()
            };
            return dto;
        }

        public async Task<EmployeeProfileDto?> GetProfileByIdAsync(int id, string employeeCode)
        {
            var employee = await _employeeRepository.GetProfileByIdAsync(id);
            if (employee == null || employee.EmployeeCode != employeeCode)
                return null;
            // Mapping giống GetProfileAsync
            var dto = new EmployeeProfileDto
            {
                EmployeeName = employee.EmployeeName,
                EmployeeCode = employee.EmployeeCode,
                DateOfBirth = employee.DateOfBirth?.ToString("dd/MM/yyyy"),
                Gender = employee.Gender,
                Nationality = employee.Nationality,
                CompanyEmail = employee.CompanyEmail,
                PersonalEmail = employee.PersonalEmail,
                MaritalStatus = employee.MaritalStatus,
                HasChildren = employee.HasChildren,
                CitizenIdNumber = employee.CitizenIdNumber,
                PersonalTaxCode = employee.PersonalTaxCode,
                SocialInsuranceNumber = employee.SocialInsuranceNumber,
                CurrentAddress = employee.CurrentAddress,
                Status = employee.Status,
                Department = employee.Department?.Name ?? string.Empty,
                JobTitle = employee.JobTitle?.Title ?? string.Empty,
                EmploymentType = employee.EmploymentType,
                ContractType = employee.ContractType,
                ContractStartDate = employee.ContractStartDate?.ToString("dd/MM/yyyy"),
                ContractEndDate = employee.ContractEndDate?.ToString("dd/MM/yyyy"),
                DirectManager = employee.DirectManager?.EmployeeName,
                PhoneNumbers = employee.PhoneNumbers.Select(p => new EmployeePhoneNumberDto
                {
                    PhoneNumber = p.PhoneNumber,
                    Description = p.Description
                }).ToList(),
                BankAccounts = employee.BankAccounts.Select(b => new EmployeeBankAccountDto
                {
                    BankName = b.BankName,
                    AccountNumber = b.AccountNumber,
                    AccountHolderName = b.AccountHolderName,
                    IsPrimary = b.IsPrimary
                }).ToList(),
                Education = employee.Education.Select(ed => new EmployeeEducationDto
                {
                    Degree = ed.Degree,
                    Major = ed.Major,
                    University = ed.University,
                    GraduationYear = ed.GraduationYear.Year,
                    OtherCertificates = ed.OtherCertificates
                }).ToList(),
                // ProfileUpdateHistory = employee.ProfileUpdateRequests.Select(h => new ProfileUpdateHistoryDto
                // {
                //     Id = h.EmployeeId,
                //     RequestDate = h.RequestDate,
                //     Status = h.Status,
                //     ReviewedAt = h.ReviewedAt,
                //     RejectReason = h.RejectReason,
                //     Comment = h.Comment
                // }).ToList()
            };
            return dto;
        }

        public async Task<bool> SendProfileUpdateRequestAsync(string employeeCode, ProfileUpdateRequestCreateDto dto)
        {
            var employee = await _employeeRepository.GetProfileByCodeAsync(employeeCode);
            if (employee == null)
                return false;
            if (dto.Details == null || !dto.Details.Any())
                return false;
            foreach (var detail in dto.Details)
            {
                if (string.IsNullOrWhiteSpace(detail.FieldName) || string.IsNullOrWhiteSpace(detail.NewValue))
                    return false;
            }
            var request = new ProfileUpdateRequest
            {
                EmployeeId = employee.Id,
                RequestDate = DateTime.UtcNow,
                Status = "PENDING",
                Details = dto.Details.Select(d => new ProfileUpdateRequestDetail
                {
                    FieldName = d.FieldName,
                    OldValue = d.OldValue,
                    NewValue = d.NewValue
                }).ToList()
            };
            return await _employeeRepository.SaveChangesAsync() > 0;
        }

        public async Task<bool> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            // Kiểm tra EmployeeCode đã tồn tại chưa
            var existingEmployee = await _employeeRepository.GetProfileByCodeAsync(dto.EmployeeCode);
            if (existingEmployee != null) return false;

            // Kiểm tra Username đã tồn tại chưa
            var existingUser = await _userAccountRepository.FindAccountByUsernameAsync(dto.Username);
            if (existingUser != null) return false;

            // Tạo Employee mới
            var employee = new Employee
            {
                EmployeeCode = dto.EmployeeCode,
                EmployeeName = dto.EmployeeName,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Nationality = dto.Nationality ?? "Vietnamese",
                CompanyEmail = dto.CompanyEmail,
                PersonalEmail = dto.PersonalEmail,
                MaritalStatus = dto.MaritalStatus,
                HasChildren = dto.HasChildren,
                CitizenIdNumber = dto.CitizenIdNumber,
                PersonalTaxCode = dto.PersonalTaxCode,
                SocialInsuranceNumber = dto.SocialInsuranceNumber,
                CurrentAddress = dto.CurrentAddress,
                Status = "Active",
                DepartmentId = dto.DepartmentId,
                JobTitleId = dto.JobTitleId,
                DirectManagerId = dto.DirectManagerId,
                EmploymentType = dto.EmploymentType,
                ContractType = dto.ContractType,
                ContractStartDate = dto.ContractStartDate,
                ContractEndDate = dto.ContractEndDate
            };

            await _employeeRepository.AddAsync(employee);

            // Tạo UserAccount cho Employee
            var userAccount = new UserAccount
            {
                Username = dto.Username,
                PasswordHash = _passwordHasher.HashPassword(dto.Password),
                EmployeeId = employee.Id,
                RoleId = dto.RoleId,
                Status = AccountStatus.ACTIVE,
                LastLoginAt = null
            };

            await _userAccountRepository.AddAsync(userAccount);
            return true;
        }

        public async Task<IEnumerable<EmployeeProfileDto>> GetAllEmployeesAsync()
        {
            var employees = await _employeeRepository.GetAllEmployeesAsync();
            return employees.Select(emp => new EmployeeProfileDto
            {
                EmployeeName = emp.EmployeeName,
                EmployeeCode = emp.EmployeeCode,
                DateOfBirth = emp.DateOfBirth?.ToString("dd/MM/yyyy"),
                Gender = emp.Gender,
                Nationality = emp.Nationality ?? string.Empty,
                CompanyEmail = emp.CompanyEmail,
                PersonalEmail = emp.PersonalEmail,
                MaritalStatus = emp.MaritalStatus,
                HasChildren = emp.HasChildren,
                CitizenIdNumber = emp.CitizenIdNumber,
                PersonalTaxCode = emp.PersonalTaxCode,
                SocialInsuranceNumber = emp.SocialInsuranceNumber,
                CurrentAddress = emp.CurrentAddress,
                Status = emp.Status,
                Department = emp.Department?.Name,
                JobTitle = emp.JobTitle?.Title,
                DirectManager = emp.DirectManager?.EmployeeName,
                EmploymentType = emp.EmploymentType,
                ContractType = emp.ContractType,
                ContractStartDate = emp.ContractStartDate?.ToString("dd/MM/yyyy"),
                ContractEndDate = emp.ContractEndDate?.ToString("dd/MM/yyyy")
            });
        }
    }
}
