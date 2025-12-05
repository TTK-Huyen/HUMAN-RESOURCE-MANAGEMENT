using HrmApi.Dtos.Employee;
using HrmApi.Models;
using HrmApi.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeeService(IEmployeeRepository employeeRepository)
        {
            _employeeRepository = employeeRepository;
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
                }).ToList(),
                ProfileUpdateHistory = employee.ProfileUpdateHistory.Select(h => new ProfileUpdateHistoryDto
                {
                    Id = h.Id,
                    RequestDate = h.RequestDate,
                    Status = h.Status,
                    ReviewedBy = h.ReviewedBy?.EmployeeName,
                    ReviewedAt = h.ReviewedAt,
                    RejectReason = h.RejectReason,
                    Comment = h.Comment
                }).ToList()
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
                ProfileUpdateHistory = employee.ProfileUpdateHistory.Select(h => new ProfileUpdateHistoryDto
                {
                    Id = h.Id,
                    RequestDate = h.RequestDate,
                    Status = h.Status,
                    ReviewedBy = h.ReviewedBy?.EmployeeName,
                    ReviewedAt = h.ReviewedAt,
                    RejectReason = h.RejectReason,
                    Comment = h.Comment
                }).ToList()
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
            var request = new ProfileUpdateHistory
            {
                EmployeeId = employee.Id,
                RequestDate = DateTime.UtcNow,
                Status = "PENDING",
                Reason = dto.Reason,
                Details = dto.Details.Select(d => new ProfileUpdateRequestDetail
                {
                    FieldName = d.FieldName,
                    OldValue = d.OldValue,
                    NewValue = d.NewValue
                }).ToList()
            };
            _employeeRepository.AddProfileUpdateRequest(request);
            return await _employeeRepository.SaveChangesAsync() > 0;
        }
    }
}
