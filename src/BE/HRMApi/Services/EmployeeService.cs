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
            if (employee == null) return null;            // Mapping từ Employee sang EmployeeProfileDto
            var dto = new EmployeeProfileDto
            {
                EmployeeName = employee.FullName,
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
                DirectManager = employee.DirectManager?.FullName,
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
                EmployeeName = employee.FullName,
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
                DirectManager = employee.DirectManager?.FullName,
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

        public async Task<CreateEmployeeResponseDto?> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            // 1) Validate tối thiểu
            if (string.IsNullOrWhiteSpace(dto.EmployeeName)) return null;
            if (string.IsNullOrWhiteSpace(dto.CompanyEmail)) return null;
            if (string.IsNullOrWhiteSpace(dto.CitizenIdNumber)) return null;

            var cccdDigits = new string(dto.CitizenIdNumber.Where(char.IsDigit).ToArray());
            if (cccdDigits.Length != 13) return null;

            // 2) Generate employeeCode
            var employeeCode = await GenerateNextEmployeeCodeAsync();

            // 3) username = employeeCode
            var username = employeeCode;

            // 4) password = EMP + last4 CCCD
            var rawPassword = $"EMP{cccdDigits[^4..]}";

            // 5) Uniqueness checks
            var existingUser = await _userAccountRepository.FindAccountByUsernameAsync(username);
            if (existingUser != null) return null;

            // 6) Create employee
            var employee = new Employee
            {
                EmployeeCode = employeeCode,
                FullName = dto.EmployeeName,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Nationality = dto.Nationality ?? "Vietnamese",
                CompanyEmail = dto.CompanyEmail,
                PersonalEmail = dto.PersonalEmail,
                PhoneNumber = dto.PhoneNumber,
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

            // 🔥 bắt buộc save để có employee.Id
            var saved = await _employeeRepository.SaveChangesAsync();
            if (saved <= 0) return null;

            // 7) Create user account linked to employee
            var userAccount = new UserAccount
            {
                Username = username,
                PasswordHash = _passwordHasher.HashPassword(rawPassword),
                EmployeeId = employee.Id,
                RoleId = dto.RoleId,
                Status = AccountStatus.ACTIVE,
                LastLoginAt = null
            };

            await _userAccountRepository.AddAsync(userAccount);

            // 🔥 save lần 2
            var saved2 = await _employeeRepository.SaveChangesAsync();
            if (saved2 <= 0) return null;

            // 8) Return credentials (chỉ trả về lúc tạo)
            return new CreateEmployeeResponseDto
            {
                EmployeeId = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                Username = username,
                InitialPassword = rawPassword,
                CompanyEmail = employee.CompanyEmail ?? string.Empty
            };
        }

        private async Task<string> GenerateNextEmployeeCodeAsync()
        {
            // Simple approach: EMP000001, EMP000002...
            // Implement in repository for better performance if needed.
            // For now we query using EF Core if repository exposes IQueryable.
            // If your repository doesn't support it, move this logic into repository.

            // ✅ Fallback: use EF Core context via repository if available
            // If you have no direct access, implement GetLatestEmployeeCodeAsync() in repository.
            var all = await _employeeRepository.GetAllEmployeesAsync();
            var last = all
                .Select(e => e.EmployeeCode)
                .Where(c => !string.IsNullOrWhiteSpace(c) && c.StartsWith("EMP"))
                .OrderByDescending(c => c)
                .FirstOrDefault();

            int next = 1;
            if (!string.IsNullOrEmpty(last))
            {
                var digits = new string(last.Where(char.IsDigit).ToArray());
                if (int.TryParse(digits, out var n)) next = n + 1;
            }
            return $"EMP{next:000}";
        }


        public async Task<IEnumerable<EmployeeProfileDto>> GetAllEmployeesAsync()
        {
            var employees = await _employeeRepository.GetAllEmployeesAsync(); return employees.Select(emp => new EmployeeProfileDto
            {
                EmployeeName = emp.FullName,
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
                DirectManager = emp.DirectManager?.FullName,
                EmploymentType = emp.EmploymentType,
                ContractType = emp.ContractType,
                ContractStartDate = emp.ContractStartDate?.ToString("dd/MM/yyyy"),
                ContractEndDate = emp.ContractEndDate?.ToString("dd/MM/yyyy")
            });
        }

        public async Task<PaginatedEmployeeResponseDto> GetEmployeesWithFilterAsync(EmployeeFilterDto filter)
        {
            var (employees, totalCount) = await _employeeRepository.GetEmployeesWithFilterAsync(filter);

            var employeeDtos = employees.Select(emp => new EmployeeProfileDto
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
                DirectManager = emp.DirectManager?.FullName,
                EmploymentType = emp.EmploymentType,
                ContractType = emp.ContractType,
                ContractStartDate = emp.ContractStartDate?.ToString("dd/MM/yyyy"),
                ContractEndDate = emp.ContractEndDate?.ToString("dd/MM/yyyy")
            }).ToList();

            var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

            return new PaginatedEmployeeResponseDto
            {
                Data = employeeDtos,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = totalPages,
                HasNextPage = filter.Page < totalPages,
                HasPreviousPage = filter.Page > 1
            };
        }
        public async Task<IEnumerable<EssentialEmployeeDto>> GetEssentialEmployeeInfoAsync(string? employeeCode = null)
        {
            var employees = await _employeeRepository.GetEssentialEmployeeInfoAsync(employeeCode);

            return employees.Select(emp => new EssentialEmployeeDto
            {
                Id = emp.Id,
                EmployeeCode = emp.EmployeeCode,
                FullName = emp.FullName,
                DateOfBirth = emp.DateOfBirth,
                Gender = emp.Gender,
                CitizenIdNumber = emp.CitizenIdNumber,
                PhoneNumber = emp.PhoneNumber,
                DepartmentName = emp.Department?.Name,
                JobTitleName = emp.JobTitle?.Title
            }).ToList();
        }
    }
}
