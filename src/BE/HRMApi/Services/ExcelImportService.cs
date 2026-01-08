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
            var worksheet = package.Workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Employee Template");

            if (worksheet == null)
                throw new ArgumentException("File Excel không có worksheet 'Employee Template'");

            var rowCount = worksheet.Dimension?.Rows ?? 0;
            if (rowCount <= 1)
                throw new ArgumentException("File Excel không có dữ liệu (chỉ có header)");

            // Read data starting from row 2 (skip header)
            // Cấu trúc mới (không có EmployeeCode, Username, Password, CompanyEmail):
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

                // EmployeeCode, Username, Password để trống - server sẽ tự tạo
                var employee = new EmployeeExcelImportDto
                {
                    RowNumber = row,
                    EmployeeCode = "",  // Sẽ tự động tạo
                    Username = "",      // Sẽ tự động tạo
                    Password = "",      // Sẽ tự động tạo từ CCCD
                    
                    // Thông tin cá nhân
                    FullName = fullName ?? "",
                    DateOfBirth = ParseDate(GetCellValue(worksheet, row, 2)),
                    Gender = GetCellValue(worksheet, row, 3)?.Trim(),
                    Nationality = GetCellValue(worksheet, row, 4)?.Trim(),
                    MaritalStatus = GetCellValue(worksheet, row, 5)?.Trim(),
                    HasChildren = ParseBool(GetCellValue(worksheet, row, 6)),
                    
                    // Thông tin pháp lý
                    CitizenIdNumber = citizenId,
                    PersonalTaxCode = GetCellValue(worksheet, row, 8)?.Trim(),
                    SocialInsuranceNumber = GetCellValue(worksheet, row, 9)?.Trim(),
                    
                    // Thông tin liên hệ
                    CompanyEmail = null, // Sẽ tự động tạo từ tên
                    PersonalEmail = GetCellValue(worksheet, row, 10)?.Trim(),
                    PhoneNumber1 = GetCellValue(worksheet, row, 11)?.Trim(),
                    PhoneNumber1Description = GetCellValue(worksheet, row, 12)?.Trim(),
                    PhoneNumber2 = GetCellValue(worksheet, row, 13)?.Trim(),
                    PhoneNumber2Description = GetCellValue(worksheet, row, 14)?.Trim(),
                    
                    // Địa chỉ
                    BirthPlaceProvince = GetCellValue(worksheet, row, 15)?.Trim(),
                    BirthPlaceDistrict = GetCellValue(worksheet, row, 16)?.Trim(),
                    CurrentAddressProvince = GetCellValue(worksheet, row, 17)?.Trim(),
                    CurrentAddressDistrict = GetCellValue(worksheet, row, 18)?.Trim(),
                    CurrentAddress = null, // Sẽ build từ province + district
                    
                    // Ngân hàng
                    BankName = GetCellValue(worksheet, row, 19)?.Trim(),
                    BankAccountNumber = GetCellValue(worksheet, row, 20)?.Trim(),
                    
                    // Công việc
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
                if (cccdDigits.Length != 13)
                    throw new ArgumentException("CCCD phải đúng 13 chữ số");
            }

            // Validate phone number format (10 số)
            if (!string.IsNullOrEmpty(rowData.PhoneNumber1))
            {
                var phoneDigits = new string(rowData.PhoneNumber1.Where(char.IsDigit).ToArray());
                if (phoneDigits.Length != 10)
                    throw new ArgumentException("Số điện thoại 1 phải đúng 10 chữ số");
            }

            // Business rules: conditional required
            if (!string.IsNullOrEmpty(rowData.ContractType) && 
                (rowData.ContractType.Equals("Có thời hạn", StringComparison.OrdinalIgnoreCase) ||
                 rowData.ContractType.Equals("Fixed-term", StringComparison.OrdinalIgnoreCase)))
            {
                if (!rowData.ContractEndDate.HasValue)
                    throw new ArgumentException("Ngày kết thúc hợp đồng là bắt buộc khi loại hợp đồng là 'Có thời hạn'");
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
                throw new ArgumentException($"CCCD '{data.CitizenIdNumber}' đã tồn tại trong hệ thống");

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
                ContractType = data.ContractType ?? "Indefinite",
                ContractStartDate = data.ContractStartDate,
                ContractEndDate = data.ContractEndDate,
                MaritalStatus = data.MaritalStatus ?? "Độc thân",
                HasChildren = data.HasChildren ?? false,
                PersonalTaxCode = data.PersonalTaxCode,
                SocialInsuranceNumber = data.SocialInsuranceNumber,
                Nationality = data.Nationality ?? "Việt Nam",
                Status = "Đang làm việc",
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
            var instructions = package.Workbook.Worksheets.Add("Hướng dẫn");
            instructions.Cells[1, 1].Value = "HƯỚNG DẪN IMPORT NHÂN VIÊN";
            instructions.Cells[1, 1].Style.Font.Bold = true;
            instructions.Cells[1, 1].Style.Font.Size = 16;
            instructions.Cells[1, 1].Style.Font.Color.SetColor(Color.DarkBlue);
            
            int instructRow = 3;
            instructions.Cells[instructRow++, 1].Value = "1. CÁC TRƯỜNG BẮT BUỘC (có dấu *):";
            instructions.Cells[instructRow++, 1].Value = "   - Họ và tên (FullName)";
            instructions.Cells[instructRow++, 1].Value = "   - Ngày sinh (DateOfBirth) - Định dạng: YYYY-MM-DD";
            instructions.Cells[instructRow++, 1].Value = "   - Giới tính (Gender) - Chọn: Nam, Nữ, Khác";
            instructions.Cells[instructRow++, 1].Value = "   - Số CCCD (CitizenIdNumber) - Đúng 13 chữ số";
            instructions.Cells[instructRow++, 1].Value = "   - Số điện thoại 1 (PhoneNumber1) - 10-11 chữ số";
            instructions.Cells[instructRow++, 1].Value = "   - Nơi sinh: Tỉnh/Thành phố (BirthPlaceProvince)";
            instructions.Cells[instructRow++, 1].Value = "   - Nơi sinh: Quận/Huyện (BirthPlaceDistrict)";
            instructions.Cells[instructRow++, 1].Value = "   - Địa chỉ hiện tại: Tỉnh/Thành phố (CurrentAddressProvince)";
            instructions.Cells[instructRow++, 1].Value = "   - Địa chỉ hiện tại: Quận/Huyện (CurrentAddressDistrict)";
            instructions.Cells[instructRow++, 1].Value = "   - Tên ngân hàng (BankName)";
            instructions.Cells[instructRow++, 1].Value = "   - Số tài khoản ngân hàng (BankAccountNumber)";
            instructions.Cells[instructRow++, 1].Value = "   - Mã phòng ban (DepartmentCode) - Xem sheet Lookup";
            instructions.Cells[instructRow++, 1].Value = "   - Mã chức danh (JobTitleCode) - Xem sheet Lookup";
            instructions.Cells[instructRow++, 1].Value = "   - Ngày bắt đầu hợp đồng (ContractStartDate) - Định dạng: YYYY-MM-DD";
            instructions.Cells[instructRow++, 1].Value = "   - Phân quyền (RoleName) - Xem sheet Lookup";
            instructions.Cells[instructRow++, 1].Value = "";
            
            instructions.Cells[instructRow++, 1].Value = "2. CÁC TRƯỜNG TÙY CHỌN:";
            instructions.Cells[instructRow++, 1].Value = "   - Quốc tịch (Nationality) - Mặc định: Việt Nam";
            instructions.Cells[instructRow++, 1].Value = "   - Tình trạng hôn nhân (MaritalStatus)";
            instructions.Cells[instructRow++, 1].Value = "   - Có con (HasChildren) - Có/Không";
            instructions.Cells[instructRow++, 1].Value = "   - Mã số thuế cá nhân (PersonalTaxCode) - 10 chữ số";
            instructions.Cells[instructRow++, 1].Value = "   - Số sổ BHXH (SocialInsuranceNumber) - 10 chữ số";
            instructions.Cells[instructRow++, 1].Value = "   - Email cá nhân (PersonalEmail)";
            instructions.Cells[instructRow++, 1].Value = "   - Mô tả số điện thoại 1 (PhoneNumber1Description) - VD: Cá nhân, Khẩn cấp, Công việc";
            instructions.Cells[instructRow++, 1].Value = "   - Số điện thoại 2 (PhoneNumber2) - 10-11 chữ số";
            instructions.Cells[instructRow++, 1].Value = "   - Mô tả số điện thoại 2 (PhoneNumber2Description)";
            instructions.Cells[instructRow++, 1].Value = "   - Hình thức làm việc (EmploymentType) - Mặc định: Toàn thời gian";
            instructions.Cells[instructRow++, 1].Value = "     Giá trị: Full-time (Toàn thời gian) | Part-time (Bán thời gian) | Remote (Làm việc từ xa) | Internship (Thực tập)";
            instructions.Cells[instructRow++, 1].Value = "   - Loại hợp đồng (ContractType) - Mặc định: Vô thời hạn";
            instructions.Cells[instructRow++, 1].Value = "     Giá trị: Indefinite (Vô thời hạn) | Fixed-term (Xác định thời hạn) | Probation (Thử việc)";
            instructions.Cells[instructRow++, 1].Value = "   - Ngày kết thúc hợp đồng (ContractEndDate) - Bắt buộc nếu ContractType là 'Fixed-term'";
            instructions.Cells[instructRow++, 1].Value = "   - Mã quản lý trực tiếp (DirectManagerCode) - Mã nhân viên của manager";
            instructions.Cells[instructRow++, 1].Value = "";
            
            instructions.Cells[instructRow++, 1].Value = "3. LƯU Ý QUAN TRỌNG:";
            instructions.Cells[instructRow++, 1].Value = "   - Mã nhân viên (EmployeeCode) tự động tạo, không cần nhập";
            instructions.Cells[instructRow++, 1].Value = "   - Tên đăng nhập (Username) tự động = EmployeeCode";
            instructions.Cells[instructRow++, 1].Value = "   - Mật khẩu mặc định tự động từ CCCD";
            instructions.Cells[instructRow++, 1].Value = "   - Email công ty (CompanyEmail) tự động tạo từ tên nhân viên";
            instructions.Cells[instructRow++, 1].Value = "   - CCCD phải đúng 13 chữ số";
            instructions.Cells[instructRow++, 1].Value = "   - Ngày sinh phải ở quá khứ";
            instructions.Cells[instructRow++, 1].Value = "   - Email cá nhân (nếu có) phải hợp lệ";
            instructions.Cells[instructRow++, 1].Value = "   - Giá trị Employment Type và Contract Type phải chính xác (xem danh sách ở trên)";
            instructions.Cells[instructRow++, 1].Value = "   - Nếu ContractEndDate có giá trị, phải sau ContractStartDate";
            instructions.Cells[instructRow++, 1].Value = "";
            
            instructions.Cells[instructRow++, 1].Value = "4. CÁCH SỬ DỤNG:";
            instructions.Cells[instructRow++, 1].Value = "   a) Xem sheet 'Lookup' để biết các giá trị hợp lệ (DepartmentCode, JobTitleCode, RoleName,...)";
            instructions.Cells[instructRow++, 1].Value = "   b) Điền thông tin vào sheet 'Employee Template' (đã có sẵn 1 dòng mẫu)";
            instructions.Cells[instructRow++, 1].Value = "   c) Sử dụng đúng giá trị từ sheet 'Lookup' để tránh lỗi";
            instructions.Cells[instructRow++, 1].Value = "   d) Lưu file và upload lên hệ thống";
            
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

            // Sample data - cập nhật theo cột mới (không có CompanyEmail)
            worksheet.Cells[2, 1].Value = "Nguyễn Văn An";                                   // FullName
            worksheet.Cells[2, 2].Value = "1995-03-20";                                      // DateOfBirth
            worksheet.Cells[2, 3].Value = "Nam";                                             // Gender
            worksheet.Cells[2, 4].Value = "Việt Nam";                                        // Nationality
            worksheet.Cells[2, 5].Value = "Độc thân";                                        // MaritalStatus
            worksheet.Cells[2, 6].Value = "Không";                                           // HasChildren
            worksheet.Cells[2, 7].Value = "0123456789012";                                   // CitizenIdNumber (13 số)
            worksheet.Cells[2, 8].Value = "0945123456";                                      // PersonalTaxCode (10 số)
            worksheet.Cells[2, 9].Value = "9501234567";                                      // SocialInsuranceNumber (10 số)
            worksheet.Cells[2, 10].Value = "nguyenvana@personal.com";                        // PersonalEmail
            worksheet.Cells[2, 11].Value = "0912345678";                                     // PhoneNumber1 (10 số)
            worksheet.Cells[2, 12].Value = "Personal";                                       // PhoneNumber1Description
            worksheet.Cells[2, 13].Value = "0987654321";                                     // PhoneNumber2 (10 số)
            worksheet.Cells[2, 14].Value = "Emergency";                                      // PhoneNumber2Description
            worksheet.Cells[2, 15].Value = "Hồ Chí Minh";                                    // BirthPlaceProvince
            worksheet.Cells[2, 16].Value = "Quận 9";                                         // BirthPlaceDistrict
            worksheet.Cells[2, 17].Value = "Hồ Chí Minh";                                    // CurrentAddressProvince
            worksheet.Cells[2, 18].Value = "Quận 9";                                         // CurrentAddressDistrict
            worksheet.Cells[2, 19].Value = "TECHCOMBANK";                                    // BankName
            worksheet.Cells[2, 20].Value = "1234567890123";                                  // BankAccountNumber
            worksheet.Cells[2, 21].Value = "IT";                                             // DepartmentCode
            worksheet.Cells[2, 22].Value = "5";                                              // JobTitleCode
            worksheet.Cells[2, 23].Value = "";                                               // DirectManagerCode (optional)
            worksheet.Cells[2, 24].Value = "Full-time";                                      // EmploymentType
            worksheet.Cells[2, 25].Value = "Indefinite";                                     // ContractType
            worksheet.Cells[2, 26].Value = "2023-06-01";                                     // ContractStartDate
            worksheet.Cells[2, 27].Value = "";                                               // ContractEndDate (empty for indefinite)
            worksheet.Cells[2, 28].Value = "Nhân viên";                                      // RoleName

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
            var employmentTypes = new[] { "Full-time", "Part-time", "Remote", "Internship" };
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
            var contractTypes = new[] { "Indefinite", "Fixed-term", "Probation" };
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
            var maritalStatuses = new[] { "Độc thân", "Đã kết hôn", "Đã ly hôn" };
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

            
            // ===== 3) DROPDOWN VALIDATION trên template =====
            // Cập nhật theo cấu trúc cột mới:
            // Gender=3, Nationality=4, MaritalStatus=5, HasChildren=6, 
            // DepartmentCode=22, JobTitleCode=23, DirectManagerCode=24, 
            // EmploymentType=25, ContractType=26, RoleName=29
            int startDataRow = 2;
            int endDataRow = 1000;

            // Gender (Column 3)
            if (genderEndRow >= genderStartRow)
            {
                var addr = $"A{genderStartRow}:A{genderEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 3, endDataRow, 3].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Giới tính";
                dv.Error = "Vui lòng chọn Giới tính từ danh sách: Nam, Nữ, Khác";
            }

            // Nationality (Column 4)
            if (nationalityEndRow >= nationalityStartRow)
            {
                var addr = $"A{nationalityStartRow}:A{nationalityEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 4, endDataRow, 4].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Quốc tịch";
                dv.Error = "Vui lòng chọn Quốc tịch từ danh sách Lookup.";
            }

            // MaritalStatus (Column 5)
            if (maritalEndRow >= maritalStartRow)
            {
                var addr = $"A{maritalStartRow}:A{maritalEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 5, endDataRow, 5].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Tình trạng hôn nhân";
                dv.Error = "Vui lòng chọn từ: Độc thân, Đã kết hôn, Đã ly hôn";
            }

            // HasChildren (Column 6)
            if (childrenEndRow >= childrenStartRow)
            {
                var addr = $"A{childrenStartRow}:A{childrenEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 6, endDataRow, 6].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai giá trị Có con";
                dv.Error = "Vui lòng chọn: Có hoặc Không";
            }

            // DepartmentCode (Column 22)
            if (deptEndRow >= deptStartRow)
            {
                var addr = $"A{deptStartRow}:A{deptEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 22, endDataRow, 22].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Mã phòng ban";
                dv.Error = "Vui lòng chọn Mã phòng ban từ danh sách Lookup (Sheet 'Lookup', phần DEPARTMENTS).";
            }

            // JobTitleCode (Column 23)
            if (jtEndRow >= jtStartRow)
            {
                var addr = $"A{jtStartRow}:A{jtEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 23, endDataRow, 23].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Mã chức danh";
                dv.Error = "Vui lòng chọn Mã chức danh từ danh sách Lookup (Sheet 'Lookup', phần JOB TITLES).";
            }

            // DirectManagerCode (Column 24)
            if (managerEndRow >= managerStartRow)
            {
                var addr = $"A{managerStartRow}:A{managerEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 24, endDataRow, 24].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Mã quản lý";
                dv.Error = "Vui lòng chọn Mã quản lý từ danh sách Lookup (Sheet 'Lookup', phần MANAGERS).";
            }

            // EmploymentType (Column 25)
            if (empTypeEndRow >= empTypeStartRow)
            {
                var addr = $"A{empTypeStartRow}:A{empTypeEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 25, endDataRow, 25].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Hình thức làm việc";
                dv.Error = "Vui lòng chọn Hình thức làm việc từ danh sách Lookup.";
            }

            // ContractType (Column 26)
            if (contractTypeEndRow >= contractTypeStartRow)
            {
                var addr = $"A{contractTypeStartRow}:A{contractTypeEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 26, endDataRow, 26].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Loại hợp đồng";
                dv.Error = "Vui lòng chọn: Vĩnh viễn hoặc Có thời hạn";
            }

            // RoleName (Column 29)
            if (roleEndRow >= roleStartRow)
            {
                var addr = $"A{roleStartRow}:A{roleEndRow}";
                var dv = worksheet.DataValidations.AddListValidation(worksheet.Cells[startDataRow, 29, endDataRow, 29].Address);
                dv.Formula.ExcelFormula = $"Lookup!{addr}";
                dv.ShowErrorMessage = true;
                dv.ErrorTitle = "Sai Phân quyền";
                dv.Error = "Vui lòng chọn Phân quyền từ danh sách Lookup (Sheet 'Lookup', phần ROLES).";
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
