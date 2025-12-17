using OfficeOpenXml;
using HrmApi.Dtos.Employee;
using HrmApi.Models;
using HrmApi.Repositories;
using Microsoft.EntityFrameworkCore;
using HrmApi.Security;
using HrmApi.Data;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

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
                    PhoneNumber = GetCellValue(worksheet, row, 8)?.Trim(),
                    CompanyEmail = GetCellValue(worksheet, row, 9)?.Trim(),
                    PersonalEmail = GetCellValue(worksheet, row, 10)?.Trim(),
                    CurrentAddress = GetCellValue(worksheet, row, 11)?.Trim(),
                    DepartmentCode = GetCellValue(worksheet, row, 12)?.Trim(),
                    JobTitleCode = GetCellValue(worksheet, row, 13)?.Trim(),
                    RoleName = GetCellValue(worksheet, row, 14)?.Trim(),
                    EmploymentType = GetCellValue(worksheet, row, 15)?.Trim(),
                    ContractType = GetCellValue(worksheet, row, 16)?.Trim(),
                    ContractStartDate = ParseDate(GetCellValue(worksheet, row, 17)),
                    ContractEndDate = ParseDate(GetCellValue(worksheet, row, 18)),
                    DirectManagerCode = GetCellValue(worksheet, row, 19)?.Trim(),
                    MaritalStatus = GetCellValue(worksheet, row, 20)?.Trim(),
                    HasChildren = ParseBool(GetCellValue(worksheet, row, 21)),
                    PersonalTaxCode = GetCellValue(worksheet, row, 22)?.Trim(),
                    SocialInsuranceNumber = GetCellValue(worksheet, row, 23)?.Trim(),
                    Nationality = GetCellValue(worksheet, row, 24)?.Trim()
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

            // Update user account password if provided
            var userAccount = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == data.Username);
            
            if (userAccount != null)
            {
                userAccount.PasswordHash = _passwordHasher.HashPassword(data.Password);
                _context.UserAccounts.Update(userAccount);
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
            var existingUser = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == data.Username);
            
            if (existingUser != null)
                throw new ArgumentException($"Username '{data.Username}' đã tồn tại");

            // Create employee
            var employee = new Employee
            {
                EmployeeCode = data.EmployeeCode,
                FullName = data.FullName,
                DateOfBirth = data.DateOfBirth,
                Gender = data.Gender,
                CitizenIdNumber = data.CitizenIdNumber,
                PhoneNumber = data.PhoneNumber,
                CompanyEmail = data.CompanyEmail,
                PersonalEmail = data.PersonalEmail,
                CurrentAddress = data.CurrentAddress,
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
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Employee Template");

            // Add headers
            var headers = new[]
            {
                "EmployeeCode*", "FullName*", "Username*", "Password*", "DateOfBirth", 
                "Gender", "CitizenIdNumber", "PhoneNumber", "CompanyEmail", "PersonalEmail",
                "CurrentAddress", "DepartmentCode", "JobTitleCode", "RoleName", "EmploymentType",
                "ContractType", "ContractStartDate", "ContractEndDate", "DirectManagerCode",
                "MaritalStatus", "HasChildren", "PersonalTaxCode", "SocialInsuranceNumber", "Nationality"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
            }

            // Add sample data
            worksheet.Cells[2, 1].Value = "EMP001";
            worksheet.Cells[2, 2].Value = "Nguyễn Văn A";
            worksheet.Cells[2, 3].Value = "nguyenvana";
            worksheet.Cells[2, 4].Value = "Password123!";
            worksheet.Cells[2, 5].Value = "1990-01-15";
            worksheet.Cells[2, 6].Value = "Male";
            worksheet.Cells[2, 7].Value = "123456789";
            worksheet.Cells[2, 8].Value = "0901234567";
            worksheet.Cells[2, 9].Value = "nguyenvana@company.com";
            worksheet.Cells[2, 14].Value = "Employee";
            worksheet.Cells[2, 15].Value = "Full-time";
            worksheet.Cells[2, 16].Value = "Indefinite";

            worksheet.Cells.AutoFitColumns();

            return await Task.FromResult(package.GetAsByteArray());
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
