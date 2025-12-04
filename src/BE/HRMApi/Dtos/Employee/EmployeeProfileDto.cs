using System;
using System.Collections.Generic;

namespace HrmApi.Dtos.Employee
{
    public class EmployeeProfileDto
    {
        public string EmployeeName { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty; // dd/MM/yyyy
        public string Gender { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public string? PersonalEmail { get; set; }
        public string MaritalStatus { get; set; } = string.Empty;
        public bool HasChildren { get; set; }
        public string CitizenIdNumber { get; set; } = string.Empty;
        public string PersonalTaxCode { get; set; } = string.Empty;
        public string SocialInsuranceNumber { get; set; } = string.Empty;
        public string CurrentAddress { get; set; } = string.Empty;
        public List<EmployeePhoneNumberDto> PhoneNumbers { get; set; } = new();
        public List<EmployeeBankAccountDto> BankAccounts { get; set; } = new();
        public string Department { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string EmploymentType { get; set; } = string.Empty;
        public string ContractType { get; set; } = string.Empty;
        public string ContractStartDate { get; set; } = string.Empty;
        public string? ContractEndDate { get; set; }
        public string? DirectManager { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<ProfileUpdateHistoryDto> ProfileUpdateHistory { get; set; } = new();
        public List<EmployeeEducationDto> Education { get; set; } = new();
    }

    public class EmployeePhoneNumberDto
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class EmployeeBankAccountDto
    {
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class EmployeeEducationDto
    {
        public string Degree { get; set; } = string.Empty;
        public string Major { get; set; } = string.Empty;
        public string University { get; set; } = string.Empty;
        public int GraduationYear { get; set; }
        public string? OtherCertificates { get; set; }
    }

    public class ProfileUpdateHistoryDto
    {
        public int Id { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? RejectReason { get; set; }
        public string? Comment { get; set; }
    }

    public class ProfileUpdateRequestCreateDto
    {
        public string Reason { get; set; } = string.Empty;
        public List<ProfileUpdateRequestDetailCreateDto> Details { get; set; } = new();
    }

    public class ProfileUpdateRequestDetailCreateDto
    {
        public string FieldName { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string NewValue { get; set; } = string.Empty;
    }
}
