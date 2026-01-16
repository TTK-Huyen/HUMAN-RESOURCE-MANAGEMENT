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
            
            // DEBUG LOG
            Console.WriteLine($"[EmployeeService] Employee: {employee.EmployeeCode}");
            Console.WriteLine($"[EmployeeService] PhoneNumbers count: {employee.PhoneNumbers?.Count ?? 0}");
            Console.WriteLine($"[EmployeeService] BankAccounts count: {employee.BankAccounts?.Count ?? 0}");
            
            // Mapping từ Employee sang EmployeeProfileDto
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
                BirthPlaceProvince = employee.BirthPlaceProvince,
                BirthPlaceDistrict = employee.BirthPlaceDistrict,
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
                BirthPlaceProvince = employee.BirthPlaceProvince,
                BirthPlaceDistrict = employee.BirthPlaceDistrict,
                Status = employee.Status,
                Department = employee.Department?.Name ?? string.Empty,
                JobTitle = employee.JobTitle?.Title ?? string.Empty,
                EmploymentType = employee.EmploymentType,
                ContractType = employee.ContractType,
                ContractStartDate = employee.ContractStartDate?.ToString("dd/MM/yyyy"),
                ContractEndDate = employee.ContractEndDate?.ToString("dd/MM/yyyy"),
                DirectManager = employee.DirectManager?.FullName,
                PhoneNumbers = string.IsNullOrEmpty(employee.PhoneNumber)
                    ? new List<EmployeePhoneNumberDto>()
                    : new List<EmployeePhoneNumberDto>
                    {
                        new EmployeePhoneNumberDto
                        {
                            PhoneNumber = employee.PhoneNumber,
                            Description = "Personal"
                        }
                    },
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
                Comment = dto.Reason,
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
            
            if (string.IsNullOrWhiteSpace(dto.EmployeeName))
                throw new ArgumentException("employeeName");

            if (string.IsNullOrWhiteSpace(dto.CompanyEmail))
                throw new ArgumentException("companyEmail");

            if (string.IsNullOrWhiteSpace(dto.CitizenIdNumber))
                throw new ArgumentException("citizenIdNumber");

            // CCCD must be 12 digits
            var cccdDigits = new string(dto.CitizenIdNumber.Where(char.IsDigit).ToArray());
            if (cccdDigits.Length != 12)
                throw new ArgumentException("citizenIdNumber");

            // ===== CHECK 1: Contract Type & Date Validation =====
            ValidateContractType(dto);

            // 2) Generate employeeCode -> username = employeeCode
            var employeeCode = await GenerateNextEmployeeCodeAsync();
            var username = employeeCode;

            // 3) password = EMP + last4 CCCD
            var rawPassword = $"EMP{cccdDigits[^4..]}";

            // 4.1 username
            var existingUser = await _userAccountRepository.FindAccountByUsernameAsync(username);
            if (existingUser != null)
                throw new ArgumentException("username");

            // 4.2 companyEmail
            if (!string.IsNullOrWhiteSpace(dto.CompanyEmail))
            {
                var dupEmail = await _employeeRepository.ExistsByCompanyEmailAsync(dto.CompanyEmail);
                if (dupEmail)
                    throw new ArgumentException("companyEmail");
            }

            // 4.3 citizenIdNumber
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

                CitizenIdNumber = cccdDigits,          
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
                ContractEndDate = dto.ContractEndDate   
            };

            await _employeeRepository.AddAsync(employee);

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

                var savedAll = await _employeeRepository.SaveChangesAsync();
                if (savedAll <= 0)
                    throw new Exception("Failed to save phone numbers, bank account, and user account.");
            }
            catch (Exception ex)
            {
                var dbError = ex.InnerException?.Message ?? ex.Message;
                throw new Exception($"Failed to save phone numbers, bank account, or user account: {dbError}");
            }

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

        // ===== CONTRACT VALIDATION LOGIC =====
        /// <summary>
        /// Luồng validation hợp đồng:
        /// 1. Nếu loại Permanent: set ContractEndDate = NULL
        /// 2. Nếu Fixed-term hoặc Probation: validate ContractEndDate
        ///    - Không null
        ///    - ContractEndDate > ContractStartDate
        ///    - Duration check: Fixed-term max 36 tháng, Probation max 180 ngày
        /// </summary>
        private void ValidateContractType(CreateEmployeeDto dto)
        {
            // Không có ContractType thì không cần validate
            if (string.IsNullOrWhiteSpace(dto.ContractType))
                return;

            var contractType = dto.ContractType.Trim().ToLower();

            // Nếu là Permanent
            if (contractType == "permanent")
            {
                
                dto.ContractEndDate = null;
                return; 
            }

            // Nếu là Fixed-term hoặc Probation
            if (contractType == "fixed-term" || contractType == "probation")
            {
                
                if (dto.ContractEndDate == null)
                    throw new ArgumentException($"ContractEndDate is required for {contractType} contract. Please enter end date.");

                if (dto.ContractStartDate.Date >= dto.ContractEndDate.Value.Date)
                    throw new ArgumentException("ContractEndDate must be after ContractStartDate.");

                if (contractType == "fixed-term")
                {
                    var durationMonths = CalculateMonthsBetween(dto.ContractStartDate, dto.ContractEndDate.Value);
                    if (durationMonths > 36)
                        throw new ArgumentException("Fixed-term contract cannot exceed 36 months.");
                }
                else if (contractType == "probation")
                {
                    var durationDays = (dto.ContractEndDate.Value.Date - dto.ContractStartDate.Date).Days;
                    if (durationDays > 180)
                        throw new ArgumentException("Probation period cannot exceed 180 days.");
                }
            }
        }

        /// <summary>
        /// Tính số tháng giữa hai ngày
        /// </summary>
        private int CalculateMonthsBetween(DateTime startDate, DateTime endDate)
        {
            int monthCount = 0;
            DateTime tempDate = startDate;

            while (tempDate < endDate)
            {
                tempDate = tempDate.AddMonths(1);
                if (tempDate <= endDate)
                    monthCount++;
            }

            return monthCount;
        }
    }
}
