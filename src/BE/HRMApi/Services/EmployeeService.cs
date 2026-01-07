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
                Id = employee.Id,
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
                Id = employee.Id,
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

        public async Task<CreateEmployeeResponseDto> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            // 1) Validate tối thiểu phía service (để chắc chắn dù UI có bug)
            if (string.IsNullOrWhiteSpace(dto.EmployeeName))
                throw new ArgumentException("employeeName");

            if (string.IsNullOrWhiteSpace(dto.CompanyEmail))
                throw new ArgumentException("companyEmail");

            if (string.IsNullOrWhiteSpace(dto.CitizenIdNumber))
                throw new ArgumentException("citizenIdNumber");

            // CCCD must be 13 digits
            var cccdDigits = new string(dto.CitizenIdNumber.Where(char.IsDigit).ToArray());
            if (cccdDigits.Length != 13)
                throw new ArgumentException("citizenIdNumber");

            // 2) Generate employeeCode -> username = employeeCode
            var employeeCode = await GenerateNextEmployeeCodeAsync();
            var username = employeeCode;

            // 3) password = EMP + last4 CCCD
            var rawPassword = $"EMP{cccdDigits[^4..]}";

            // 4) Uniqueness checks (AC-05)
            // 4.1 username
            var existingUser = await _userAccountRepository.FindAccountByUsernameAsync(username);
            if (existingUser != null)
                throw new ArgumentException("username");

            // 4.2 companyEmail
            // ✅ cần implement method ExistsByCompanyEmailAsync trong EmployeeRepository
            if (!string.IsNullOrWhiteSpace(dto.CompanyEmail))
            {
                var dupEmail = await _employeeRepository.ExistsByCompanyEmailAsync(dto.CompanyEmail);
                if (dupEmail)
                    throw new ArgumentException("companyEmail");
            }

            // 4.3 citizenIdNumber
            // ✅ cần implement method ExistsByCitizenIdAsync trong EmployeeRepository
            var dupCitizen = await _employeeRepository.ExistsByCitizenIdAsync(cccdDigits);
            if (dupCitizen)
                throw new ArgumentException("citizenIdNumber");

            // 5) Create employee
            var employee = new Employee
            {
                EmployeeCode = employeeCode,
                FullName = dto.EmployeeName,

                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Nationality = dto.Nationality ?? "Vietnamese",

                CompanyEmail = dto.CompanyEmail,
                PersonalEmail = dto.PersonalEmail,
                MaritalStatus = dto.MaritalStatus,
                HasChildren = dto.HasChildren,

                CitizenIdNumber = cccdDigits,          // store digits only (recommended)
                PersonalTaxCode = dto.PersonalTaxCode,
                SocialInsuranceNumber = dto.SocialInsuranceNumber,
                
                // Birth place
                BirthPlaceProvince = dto.BirthPlace?.Province,
                BirthPlaceDistrict = dto.BirthPlace?.District,
                
                // Address
                CurrentAddress = $"{dto.CurrentAddress?.District}, {dto.CurrentAddress?.Province}",

                Status = "Active",
                DepartmentId = dto.DepartmentId,
                JobTitleId = dto.JobTitleId,
                DirectManagerId = dto.DirectManagerId,

                EmploymentType = dto.EmploymentType,
                ContractType = dto.ContractType,
                ContractStartDate = dto.ContractStartDate,
                ContractEndDate = dto.ContractEndDate   // can be null
            };

            await _employeeRepository.AddAsync(employee);

            // 🔥 Need to save FIRST to get employee.Id for phone/bank/user relationships
            try
            {
                var saved = await _employeeRepository.SaveChangesAsync();
                if (saved <= 0)
                    throw new Exception("Failed to save employee.");
            }
            catch (Exception ex)
            {
                var innerException = ex.InnerException;
                var fullError = innerException?.Message ?? ex.Message;
                
                // Traverse all inner exceptions
                while (innerException?.InnerException != null)
                {
                    innerException = innerException.InnerException;
                    fullError = $"{fullError} -> {innerException.Message}";
                }
                
                throw new Exception($"Failed to save employee: {fullError}");
            }

            // 6) Create phone numbers
            var phoneNumbers = new List<EmployeePhoneNumber>();
            if (dto.PhoneNumbers != null && dto.PhoneNumbers.Any())
            {
                foreach (var phone in dto.PhoneNumbers.Where(p => !string.IsNullOrWhiteSpace(p.PhoneNumber)))
                {
                    phoneNumbers.Add(new EmployeePhoneNumber
                    {
                        EmployeeId = employee.Id,
                        PhoneNumber = phone.PhoneNumber,
                        Description = phone.Description ?? "Personal"
                    });
                }
            }

            // 7) Create bank account (primary account for salary)
            var bankAccount = new EmployeeBankAccount();
            if (dto.BankAccount != null && !string.IsNullOrWhiteSpace(dto.BankAccount.AccountNumber))
            {
                bankAccount = new EmployeeBankAccount
                {
                    EmployeeId = employee.Id,
                    BankName = dto.BankAccount.BankName,
                    AccountNumber = dto.BankAccount.AccountNumber,
                    IsPrimary = true
                };
            }

            // 8) Create user account linked to employee
            var userAccount = new UserAccount
            {
                Username = username,
                PasswordHash = _passwordHasher.HashPassword(rawPassword),
                EmployeeId = employee.Id,
                RoleId = dto.RoleId,
                Status = AccountStatus.ACTIVE,
                LastLoginAt = null
            };

            // 🔥 Add all remaining entities and save ONCE (transaction)
            try
            {
                foreach (var phone in phoneNumbers)
                {
                    await _employeeRepository.AddPhoneNumberAsync(phone);
                }

                if (bankAccount.AccountNumber != null)
                {
                    await _employeeRepository.AddBankAccountAsync(bankAccount);
                }

                await _userAccountRepository.AddAsync(userAccount);

                // Save all at once - if any fails, none are saved
                var savedAll = await _employeeRepository.SaveChangesAsync();
                if (savedAll <= 0)
                    throw new Exception("Failed to save phone numbers, bank account, and user account.");
            }
            catch (Exception ex)
            {
                var dbError = ex.InnerException?.Message ?? ex.Message;
                throw new Exception($"Failed to save phone numbers, bank account, or user account: {dbError}");
            }

            // 9) Return credentials (chỉ trả về lúc tạo)
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
                Id = emp.Id,
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
