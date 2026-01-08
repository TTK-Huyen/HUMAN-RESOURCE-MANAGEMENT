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
                return (false, "File không được để trống");

            var allowedExtensions = new[] { ".xlsx", ".xls" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
                return (false, "Chỉ chấp nhận file Excel (.xlsx, .xls)");

            if (file.Length > 10 * 1024 * 1024) // 10MB limit
                return (false, "Kích thước file không được vượt quá 10MB");

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
                result.Errors.Add(new ExcelImportErrorDto { Row = 0, Error = $"Lỗi xử lý file: {ex.Message}" });
            }

            return result;
        }

        private async Task<List<EmployeeExcelImportDto>> ReadExcelDataAsync(IFormFile file)
        {
            var employees = new List<EmployeeExcelImportDto>();

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets.FirstOrDefault();

            if (worksheet == null)
                throw new ArgumentException("File Excel không có worksheet");

            var rowCount = worksheet.Dimension?.Rows ?? 0;
            if (rowCount <= 1)
                throw new ArgumentException("File Excel không có dữ liệu (chỉ có header)");

            // Read data starting from row 2 (skip header)
            for (int row = 2; row <= rowCount; row++)
            {
                var employee = new EmployeeExcelImportDto
                {
                    RowNumber = row,
                    EmployeeCode = GetCellValue(worksheet, row, 1)?.Trim() ?? "",
                    FullName = GetCellValue(worksheet, row, 2)?.Trim() ?? "",
                    Username = GetCellValue(worksheet, row, 3)?.Trim() ?? "",
                    Password = GetCellValue(worksheet, row, 4)?.Trim() ?? "",
                    DateOfBirth = ParseDate(GetCellValue(worksheet, row, 5)),
                    Gender = GetCellValue(worksheet, row, 6)?.Trim(),
                    CitizenIdNumber = GetCellValue(worksheet, row, 7)?.Trim(),
                    PhoneNumber1 = GetCellValue(worksheet, row, 8)?.Trim(),
                    PhoneNumber1Description = GetCellValue(worksheet, row, 9)?.Trim(),
                    PhoneNumber2 = GetCellValue(worksheet, row, 10)?.Trim(),
                    PhoneNumber2Description = GetCellValue(worksheet, row, 11)?.Trim(),
                    BirthPlaceProvince = GetCellValue(worksheet, row, 12)?.Trim(),
                    BirthPlaceDistrict = GetCellValue(worksheet, row, 13)?.Trim(),
                    PersonalEmail = GetCellValue(worksheet, row, 14)?.Trim(),
                    CompanyEmail = GetCellValue(worksheet, row, 15)?.Trim(),
                    CurrentAddress = GetCellValue(worksheet, row, 16)?.Trim(),
                    BankName = GetCellValue(worksheet, row, 17)?.Trim(),
                    BankAccountNumber = GetCellValue(worksheet, row, 18)?.Trim(),
                    DepartmentCode = GetCellValue(worksheet, row, 19)?.Trim(),
                    JobTitleCode = GetCellValue(worksheet, row, 20)?.Trim(),
                    RoleName = GetCellValue(worksheet, row, 21)?.Trim(),
                    EmploymentType = GetCellValue(worksheet, row, 22)?.Trim(),
                    ContractType = GetCellValue(worksheet, row, 23)?.Trim(),
                    ContractStartDate = ParseDate(GetCellValue(worksheet, row, 24)),
                    ContractEndDate = ParseDate(GetCellValue(worksheet, row, 25)),
                    DirectManagerCode = GetCellValue(worksheet, row, 26)?.Trim(),
                    MaritalStatus = GetCellValue(worksheet, row, 27)?.Trim(),
                    HasChildren = ParseBool(GetCellValue(worksheet, row, 28)),
                    PersonalTaxCode = GetCellValue(worksheet, row, 29)?.Trim(),
                    SocialInsuranceNumber = GetCellValue(worksheet, row, 30)?.Trim(),
                    Nationality = GetCellValue(worksheet, row, 31)?.Trim()
                };

                // Skip empty rows
                if (string.IsNullOrEmpty(employee.EmployeeCode) && string.IsNullOrEmpty(employee.FullName))
                    continue;

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

            // Business rules: conditional required
            if (!string.IsNullOrEmpty(rowData.ContractType) && rowData.ContractType.Equals("Fixed-term", StringComparison.OrdinalIgnoreCase))
            {
                if (!rowData.ContractEndDate.HasValue)
                    throw new ArgumentException("ContractEndDate is required when ContractType is 'Fixed-term'");
            }

            // DirectManagerCode required if system requires approval workflows - we'll treat as optional but if provided must exist
            // CompanyEmail conditional - not enforced here

            // Check if employee exists
            var existingEmployee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .FirstOrDefaultAsync(e => e.EmployeeCode == rowData.EmployeeCode);

            var isUpdate = existingEmployee != null;

            // Lookup references
            Department? department = null;
            if (!string.IsNullOrEmpty(rowData.DepartmentCode))
            {
                department = departments.FirstOrDefault(d => d.DepartmentCode == rowData.DepartmentCode);
                if (department == null)
                    throw new ArgumentException($"Không tìm thấy phòng ban với mã: {rowData.DepartmentCode}");
            }

            JobTitle? jobTitle = null;
            if (!string.IsNullOrEmpty(rowData.JobTitleCode))
            {
                jobTitle = jobTitles.FirstOrDefault(j => j.Id.ToString() == rowData.JobTitleCode);
                if (jobTitle == null)
                    throw new ArgumentException($"Không tìm thấy chức danh với mã: {rowData.JobTitleCode}");
            }

            Role? role = null;
            if (!string.IsNullOrEmpty(rowData.RoleName))
            {
                // Role model uses RoleName and RoleId
                role = roles.FirstOrDefault(r => r.RoleName == rowData.RoleName);
                if (role == null)
                    throw new ArgumentException($"Không tìm thấy role với tên: {rowData.RoleName}");
            }

            // Lookup direct manager if provided
            Employee? directManager = null;
            if (!string.IsNullOrEmpty(rowData.DirectManagerCode))
            {
                directManager = await _context.Employees
                    .FirstOrDefaultAsync(e => e.EmployeeCode == rowData.DirectManagerCode);
                if (directManager == null)
                    throw new ArgumentException($"Không tìm thấy quản lý trực tiếp với mã: {rowData.DirectManagerCode}");
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
            employee.PhoneNumber = data.PhoneNumber;
            employee.CompanyEmail = data.CompanyEmail;
            employee.PersonalEmail = data.PersonalEmail;
            employee.CurrentAddress = data.CurrentAddress;
            employee.BirthPlaceProvince = data.BirthPlaceProvince;
            employee.BirthPlaceDistrict = data.BirthPlaceDistrict;
            employee.EmploymentType = data.EmploymentType;
            // Use existing value when incoming value is null to avoid assigning null to non-nullable property
            employee.ContractType = data.ContractType ?? employee.ContractType;
            employee.ContractStartDate = data.ContractStartDate;
            employee.ContractEndDate = data.ContractEndDate;
            employee.MaritalStatus = data.MaritalStatus;
            employee.HasChildren = data.HasChildren ?? false;
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
                        Description = data.PhoneNumber2Description ?? "Liên hệ"
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
                    _context.EmployeeBankAccounts.Remove(existingBank);
                }

                var bankAccount = new EmployeeBankAccount
                {
                    EmployeeId = employee.Id,
                    BankName = data.BankName,
                    AccountNumber = data.BankAccountNumber
                };
                await _employeeRepository.AddBankAccountAsync(bankAccount);
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
            // Check if username already exists
            var existingUser = await _context.Employees
                .FirstOrDefaultAsync(u => u.CitizenIdNumber == data.CitizenIdNumber);

            if (existingUser != null)
                throw new ArgumentException($"Username '{data.FullName}' đã tồn tại");

            // Extract birth place and current address from data
            string? birthPlaceProvince = null;
            string? birthPlaceDistrict = null;
            string? currentAddressFormatted = data.CurrentAddress;

            if (!string.IsNullOrEmpty(data.BirthPlaceProvince) && !string.IsNullOrEmpty(data.BirthPlaceDistrict))
            {
                birthPlaceProvince = data.BirthPlaceProvince;
                birthPlaceDistrict = data.BirthPlaceDistrict;
            }

            // Create employee
            var employee = new Employee
            {
                FullName = data.FullName,
                DateOfBirth = data.DateOfBirth,
                Gender = data.Gender,
                CitizenIdNumber = data.CitizenIdNumber,
                PhoneNumber = string.IsNullOrEmpty(data.PhoneNumber) ? null : data.PhoneNumber,
                CompanyEmail = data.CompanyEmail,
                PersonalEmail = data.PersonalEmail,
                CurrentAddress = currentAddressFormatted,
                BirthPlaceProvince = birthPlaceProvince,
                BirthPlaceDistrict = birthPlaceDistrict,
                EmploymentType = data.EmploymentType,
                ContractType = data.ContractType ?? "Indefinite",
                ContractStartDate = data.ContractStartDate,
                ContractEndDate = data.ContractEndDate,
                MaritalStatus = data.MaritalStatus,
                HasChildren = data.HasChildren ?? false,
                PersonalTaxCode = data.PersonalTaxCode,
                SocialInsuranceNumber = data.SocialInsuranceNumber,
                Nationality = data.Nationality ?? "Vietnamese",
                Status = "ACTIVE",
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
                    Description = data.PhoneNumber2Description ?? "Liên hệ"
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

            // Create user account
            var userAccount = new UserAccount
            {
                Username = data.Username,
                PasswordHash = _passwordHasher.HashPassword(data.Password),
                EmployeeId = employee.Id,
                RoleId = role?.RoleId ?? 1 // Default to Employee role
            };

            _context.UserAccounts.Add(userAccount);
            await _context.SaveChangesAsync();
        }


        public async Task<byte[]> GenerateExcelTemplateAsync()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();

            // ===== 1) TEMPLATE SHEET =====
            var worksheet = package.Workbook.Worksheets.Add("Employee Template");

            var headers = new[]
            {
                "EmployeeCode*",
                "FullName*",
                "Username*",
                "Password*",
                "DateOfBirth*",
                "Gender*",
                "CitizenIdNumber*",
                "PhoneNumber1*",
                "PhoneNumber1Description",
                "PhoneNumber2",
                "PhoneNumber2Description",
                "BirthPlaceProvince*",
                "BirthPlaceDistrict*",
                "PersonalEmail",
                "CompanyEmail",
                "CurrentAddress",
                "BankName*",
                "BankAccountNumber*",
                "DepartmentCode*",
                "JobTitleCode*",
                "RoleName",
                "EmploymentType",
                "ContractType",
                "ContractStartDate*",
                "ContractEndDate",
                "DirectManagerCode",
                "MaritalStatus",
                "HasChildren",
                "PersonalTaxCode",
                "SocialInsuranceNumber",
                "Nationality*"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            }

            // ✅ Sample data (PHẢI khớp đúng "Code" / "RoleName" như header)
            worksheet.Cells[2, 1].Value = "NV001";                                           // EmployeeCode
            worksheet.Cells[2, 2].Value = "Nguyễn Văn An";                                   // FullName
            worksheet.Cells[2, 3].Value = "nguyenvana";                                      // Username
            worksheet.Cells[2, 4].Value = "Password@123";                                    // Password
            worksheet.Cells[2, 5].Value = "1995-03-20";                                      // DateOfBirth
            worksheet.Cells[2, 6].Value = "Nam";                                             // Gender
            worksheet.Cells[2, 7].Value = "0123456789012";                                   // CitizenIdNumber
            worksheet.Cells[2, 8].Value = "0912345678";                                      // PhoneNumber1
            worksheet.Cells[2, 9].Value = "Cá nhân";                                         // PhoneNumber1Description
            worksheet.Cells[2, 10].Value = "0987654321";                                     // PhoneNumber2
            worksheet.Cells[2, 11].Value = "Liên hệ";                                        // PhoneNumber2Description
            worksheet.Cells[2, 12].Value = "Hồ Chí Minh";                                   // BirthPlaceProvince
            worksheet.Cells[2, 13].Value = "Quận 9";                                         // BirthPlaceDistrict
            worksheet.Cells[2, 14].Value = "nguyenvana@personal.com";                        // PersonalEmail
            worksheet.Cells[2, 15].Value = "nguyenvana@company.com";                         // CompanyEmail
            worksheet.Cells[2, 16].Value = "456 Đường Lê Văn Việt, Quận 9, TP.HCM";          // CurrentAddress
            worksheet.Cells[2, 17].Value = "TECHCOMBANK";                                    // BankName
            worksheet.Cells[2, 18].Value = "1234567890123";                                  // BankAccountNumber
            worksheet.Cells[2, 19].Value = "IT";                                             // DepartmentCode
            worksheet.Cells[2, 20].Value = "5";                                              // JobTitleCode
            worksheet.Cells[2, 21].Value = "Nhân viên";                                      // RoleName
            worksheet.Cells[2, 22].Value = "Toàn thời gian";                                 // EmploymentType
            worksheet.Cells[2, 23].Value = "Vĩnh viễn";                                      // ContractType
            worksheet.Cells[2, 24].Value = "2023-06-01";                                     // ContractStartDate
            worksheet.Cells[2, 25].Value = "";                                               // ContractEndDate (empty for indefinite)
            worksheet.Cells[2, 26].Value = "MNG001";                                         // DirectManagerCode
            worksheet.Cells[2, 27].Value = "Độc thân";                                       // MaritalStatus
            worksheet.Cells[2, 28].Value = "Không";                                          // HasChildren
            worksheet.Cells[2, 29].Value = "0945123456";                                     // PersonalTaxCode
            worksheet.Cells[2, 30].Value = "9501234567";                                     // SocialInsuranceNumber
            worksheet.Cells[2, 31].Value = "Việt Nam";                                       // Nationality

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
                .Where(r => r.RoleCode == "MANAGER")
                .Select(r => r.RoleId)
                .FirstOrDefaultAsync();

            var managers = await _context.Employees
                .AsNoTracking()
                .Join(_context.UserAccounts, 
                    e => e.Id, 
                    ua => ua.EmployeeId, 
                    (e, ua) => new { Employee = e, UserAccount = ua })
                .Where(x => x.UserAccount.RoleId == managerRoleId && x.Employee.Status == "Đang làm việc")
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
            var genderValues = new[] { "Nam", "Nữ", "Khác" };
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
            var employmentTypes = new[] { "Toàn thời gian", "Bán thời gian", "Theo hợp đồng", "Tạm thời" };
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
            var contractTypes = new[] { "Vĩnh viễn", "Có thời hạn" };
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
            var maritalStatuses = new[] { "Độc thân", "Kết hôn", "Ly hôn", "Góa" };
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
            var childrenValues = new[] { "Có", "Không" };
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
            var nationalities = new[] { "Việt Nam", "Khác" };
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
            var statusValues = new[] { "Đang làm việc", "Nghỉ việc", "Tạm dừng", "Từ chức" };
            foreach (var s in statusValues)
            {
                lookup.Cells[row, 1].Value = s;
                row++;
            }
            int statusEndRow = row - 1;
            row += 2;

            // --- Leave Type ---
            lookup.Cells[row, 1].Value = "LEAVE TYPE";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            lookup.Cells[row, 1].Value = "Value";
            lookup.Cells[row, 1].Style.Font.Bold = true;
            row++;

            int leaveTypeStartRow = row;
            var leaveTypeValues = new[] { "Phép năm", "Phép bệnh", "Phép cá nhân", "Nghỉ không lương", "Phép thai sản" };
            foreach (var l in leaveTypeValues)
            {
                lookup.Cells[row, 1].Value = l;
                row++;
            }
            int leaveTypeEndRow = row - 1;

            lookup.Cells[lookup.Dimension.Address].AutoFitColumns();

            
            // ===== 3) (OPTIONAL) Dropdown validation ngay trên template =====
            // Nếu bạn muốn user chọn từ dropdown thay vì gõ code
            // DepartmentCode = column 8, JobTitleCode = 9, RoleName = 10, EmploymentType = 11
            // ContractType = 12, Gender = 3, MaritalStatus = 16, HasChildren = 17, Nationality = 20
            // áp dụng từ row 2 đến row 1000
            int startDataRow = 2;
            int endDataRow = 1000;

            // Gender (Column 3)
            if (genderEndRow >= genderStartRow)
            {
                var addr = $"A{genderStartRow}:A{genderEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 3, endDataRow, 3].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Gender";
                dv.Error = "Vui lòng chọn Gender từ danh sách Lookup.";
            }

            // DepartmentCode (Column 8)
            if (deptEndRow >= deptStartRow)
            {
                var addr = $"A{deptStartRow}:A{deptEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 8, endDataRow, 8].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai DepartmentCode";
                dv.Error = "Vui lòng chọn DepartmentCode từ danh sách Lookup.";
            }

            // JobTitleCode (Column 9)
            if (jtEndRow >= jtStartRow)
            {
                var addr = $"A{jtStartRow}:A{jtEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 9, endDataRow, 9].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai JobTitleCode";
                dv.Error = "Vui lòng chọn JobTitleCode từ danh sách Lookup.";
            }

            // RoleName (Column 10)
            if (roleEndRow >= roleStartRow)
            {
                var addr = $"A{roleStartRow}:A{roleEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 10, endDataRow, 10].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai RoleName";
                dv.Error = "Vui lòng chọn RoleName từ danh sách Lookup.";
            }

            // EmploymentType (Column 11)
            if (empTypeEndRow >= empTypeStartRow)
            {
                var addr = $"A{empTypeStartRow}:A{empTypeEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 11, endDataRow, 11].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai EmploymentType";
                dv.Error = "Vui lòng chọn EmploymentType từ danh sách Lookup.";
            }

            // ContractType (Column 12)
            if (contractTypeEndRow >= contractTypeStartRow)
            {
                var addr = $"A{contractTypeStartRow}:A{contractTypeEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 12, endDataRow, 12].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai ContractType";
                dv.Error = "Vui lòng chọn ContractType từ danh sách Lookup.";
            }

            // MaritalStatus (Column 16)
            if (maritalEndRow >= maritalStartRow)
            {
                var addr = $"A{maritalStartRow}:A{maritalEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 16, endDataRow, 16].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai MaritalStatus";
                dv.Error = "Vui lòng chọn MaritalStatus từ danh sách Lookup.";
            }

            // HasChildren (Column 17)
            if (childrenEndRow >= childrenStartRow)
            {
                var addr = $"A{childrenStartRow}:A{childrenEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 17, endDataRow, 17].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai HasChildren";
                dv.Error = "Vui lòng chọn HasChildren từ danh sách Lookup.";
            }

            // Nationality (Column 20)
            if (nationalityEndRow >= nationalityStartRow)
            {
                var addr = $"A{nationalityStartRow}:A{nationalityEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 20, endDataRow, 20].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Nationality";
                dv.Error = "Vui lòng chọn Nationality từ danh sách Lookup.";
            }

            // DirectManagerCode (Column 15)
            if (managerEndRow >= managerStartRow)
            {
                var addr = $"A{managerStartRow}:A{managerEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 15, endDataRow, 15].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai DirectManagerCode";
                dv.Error = "Vui lòng chọn DirectManagerCode từ danh sách Lookup.";
            }

            
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
