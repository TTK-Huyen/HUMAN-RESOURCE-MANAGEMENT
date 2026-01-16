using HrmApi.Data;
using HrmApi.Models;
using HrmApi.Dtos.Employee;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HrmApi.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Employee?> FindByIdAsync(int id)
        {
            return await _context.Employees
                .Include(e => e.PhoneNumbers)
                .Include(e => e.BankAccounts)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task SaveAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
        }

        public async Task<Employee?> GetProfileByCodeAsync(string employeeCode)
        {
            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.DirectManager)
                .Include(e => e.PhoneNumbers)
                .Include(e => e.BankAccounts)
                .Include(e => e.Education)
                .Include(e => e.ProfileUpdateRequests)
                .ThenInclude(h => h.Details)
                .FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
        }

        public async Task<Employee?> GetProfileByIdAsync(int id)
        {
            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.DirectManager)
                .Include(e => e.PhoneNumbers)
                .Include(e => e.BankAccounts)
                .Include(e => e.Education)
                .Include(e => e.ProfileUpdateRequests)
                .ThenInclude(h => h.Details)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<Employee?> GetByCodeAsync(string employeeCode)
        {
            return await _context.Employees
                .FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
        }

        public async Task<LeaveRequest?> GetLeaveRequestByIdAsync(int requestId)
        {
            return await _context.LeaveRequests
                .Include(l => l.Request)
                    .ThenInclude(r => r.Employee)
                        .ThenInclude(e => e.Department)
                .Include(l => l.Request)
                    .ThenInclude(r => r.Employee)
                        .ThenInclude(e => e.JobTitle) // Ensure JobTitle is included
                .Include(l => l.HandoverEmployee)
                .FirstOrDefaultAsync(l => l.Id == requestId);
        }

        public async Task AddAsync(Employee employee)
        {
            _context.Employees.Add(employee);
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            return await _context.Employees.FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Employee?> GetManagerByIdAsync(int managerId)
        {
            return await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == managerId);
        }



        public async Task<List<Employee>> GetAllEmployeesAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.DirectManager)
                .ToListAsync();
        }

        public async Task<(List<Employee> employees, int totalCount)> GetEmployeesWithFilterAsync(EmployeeFilterDto filter)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.DirectManager)
                .AsQueryable();            // Apply filters
            if (!string.IsNullOrEmpty(filter.SearchKeyword))
            {
                query = query.Where(e =>
                    e.FullName.Contains(filter.SearchKeyword) ||
                    e.EmployeeCode.Contains(filter.SearchKeyword));
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(e => e.DepartmentId == filter.DepartmentId.Value);
            }

            if (filter.JobTitleId.HasValue)
            {
                query = query.Where(e => e.JobTitleId == filter.JobTitleId.Value);
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(e => e.Status == filter.Status);
            }

            if (!string.IsNullOrEmpty(filter.Gender))
            {
                query = query.Where(e => e.Gender == filter.Gender);
            }

            if (!string.IsNullOrEmpty(filter.EmploymentType))
            {
                query = query.Where(e => e.EmploymentType == filter.EmploymentType);
            }

            if (!string.IsNullOrEmpty(filter.ContractType))
            {
                query = query.Where(e => e.ContractType == filter.ContractType);
            }

            if (filter.DirectManagerId.HasValue)
            {
                query = query.Where(e => e.DirectManagerId == filter.DirectManagerId.Value);
            }

            if (filter.DateOfBirthFrom.HasValue)
            {
                query = query.Where(e => e.DateOfBirth >= filter.DateOfBirthFrom.Value);
            }

            if (filter.DateOfBirthTo.HasValue)
            {
                query = query.Where(e => e.DateOfBirth <= filter.DateOfBirthTo.Value);
            }

            if (filter.ContractStartDateFrom.HasValue)
            {
                query = query.Where(e => e.ContractStartDate >= filter.ContractStartDateFrom.Value);
            }

            if (filter.ContractStartDateTo.HasValue)
            {
                query = query.Where(e => e.ContractStartDate <= filter.ContractStartDateTo.Value);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            if (!string.IsNullOrEmpty(filter.SortBy))
            {
                switch (filter.SortBy.ToLower())
                {
                    case "employeename":
                        query = filter.SortDirection.ToUpper() == "DESC"
                            ? query.OrderByDescending(e => e.FullName)
                            : query.OrderBy(e => e.FullName);
                        break;
                    case "employeecode":
                        query = filter.SortDirection.ToUpper() == "DESC"
                            ? query.OrderByDescending(e => e.EmployeeCode)
                            : query.OrderBy(e => e.EmployeeCode);
                        break;
                    case "dateofbirth":
                        query = filter.SortDirection.ToUpper() == "DESC"
                            ? query.OrderByDescending(e => e.DateOfBirth)
                            : query.OrderBy(e => e.DateOfBirth);
                        break;
                    case "contractstartdate":
                        query = filter.SortDirection.ToUpper() == "DESC"
                            ? query.OrderByDescending(e => e.ContractStartDate)
                            : query.OrderBy(e => e.ContractStartDate);
                        break;
                    default:
                        query = query.OrderBy(e => e.FullName);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(e => e.FullName);
            }

            // Apply pagination
            var employees = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (employees, totalCount);
        }
        public async Task<List<Employee>> GetEssentialEmployeeInfoAsync(string? employeeCode = null)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Where(e => e.Status == "ACTIVE")
                .AsQueryable();

            // Nếu có employeeCode thì filter theo mã nhân viên đó
            if (!string.IsNullOrEmpty(employeeCode))
            {
                query = query.Where(e => e.EmployeeCode == employeeCode);
            }

            return await query
                .OrderBy(e => e.FullName)
                .ToListAsync();
        }

        public async Task<List<Employee>> GetAllAsync()
        {
            return await _context.Employees
                .Include(e => e.JobTitle) // Quan trọng: Join bảng Role để lấy tên quyền (Manager/HR)
                .ToListAsync();
        }

        public async Task<bool> ExistsByCompanyEmailAsync(string companyEmail)
        {
            return await _context.Employees
                .AnyAsync(e => e.CompanyEmail == companyEmail);
        }

        public async Task<bool> ExistsByCitizenIdAsync(string citizenIdNumber)
        {
            return await _context.Employees
                .AnyAsync(e => e.CitizenIdNumber == citizenIdNumber);
        }

        public async Task AddPhoneNumberAsync(EmployeePhoneNumber phoneNumber)
        {
            await _context.EmployeePhoneNumbers.AddAsync(phoneNumber);
        }

        public async Task AddBankAccountAsync(EmployeeBankAccount bankAccount)
        {
            await _context.EmployeeBankAccounts.AddAsync(bankAccount);
        }
    }
}

