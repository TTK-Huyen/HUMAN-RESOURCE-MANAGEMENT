using OfficeOpenXml;
using HrmApi.Dtos.Employee;
using HrmApi.Models;
using HrmApi.Repositories;
using Microsoft.EntityFrameworkCore;
using HrmApi.Security;
using HrmApi.Data;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Drawing;
using OfficeOpenXml.Style;

namespace HrmApi.Services
{
    public class ExcelImportService : IExcelImportService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IUserAccountRepository _userAccountRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly AppDbContext _context;

        public ExcelImportService(
            IEmployeeRepository employeeRepository,
            IUserAccountRepository userAccountRepository,
            IPasswordHasher passwordHasher,
            AppDbContext context)
        {
            _employeeRepository = employeeRepository;
            _userAccountRepository = userAccountRepository;
            _passwordHasher = passwordHasher;
            _context = context;

            // Set EPPlus license context
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public (bool isValid, string error) ValidateExcelFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return (false, "File cannot be empty");

            var allowedExtensions = new[] { ".xlsx", ".xls" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
                return (false, "Only Excel files (.xlsx, .xls) are accepted");

            if (file.Length > 10 * 1024 * 1024) // 10MB limit
                return (false, "File size must not exceed 10MB");

            return (true, string.Empty);
        }

        public async Task<ExcelImportResultDto> ImportEmployeesFromExcelAsync(IFormFile file)
        {
            var result = new ExcelImportResultDto();

            // Validate file
            var (isValid, error) = ValidateExcelFile(file);
            if (!isValid)
            {
                result.Errors.Add(new ExcelImportErrorDto { Row = 0, Error = error });
                return result;
            }

            try
            {
                // Read Excel data
                var importData = await ReadExcelDataAsync(file);
                result.TotalRows = importData.Count;

                // Get lookup data
                var departments = await _context.Departments.ToListAsync();
                var jobTitles = await _context.JobTitles.ToListAsync();
                var roles = await _context.Roles.ToListAsync();

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    foreach (var rowData in importData)
                    {
                        try
                        {
                            await ProcessEmployeeRowAsync(rowData, departments, jobTitles, roles, result);
                            result.ProcessedRows++;
                        }
                        catch (Exception ex)
                        {
                            result.Errors.Add(new ExcelImportErrorDto
                            {
                                Row = rowData.RowNumber,
                                EmployeeCode = rowData.EmployeeCode,
                                Error = ex.Message
                            });
                            result.SkippedCount++;
                        }
                    }

                    await transaction.CommitAsync();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                result.Errors.Add(new ExcelImportErrorDto { Row = 0, Error = $"File processing error: {ex.Message}" });
            }

            return result;
        }

        private async Task<List<EmployeeExcelImportDto>> ReadExcelDataAsync(IFormFile file)
        {
            var employees = new List<EmployeeExcelImportDto>();

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Employee Template");

            if (worksheet == null)
                throw new ArgumentException("Excel file does not have 'Employee Template' worksheet");

            var rowCount = worksheet.Dimension?.Rows ?? 0;
            if (rowCount <= 1)
                throw new ArgumentException("Excel file has no data (header only)");

            // Read data starting from row 2 (skip header)
            // New structure (no EmployeeCode, Username, Password, CompanyEmail):
            // 1=FullName, 2=DateOfBirth, 3=Gender, 4=Nationality, 5=MaritalStatus, 6=HasChildren,
            // 7=CitizenIdNumber, 8=PersonalTaxCode, 9=SocialInsuranceNumber,
            // 10=PersonalEmail,
            // 11=PhoneNumber1, 12=PhoneNumber1Description, 13=PhoneNumber2, 14=PhoneNumber2Description,
            // 15=BirthPlaceProvince, 16=BirthPlaceDistrict,
            // 17=CurrentAddressProvince, 18=CurrentAddressDistrict,
            // 19=BankName, 20=BankAccountNumber,
            // 21=DepartmentCode, 22=JobTitleCode, 23=DirectManagerCode,
            // 24=EmploymentType, 25=ContractType, 26=ContractStartDate, 27=ContractEndDate,
            // 28=RoleName
            for (int row = 2; row <= rowCount; row++)
            {
                var fullName = GetCellValue(worksheet, row, 1)?.Trim();
                var citizenId = GetCellValue(worksheet, row, 7)?.Trim();
                
                // Skip empty rows
                if (string.IsNullOrEmpty(fullName) && string.IsNullOrEmpty(citizenId))
                    continue;

                // EmployeeCode, Username, Password left empty - server will auto-generate
                var employee = new EmployeeExcelImportDto
                {
                    RowNumber = row,
                    EmployeeCode = "",  // Auto-generated
                    Username = "",      // Auto-generated
                    Password = "",      // Auto-generated from CCCD
                    
                    // Personal information
                    FullName = fullName ?? "",
                    DateOfBirth = ParseDate(GetCellValue(worksheet, row, 2)),
                    Gender = GetCellValue(worksheet, row, 3)?.Trim(),
                    Nationality = GetCellValue(worksheet, row, 4)?.Trim(),
                    MaritalStatus = GetCellValue(worksheet, row, 5)?.Trim(),
                    HasChildren = ParseBool(GetCellValue(worksheet, row, 6)),
                    
                    // Legal information
                    CitizenIdNumber = citizenId,
                    PersonalTaxCode = GetCellValue(worksheet, row, 8)?.Trim(),
                    SocialInsuranceNumber = GetCellValue(worksheet, row, 9)?.Trim(),
                    
                    // Contact information
                    CompanyEmail = null, // Auto-generated from name
                    PersonalEmail = GetCellValue(worksheet, row, 10)?.Trim(),
                    PhoneNumber1 = GetCellValue(worksheet, row, 11)?.Trim(),
                    PhoneNumber1Description = GetCellValue(worksheet, row, 12)?.Trim(),
                    PhoneNumber2 = GetCellValue(worksheet, row, 13)?.Trim(),
                    PhoneNumber2Description = GetCellValue(worksheet, row, 14)?.Trim(),
                    
                    // Address
                    BirthPlaceProvince = GetCellValue(worksheet, row, 15)?.Trim(),
                    BirthPlaceDistrict = GetCellValue(worksheet, row, 16)?.Trim(),
                    CurrentAddressProvince = GetCellValue(worksheet, row, 17)?.Trim(),
                    CurrentAddressDistrict = GetCellValue(worksheet, row, 18)?.Trim(),
                    CurrentAddress = null, // Will be built from province + district
                    
                    // Bank
                    BankName = GetCellValue(worksheet, row, 19)?.Trim(),
                    BankAccountNumber = GetCellValue(worksheet, row, 20)?.Trim(),
                    
                    // Job
                    DepartmentCode = GetCellValue(worksheet, row, 21)?.Trim(),
                    JobTitleCode = GetCellValue(worksheet, row, 22)?.Trim(),
                    DirectManagerCode = GetCellValue(worksheet, row, 23)?.Trim(),
                    EmploymentType = GetCellValue(worksheet, row, 24)?.Trim(),
                    ContractType = GetCellValue(worksheet, row, 25)?.Trim(),
                    ContractStartDate = ParseDate(GetCellValue(worksheet, row, 26)),
                    ContractEndDate = ParseDate(GetCellValue(worksheet, row, 27)),
                    
                    // Phân quyền
                    RoleName = GetCellValue(worksheet, row, 28)?.Trim()
                };

                employees.Add(employee);
            }

            return employees;
        }

        private async Task ProcessEmployeeRowAsync(
            EmployeeExcelImportDto rowData,
            List<Department> departments,
            List<JobTitle> jobTitles,
            List<Role> roles,
            ExcelImportResultDto result)
        {
            // Validate required fields
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(rowData);

            if (!Validator.TryValidateObject(rowData, validationContext, validationResults, true))
            {
                var errors = string.Join(", ", validationResults.Select(v => v.ErrorMessage));
                throw new ArgumentException($"Validation failed: {errors}");
            }

            // Validate CCCD format (13 số)
            if (!string.IsNullOrEmpty(rowData.CitizenIdNumber))
            {
                var cccdDigits = new string(rowData.CitizenIdNumber.Where(char.IsDigit).ToArray());
                if (cccdDigits.Length != 12)
                    throw new ArgumentException("Citizen ID must be exactly 12 digits");
            }

            // Validate phone number format (10 số)
            if (!string.IsNullOrEmpty(rowData.PhoneNumber1))
            {
                var phoneDigits = new string(rowData.PhoneNumber1.Where(char.IsDigit).ToArray());
                if (phoneDigits.Length != 10)
                    throw new ArgumentException("Phone number 1 must be exactly 10 digits");
            }

        
            if (!string.IsNullOrEmpty(rowData.ContractType) && 
                (rowData.ContractType.Equals("Có thời hạn", StringComparison.OrdinalIgnoreCase) ||
                 rowData.ContractType.Equals("Fixed-term", StringComparison.OrdinalIgnoreCase)))
            {
                if (!rowData.ContractEndDate.HasValue)
                    throw new ArgumentException("ContractEndDate is required for Fixed-term contract.");
            }

            // Build CurrentAddress from province + district if not provided
            if (string.IsNullOrEmpty(rowData.CurrentAddress))
            {
                if (!string.IsNullOrEmpty(rowData.CurrentAddressProvince) && !string.IsNullOrEmpty(rowData.CurrentAddressDistrict))
                {
                    rowData.CurrentAddress = $"{rowData.CurrentAddressDistrict}, {rowData.CurrentAddressProvince}";
                }
            }

            // Check if employee exists by CCCD (không dựa vào EmployeeCode vì nó tự động tạo)
            var existingEmployee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .FirstOrDefaultAsync(e => e.CitizenIdNumber == rowData.CitizenIdNumber);

            var isUpdate = existingEmployee != null;

            // Lookup references
            Department? department = null;
            if (!string.IsNullOrEmpty(rowData.DepartmentCode))
            {
                department = departments.FirstOrDefault(d => d.DepartmentCode == rowData.DepartmentCode);
                if (department == null)
                    throw new ArgumentException($"Department not found with code: {rowData.DepartmentCode}");
            }

            JobTitle? jobTitle = null;
            if (!string.IsNullOrEmpty(rowData.JobTitleCode))
            {
                jobTitle = jobTitles.FirstOrDefault(j => j.Id.ToString() == rowData.JobTitleCode);
                if (jobTitle == null)
                    throw new ArgumentException($"Job title not found with code: {rowData.JobTitleCode}");
            }

            Role? role = null;
            if (!string.IsNullOrEmpty(rowData.RoleName))
            {
                // Role model uses RoleName and RoleId
                role = roles.FirstOrDefault(r => r.RoleName == rowData.RoleName);
                if (role == null)
                    throw new ArgumentException($"Role not found with name: {rowData.RoleName}");
            }

            // Lookup direct manager if provided
            Employee? directManager = null;
            if (!string.IsNullOrEmpty(rowData.DirectManagerCode))
            {
                directManager = await _context.Employees
                    .FirstOrDefaultAsync(e => e.EmployeeCode == rowData.DirectManagerCode);
                if (directManager == null)
                    throw new ArgumentException($"Direct manager not found with code: {rowData.DirectManagerCode}");
            }

            if (isUpdate)
            {
                // Update existing employee
                await UpdateExistingEmployeeAsync(existingEmployee!, rowData, department, jobTitle, directManager);
                result.UpdatedCount++;
            }
            else
            {
                // Create new employee
                await CreateNewEmployeeAsync(rowData, department, jobTitle, role, directManager);
                result.CreatedCount++;
            }
        }

        private async Task UpdateExistingEmployeeAsync(
            Employee employee,
            EmployeeExcelImportDto data,
            Department? department,
            JobTitle? jobTitle,
            Employee? directManager)
        {
            // Update employee fields
            employee.FullName = data.FullName;
            employee.DateOfBirth = data.DateOfBirth;
            employee.Gender = data.Gender;
            employee.CitizenIdNumber = data.CitizenIdNumber;
            employee.PhoneNumber = data.PhoneNumber1 ?? data.PhoneNumber2;  // Update main phone
            employee.CompanyEmail = data.CompanyEmail;
            employee.PersonalEmail = data.PersonalEmail;
            employee.CurrentAddress = data.CurrentAddress;
            employee.BirthPlaceProvince = data.BirthPlaceProvince;
            employee.BirthPlaceDistrict = data.BirthPlaceDistrict;
            employee.EmploymentType = data.EmploymentType ?? employee.EmploymentType;
            employee.ContractType = data.ContractType ?? employee.ContractType;
            employee.ContractStartDate = data.ContractStartDate;
            employee.ContractEndDate = data.ContractEndDate;
            employee.MaritalStatus = data.MaritalStatus ?? employee.MaritalStatus;
            employee.HasChildren = data.HasChildren ?? employee.HasChildren;
            employee.PersonalTaxCode = data.PersonalTaxCode;
            employee.SocialInsuranceNumber = data.SocialInsuranceNumber;
            employee.Nationality = data.Nationality ?? employee.Nationality;

            if (department != null)
                employee.DepartmentId = department.Id;

            if (jobTitle != null)
                employee.JobTitleId = jobTitle.Id;

            if (directManager != null)
                employee.DirectManagerId = directManager.Id;

            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();

            // Update phone numbers if provided
            if (!string.IsNullOrEmpty(data.PhoneNumber1) || !string.IsNullOrEmpty(data.PhoneNumber2))
            {
                // Remove old phone numbers
                var existingPhones = await _context.EmployeePhoneNumbers
                    .Where(p => p.EmployeeId == employee.Id)
                    .ToListAsync();
                _context.EmployeePhoneNumbers.RemoveRange(existingPhones);

                if (!string.IsNullOrEmpty(data.PhoneNumber1))
                {
                    var phone1 = new EmployeePhoneNumber
                    {
                        EmployeeId = employee.Id,
                        PhoneNumber = data.PhoneNumber1,
                        Description = data.PhoneNumber1Description ?? "Personal"
                    };
                    await _employeeRepository.AddPhoneNumberAsync(phone1);
                }

                if (!string.IsNullOrEmpty(data.PhoneNumber2))
                {
                    var phone2 = new EmployeePhoneNumber
                    {
                        EmployeeId = employee.Id,
                        PhoneNumber = data.PhoneNumber2,
                        Description = data.PhoneNumber2Description ?? "Emergency"
                    };
                    await _employeeRepository.AddPhoneNumberAsync(phone2);
                }

                await _context.SaveChangesAsync();
            }

            // Update bank account if provided
            if (!string.IsNullOrEmpty(data.BankName) && !string.IsNullOrEmpty(data.BankAccountNumber))
            {
                // Remove old bank account
                var existingBank = await _context.EmployeeBankAccounts
                    .FirstOrDefaultAsync(b => b.EmployeeId == employee.Id);
                
                if (existingBank != null)
                {
                    existingBank.BankName = data.BankName;
                    existingBank.AccountNumber = data.BankAccountNumber;
                    _context.EmployeeBankAccounts.Update(existingBank);
                }
                else
                {
                    var bankAccount = new EmployeeBankAccount
                    {
                        EmployeeId = employee.Id,
                        BankName = data.BankName,
                        AccountNumber = data.BankAccountNumber
                    };
                    await _employeeRepository.AddBankAccountAsync(bankAccount);
                }
                
                await _context.SaveChangesAsync();
            }
        }

        private async Task CreateNewEmployeeAsync(
            EmployeeExcelImportDto data,
            Department? department,
            JobTitle? jobTitle,
            Role? role,
            Employee? directManager)
        {
            // Check if CCCD already exists
            var existingEmployee = await _context.Employees
                .FirstOrDefaultAsync(e => e.CitizenIdNumber == data.CitizenIdNumber);

            if (existingEmployee != null)
                throw new ArgumentException($"Citizen ID Number: '{data.CitizenIdNumber}' already exists in the system.");

            // ===== TỰ ĐỘNG TẠO EmployeeCode =====
            var employeeCode = await GenerateNextEmployeeCodeAsync();
            
            // ===== TỰ ĐỘNG TẠO Username = EmployeeCode =====
            var username = employeeCode;
            
            // ===== TỰ ĐỘNG TẠO Password = EMP + 4 số cuối CCCD =====
            var cccdDigits = new string(data.CitizenIdNumber!.Where(char.IsDigit).ToArray());
            var last4Digits = cccdDigits.Length >= 4 ? cccdDigits.Substring(cccdDigits.Length - 4) : cccdDigits;
            var defaultPassword = $"EMP{last4Digits}";

            // ===== TỰ ĐỘNG TẠO CompanyEmail (luôn tự động tạo từ tên nhân viên) =====
            // Template Excel không có cột CompanyEmail nữa, backend tự động tạo 100%
            var companyEmail = await GenerateUniqueCompanyEmailAsync(data.FullName);

            // Create employee
            var employee = new Employee
            {
                EmployeeCode = employeeCode,
                FullName = data.FullName,
                DateOfBirth = data.DateOfBirth,
                Gender = data.Gender,
                CitizenIdNumber = data.CitizenIdNumber,
                PhoneNumber = data.PhoneNumber1 ?? data.PhoneNumber2,  // Lấy số phone chính
                CompanyEmail = companyEmail,
                PersonalEmail = data.PersonalEmail,
                CurrentAddress = data.CurrentAddress,
                BirthPlaceProvince = data.BirthPlaceProvince,
                BirthPlaceDistrict = data.BirthPlaceDistrict,
                EmploymentType = data.EmploymentType ?? "Full-time",
                ContractType = data.ContractType ?? "Permanent",
                ContractStartDate = data.ContractStartDate,
                ContractEndDate = data.ContractEndDate,
                MaritalStatus = data.MaritalStatus ?? "Single",
                HasChildren = data.HasChildren ?? false,
                PersonalTaxCode = data.PersonalTaxCode,
                SocialInsuranceNumber = data.SocialInsuranceNumber,
                Nationality = data.Nationality ?? "Vietnam",
                Status = "Active",
                DepartmentId = department?.Id,
                JobTitleId = jobTitle?.Id,
                DirectManagerId = directManager?.Id
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            // Add phone numbers if provided
            if (!string.IsNullOrEmpty(data.PhoneNumber1))
            {
                var phone1 = new EmployeePhoneNumber
                {
                    EmployeeId = employee.Id,
                    PhoneNumber = data.PhoneNumber1,
                    Description = data.PhoneNumber1Description ?? "Cá nhân"
                };
                await _employeeRepository.AddPhoneNumberAsync(phone1);
            }

            if (!string.IsNullOrEmpty(data.PhoneNumber2))
            {
                var phone2 = new EmployeePhoneNumber
                {
                    EmployeeId = employee.Id,
                    PhoneNumber = data.PhoneNumber2,
                    Description = data.PhoneNumber2Description ?? "Khẩn cấp"
                };
                await _employeeRepository.AddPhoneNumberAsync(phone2);
            }

            // Add bank account if provided
            if (!string.IsNullOrEmpty(data.BankName) && !string.IsNullOrEmpty(data.BankAccountNumber))
            {
                var bankAccount = new EmployeeBankAccount
                {
                    EmployeeId = employee.Id,
                    BankName = data.BankName,
                    AccountNumber = data.BankAccountNumber
                };
                await _employeeRepository.AddBankAccountAsync(bankAccount);
            }

            await _context.SaveChangesAsync();

            // Create UserAccount with auto-generated credentials
            var hashedPassword = _passwordHasher.HashPassword(defaultPassword);
            
            var userAccount = new UserAccount
            {
                EmployeeId = employee.Id,
                Username = username,
                PasswordHash = hashedPassword,
                RoleId = role?.RoleId ?? 3  // Default to Employee role (roleId = 3)
            };

            _context.UserAccounts.Add(userAccount);
            await _context.SaveChangesAsync();
        }

        // Helper method để tạo EmployeeCode tự động
        private async Task<string> GenerateNextEmployeeCodeAsync()
        {
            var lastEmployee = await _context.Employees
                .OrderByDescending(e => e.EmployeeCode)
                .FirstOrDefaultAsync();

            if (lastEmployee == null || string.IsNullOrEmpty(lastEmployee.EmployeeCode))
                return "EMP001";

            // Extract number from EmployeeCode (format: EMP001)
            var codePrefix = "EMP";
            var lastCode = lastEmployee.EmployeeCode;
            
            if (lastCode.StartsWith(codePrefix) && lastCode.Length > codePrefix.Length)
            {
                var numberPart = lastCode.Substring(codePrefix.Length);
                if (int.TryParse(numberPart, out int lastNumber))
                {
                    var nextNumber = lastNumber + 1;
                    return $"{codePrefix}{nextNumber:D3}";  // D3 = 3 digits with leading zeros
                }
            }

            // Fallback
            return $"{codePrefix}001";
        }

        // Helper method để tạo CompanyEmail duy nhất
        private async Task<string> GenerateUniqueCompanyEmailAsync(string fullName)
        {
            const string domain = "@company.com";
            
            // Chuyển tên thành email: loại bỏ dấu, chữ thường, không space
            var emailLocal = RemoveVietnameseTones(fullName)
                .ToLower()
                .Replace(" ", "")
                .Replace("đ", "d");
            
            // Loại bỏ các ký tự đặc biệt
            emailLocal = new string(emailLocal.Where(c => char.IsLetterOrDigit(c)).ToArray());
            
            // Kiểm tra trùng
            var baseEmail = $"{emailLocal}{domain}";
            var exists = await _context.Employees.AnyAsync(e => e.CompanyEmail == baseEmail);
            
            if (!exists)
                return baseEmail;
            
            // Nếu trùng, thêm số vào sau
            int counter = 1;
            string emailWithNumber;
            do
            {
                emailWithNumber = $"{emailLocal}{counter}{domain}";
                exists = await _context.Employees.AnyAsync(e => e.CompanyEmail == emailWithNumber);
                counter++;
            } while (exists);
            
            return emailWithNumber;
        }

        // Helper method để bỏ dấu tiếng Việt
        private string RemoveVietnameseTones(string text)
        {
            if (string.IsNullOrEmpty(text))
                return text;

            var withDiacritics = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ" +
                                "ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ";
            var withoutDiacritics = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd" +
                                   "AAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD";

            for (int i = 0; i < withDiacritics.Length; i++)
            {
                text = text.Replace(withDiacritics[i], withoutDiacritics[i]);
            }

            return text;
        }

        public async Task<byte[]> GenerateExcelTemplateAsync()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();

            // ===== 1) INSTRUCTIONS SHEET =====
            var instructions = package.Workbook.Worksheets.Add("Instructions");
            instructions.Cells[1, 1].Value = "EMPLOYEE IMPORT GUIDE";
            instructions.Cells[1, 1].Style.Font.Bold = true;
            instructions.Cells[1, 1].Style.Font.Size = 16;
            instructions.Cells[1, 1].Style.Font.Color.SetColor(Color.DarkBlue);
            
            int instructRow = 3;
            instructions.Cells[instructRow++, 1].Value = "1. REQUIRED FIELDS (marked with *):";
            instructions.Cells[instructRow++, 1].Value = "   - Full Name (FullName)";
            instructions.Cells[instructRow++, 1].Value = "   - Date of Birth (DateOfBirth) - Format: YYYY-MM-DD";
            instructions.Cells[instructRow++, 1].Value = "   - Gender - Select: Male, Female, Other";
            instructions.Cells[instructRow++, 1].Value = "   - Citizen ID Number (CitizenIdNumber) - Exactly 12 digits";
            instructions.Cells[instructRow++, 1].Value = "   - Phone Number 1 (PhoneNumber1) - 10 digits";
            instructions.Cells[instructRow++, 1].Value = "   - Birth Place Province (BirthPlaceProvince)";
            instructions.Cells[instructRow++, 1].Value = "   - Birth Place District (BirthPlaceDistrict)";
            instructions.Cells[instructRow++, 1].Value = "   - Current Address Province (CurrentAddressProvince)";
            instructions.Cells[instructRow++, 1].Value = "   - Current Address District (CurrentAddressDistrict)";
            instructions.Cells[instructRow++, 1].Value = "   - Bank Name (BankName)";
            instructions.Cells[instructRow++, 1].Value = "   - Bank Account Number (BankAccountNumber)";
            instructions.Cells[instructRow++, 1].Value = "   - Department Code (DepartmentCode) - See Lookup sheet";
            instructions.Cells[instructRow++, 1].Value = "   - Job Title Code (JobTitleCode) - See Lookup sheet";
            instructions.Cells[instructRow++, 1].Value = "   - Contract Start Date (ContractStartDate) - Format: YYYY-MM-DD";
            instructions.Cells[instructRow++, 1].Value = "   - Role Name (RoleName) - See Lookup sheet";
            instructions.Cells[instructRow++, 1].Value = "";
            
            instructions.Cells[instructRow++, 1].Value = "2. OPTIONAL FIELDS:";
            instructions.Cells[instructRow++, 1].Value = "   - Nationality - Default: Vietnam";
            instructions.Cells[instructRow++, 1].Value = "   - Marital Status - Select: Single, Married, Divorced, Widowed";
            instructions.Cells[instructRow++, 1].Value = "   - Has Children - Yes/No";
            instructions.Cells[instructRow++, 1].Value = "   - Personal Tax Code (PersonalTaxCode) - 10 digits";
            instructions.Cells[instructRow++, 1].Value = "   - Social Insurance Number (SocialInsuranceNumber) - 10 digits";
            instructions.Cells[instructRow++, 1].Value = "   - Personal Email (PersonalEmail)";
            instructions.Cells[instructRow++, 1].Value = "   - Phone Number 1 Description (PhoneNumber1Description) - E.g: Personal, Emergency, Work";
            instructions.Cells[instructRow++, 1].Value = "   - Phone Number 2 (PhoneNumber2) - 10 digits";
            instructions.Cells[instructRow++, 1].Value = "   - Phone Number 2 Description (PhoneNumber2Description)";
            instructions.Cells[instructRow++, 1].Value = "   - Employment Type (EmploymentType) - Default: Full-time";
            instructions.Cells[instructRow++, 1].Value = "     Values: Full-time | Part-time | Contract | Temporary";
            instructions.Cells[instructRow++, 1].Value = "   - Contract Type (ContractType) - Default: Permanent";
            instructions.Cells[instructRow++, 1].Value = "     Values: Permanent | Fixed-term";
            instructions.Cells[instructRow++, 1].Value = "   - Contract End Date (ContractEndDate) - Required if ContractType is 'Fixed-term'";
            instructions.Cells[instructRow++, 1].Value = "   - Direct Manager Code (DirectManagerCode) - Employee code of the manager";
            instructions.Cells[instructRow++, 1].Value = "";
            
            instructions.Cells[instructRow++, 1].Value = "3. IMPORTANT NOTES:";
            instructions.Cells[instructRow++, 1].Value = "   - Employee Code (EmployeeCode) is auto-generated, no need to enter";
            instructions.Cells[instructRow++, 1].Value = "   - Username is auto-generated = EmployeeCode";
            instructions.Cells[instructRow++, 1].Value = "   - Default password is auto-generated from ID number";
            instructions.Cells[instructRow++, 1].Value = "   - Company Email (CompanyEmail) is auto-generated from employee name";
            instructions.Cells[instructRow++, 1].Value = "   - Citizen ID must be exactly 12 digits";
            instructions.Cells[instructRow++, 1].Value = "   - Date of Birth must be in the past";
            instructions.Cells[instructRow++, 1].Value = "   - Personal Email (if provided) must be valid format";
            instructions.Cells[instructRow++, 1].Value = "   - EmploymentType and ContractType values must be exact (see list above)";
            instructions.Cells[instructRow++, 1].Value = "   - If ContractEndDate is provided, it must be after ContractStartDate";
            instructions.Cells[instructRow++, 1].Value = "";
            
            instructions.Cells[instructRow++, 1].Value = "4. HOW TO USE:";
            instructions.Cells[instructRow++, 1].Value = "   a) View 'Lookup' sheet to see valid values (DepartmentCode, JobTitleCode, RoleName, etc.)";
            instructions.Cells[instructRow++, 1].Value = "   b) Fill in information in 'Employee Template' sheet (sample row already included)";
            instructions.Cells[instructRow++, 1].Value = "   c) Use exact values from 'Lookup' sheet to avoid errors";
            instructions.Cells[instructRow++, 1].Value = "   d) Save file and upload to the system";
            
            instructions.Cells[instructions.Dimension.Address].AutoFitColumns();

            // ===== 2) TEMPLATE SHEET =====
            var worksheet = package.Workbook.Worksheets.Add("Employee Template");

            // Cập nhật headers - loại bỏ EmployeeCode, Username, Password, CompanyEmail
            var headers = new[]
            {
                "FullName*",                      // 1
                "DateOfBirth*",                   // 2
                "Gender*",                        // 3
                "Nationality",                    // 4
                "MaritalStatus",                  // 5
                "HasChildren",                    // 6
                "CitizenIdNumber*",               // 7
                "PersonalTaxCode",                // 8
                "SocialInsuranceNumber",          // 9
                "PersonalEmail",                  // 10
                "PhoneNumber1*",                  // 11
                "PhoneNumber1Description",        // 12
                "PhoneNumber2",                   // 13
                "PhoneNumber2Description",        // 14
                "BirthPlaceProvince*",            // 15
                "BirthPlaceDistrict*",            // 16
                "CurrentAddressProvince*",        // 17
                "CurrentAddressDistrict*",        // 18
                "BankName*",                      // 19
                "BankAccountNumber*",             // 20
                "DepartmentCode*",                // 21
                "JobTitleCode*",                  // 22
                "DirectManagerCode",              // 23
                "EmploymentType",                 // 24
                "ContractType",                   // 25
                "ContractStartDate*",             // 26
                "ContractEndDate",                // 27
                "RoleName*"                       // 28
            };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                worksheet.Cells[1, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            }

            // Sample data - updated to match English values from AddEmployee page
            // Complete example with realistic data
            worksheet.Cells[2, 1].Value = "Trần Thị Minh Châu";                             // FullName
            worksheet.Cells[2, 2].Value = "1998-06-15";                                      // DateOfBirth
            worksheet.Cells[2, 3].Value = "Female";                                          // Gender
            worksheet.Cells[2, 4].Value = "Vietnam";                                         // Nationality
            worksheet.Cells[2, 5].Value = "Single";                                          // MaritalStatus
            worksheet.Cells[2, 6].Value = "No";                                              // HasChildren
            worksheet.Cells[2, 7].Value = "010345678912";                                   // CitizenIdNumber (13 digits - standard format)
            worksheet.Cells[2, 8].Value = "7501234567";                                      // PersonalTaxCode (10 digits)
            worksheet.Cells[2, 9].Value = "9801234567";                                      // SocialInsuranceNumber (10 digits)
            worksheet.Cells[2, 10].Value = "tranminchau1998@email.com";                      // PersonalEmail
            worksheet.Cells[2, 11].Value = "0901234567";                                     // PhoneNumber1 (10 digits)
            worksheet.Cells[2, 12].Value = "Personal";                                       // PhoneNumber1Description
            worksheet.Cells[2, 13].Value = "0932156789";                                     // PhoneNumber2 (10 digits)
            worksheet.Cells[2, 14].Value = "Emergency";                                      // PhoneNumber2Description
            worksheet.Cells[2, 15].Value = "Hanoi";                                          // BirthPlaceProvince
            worksheet.Cells[2, 16].Value = "Hoan Kiem";                                      // BirthPlaceDistrict
            worksheet.Cells[2, 17].Value = "Hanoi";                                          // CurrentAddressProvince
            worksheet.Cells[2, 18].Value = "Cau Giay";                                       // CurrentAddressDistrict
            worksheet.Cells[2, 19].Value = "Vietcombank";                                    // BankName
            worksheet.Cells[2, 20].Value = "0981234567890";                                  // BankAccountNumber
            worksheet.Cells[2, 21].Value = "IT";                                             // DepartmentCode
            worksheet.Cells[2, 22].Value = "3";                                              // JobTitleCode
            worksheet.Cells[2, 23].Value = "EMP001";                                         // DirectManagerCode (optional - example)
            worksheet.Cells[2, 24].Value = "Full-time";                                      // EmploymentType
            worksheet.Cells[2, 25].Value = "Fixed-term";                                     // ContractType
            worksheet.Cells[2, 26].Value = "2024-01-15";                                     // ContractStartDate
            worksheet.Cells[2, 27].Value = "2025-01-14";                                     // ContractEndDate (12 months)
            worksheet.Cells[2, 28].Value = "Employee";                                       // RoleName

            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();


            // ===== 2) LOOKUP SHEET (EPPlus) =====
            var lookup = package.Workbook.Worksheets.Add("Lookup");

            // ✅ Query DB: lấy dữ liệu thực từ AppDbContext
            var departments = await _context.Departments
                .AsNoTracking()
                .OrderBy(d => d.DepartmentCode)
                .Select(d => new { d.DepartmentCode, d.Name })
                .ToListAsync();

            var jobTitles = await _context.JobTitles
                .AsNoTracking()
                .OrderBy(j => j.Id)
                .Select(j => new { JobTitleCode = j.Id.ToString(), Title = j.Title })
                .ToListAsync();

            var roles = await _context.Roles
                .AsNoTracking()
                .OrderBy(r => r.RoleId)
                .Select(r => new { r.RoleName, r.RoleCode })
                .ToListAsync();

            // Lấy danh sách Managers (Employees có vai trò Manager/Quản lý)
            var managerRoleId = await _context.Roles
                .AsNoTracking()
                .Where(r => r.RoleName == "Manager")
                .Select(r => r.RoleId)
                .FirstOrDefaultAsync();

            var managers = await _context.Employees
                .AsNoTracking()
                .Join(_context.UserAccounts, 
                    e => e.Id, 
                    ua => ua.EmployeeId, 
                    (e, ua) => new { Employee = e, UserAccount = ua })
                .Where(x => x.UserAccount.RoleId == managerRoleId && x.Employee.Status == "Active")
                .OrderBy(x => x.Employee.EmployeeCode)
                .Select(x => new { x.Employee.EmployeeCode, x.Employee.FullName })
                .ToListAsync();


            int row = 1;

            // Title
            lookup.Cells[row, 1].Value = "Giải mã các mã/code cần nhập (Copy đúng theo bảng dưới)";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row += 2;

            // --- Departments ---
            lookup.Cells[row, 1].Value = "DEPARTMENTS";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "DepartmentCode";
            lookup.Cells[row, 2].Value = "Name";
            lookup.Cells[row, 1, row, 2].Style.Font.Bold = true;
            row++;

            int deptStartRow = row;
            foreach (var d in departments)
            {
                lookup.Cells[row, 1].Value = d.DepartmentCode;
                lookup.Cells[row, 2].Value = d.Name;
                row++;
            }
            int deptEndRow = row - 1;
            row += 2;

            // --- JobTitles ---
            lookup.Cells[row, 1].Value = "JOB TITLES";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "JobTitleCode";
            lookup.Cells[row, 2].Value = "Title";
            lookup.Cells[row, 1, row, 2].Style.Font.Bold = true;
            row++;

            int jtStartRow = row;
            foreach (var j in jobTitles)
            {
                lookup.Cells[row, 1].Value = j.JobTitleCode;
                lookup.Cells[row, 2].Value = j.Title;
                row++;
            }
            int jtEndRow = row - 1;
            row += 2;

            // --- Roles ---
            lookup.Cells[row, 1].Value = "ROLES";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "RoleName";
            lookup.Cells[row, 2].Value = "RoleCode";
            lookup.Cells[row, 1, row, 2].Style.Font.Bold = true;
            row++;

            int roleStartRow = row;
            foreach (var r in roles)
            {
                lookup.Cells[row, 1].Value = r.RoleName;
                lookup.Cells[row, 2].Value = r.RoleCode;
                row++;
            }
            int roleEndRow = row - 1;
            row += 2;

            // --- Gender ---
            lookup.Cells[row, 1].Value = "GENDER";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "Value";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            int genderStartRow = row;
            var genderValues = new[] { "Male", "Female", "Other" };
            foreach (var g in genderValues)
            {
                lookup.Cells[row, 1].Value = g;
                row++;
            }
            int genderEndRow = row - 1;
            row += 2;

            // --- Employment Type ---
            lookup.Cells[row, 1].Value = "EMPLOYMENT TYPE";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "Value";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            int empTypeStartRow = row;
            var employmentTypes = new[] { "Full-time", "Part-time", "Contract", "Temporary" };
            foreach (var e in employmentTypes)
            {
                lookup.Cells[row, 1].Value = e;
                row++;
            }
            int empTypeEndRow = row - 1;
            row += 2;

            // --- Contract Type ---
            lookup.Cells[row, 1].Value = "CONTRACT TYPE";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "Value";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            int contractTypeStartRow = row;
            var contractTypes = new[] { "Permanent", "Fixed-term" };
            foreach (var c in contractTypes)
            {
                lookup.Cells[row, 1].Value = c;
                row++;
            }
            int contractTypeEndRow = row - 1;
            row += 2;

            // --- Marital Status ---
            lookup.Cells[row, 1].Value = "MARITAL STATUS";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "Value";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            int maritalStartRow = row;
            var maritalStatuses = new[] { "Single", "Married", "Divorced"};
            foreach (var m in maritalStatuses)
            {
                lookup.Cells[row, 1].Value = m;
                row++;
            }
            int maritalEndRow = row - 1;
            row += 2;

            // --- Has Children ---
            lookup.Cells[row, 1].Value = "HAS CHILDREN";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "Value";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            int childrenStartRow = row;
            var childrenValues = new[] { "Yes", "No" };
            foreach (var c in childrenValues)
            {
                lookup.Cells[row, 1].Value = c;
                row++;
            }
            int childrenEndRow = row - 1;
            row += 2;

            // --- Nationality ---
            lookup.Cells[row, 1].Value = "NATIONALITY";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "Value";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            int nationalityStartRow = row;
            var nationalities = new[] { "Vietnam", "United States", "United Kingdom", "France", "Germany", "Japan", "South Korea", "China", "Singapore", "Thailand", "Australia", "Canada", "Netherlands", "Italy", "Spain", "Sweden", "Norway", "Denmark", "Finland", "Other" };
            foreach (var n in nationalities)
            {
                lookup.Cells[row, 1].Value = n;
                row++;
            }
            int nationalityEndRow = row - 1;
            row += 2;

            // --- Direct Manager ---
            lookup.Cells[row, 1].Value = "MANAGERS (Quản lý)";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "EmployeeCode";
            lookup.Cells[row, 2].Value = "FullName";
            lookup.Cells[row, 1, row, 2].Style.Font.Bold = true;
            row++;

            int managerStartRow = row;
            foreach (var m in managers)
            {
                lookup.Cells[row, 1].Value = m.EmployeeCode;
                lookup.Cells[row, 2].Value = m.FullName;
                row++;
            }
            int managerEndRow = row - 1;
            row += 2;

            // --- Employee Status ---
            lookup.Cells[row, 1].Value = "EMPLOYEE STATUS";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "Value";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            int statusStartRow = row;
            var statusValues = new[] { "Active", "Resigned", "Suspended", "Retired" };
            foreach (var s in statusValues)
            {
                lookup.Cells[row, 1].Value = s;
                row++;
            }
            int statusEndRow = row - 1;
            row += 2;

           

            lookup.Cells[lookup.Dimension.Address].AutoFitColumns();

            // ===== Return bytes =====
            return package.GetAsByteArray();
        }

        private string? GetCellValue(ExcelWorksheet worksheet, int row, int col)
        {
            return worksheet.Cells[row, col].Value?.ToString();
        }

        private DateTime? ParseDate(string? value)
        {
            if (string.IsNullOrEmpty(value))
                return null;

            if (DateTime.TryParse(value, out var date))
                return date;

            // Try different date formats
            var formats = new[] { "yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy", "dd-MM-yyyy" };

            foreach (var format in formats)
            {
                if (DateTime.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
                    return date;
            }

            return null;
        }

        private bool? ParseBool(string? value)
        {
            if (string.IsNullOrEmpty(value))
                return null;

            value = value.ToLower().Trim();

            if (value == "true" || value == "1" || value == "yes" || value == "có")
                return true;

            if (value == "false" || value == "0" || value == "no" || value == "không")
                return false;

            return null;
        }
    }
}
