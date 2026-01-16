using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
namespace HrmApi.Dtos.Employee
{
    public class EmployeeProfileDto
    {
        // Employee.Id (primary key for React list rendering)
        public int Id { get; set; }

        // Map từ Employee.FullName / Employee.EmployeeName (NotMapped)
        public string EmployeeName { get; set; } = string.Empty;

        // Employee.EmployeeCode (NOT NULL trong model)
        public string EmployeeCode { get; set; } = string.Empty;

        // Employee.DateOfBirth: DateTime?  → string? để format dd/MM/yyyy hoặc null
        public string? DateOfBirth { get; set; } // dd/MM/yyyy

        // Employee.Gender: string?
        public string? Gender { get; set; }

        // Employee.Nationality: string (model để non-null) → có thể để "" nếu chưa có
        public string Nationality { get; set; } = string.Empty;

        // Employee.CompanyEmail: string?
        public string? CompanyEmail { get; set; }

        // Employee.PersonalEmail: string?
        public string? PersonalEmail { get; set; }

        // Employee.MaritalStatus: string?
        public string? MaritalStatus { get; set; } // Single / Married / Other

        // Employee.HasChildren: bool
        public bool HasChildren { get; set; }

        // Employee.CitizenIdNumber: string?
        public string? CitizenIdNumber { get; set; }

        // Employee.PersonalTaxCode: string?
        public string? PersonalTaxCode { get; set; }

        // Employee.SocialInsuranceNumber: string?
        public string? SocialInsuranceNumber { get; set; }

        // Employee.CurrentAddress: string?
        public string? CurrentAddress { get; set; }

        // Birth place (province/district)
        public string? BirthPlaceProvince { get; set; }
        public string? BirthPlaceDistrict { get; set; }

        // Map từ Employee.PhoneNumbers (collection) + Employee.PhoneNumber nếu cần
        public List<EmployeePhoneNumberDto> PhoneNumbers { get; set; } = new();

        // Map từ Employee.BankAccounts
        public List<EmployeeBankAccountDto> BankAccounts { get; set; } = new();

        // Map từ Employee.Department?.Name (hoặc field tương đương)
        public string? Department { get; set; }

        // Map từ Employee.JobTitle?.Name
        public string? JobTitle { get; set; }

        // Employee.EmploymentType: string?
        public string? EmploymentType { get; set; } // Full-time / Part-time / ...

        // Employee.ContractType: string (model non-null)
        public string ContractType { get; set; } = string.Empty;

        // Employee.ContractStartDate: DateTime?
        public string? ContractStartDate { get; set; } // dd/MM/yyyy

        // Employee.ContractEndDate: DateTime?
        public string? ContractEndDate { get; set; } // dd/MM/yyyy hoặc null

        // Map từ Employee.DirectManager?.FullName
        public string? DirectManager { get; set; }

        // Employee.Status: string (ACTIVE / INACTIVE / ...)
        public string Status { get; set; } = string.Empty;

        // Map từ Employee.Education
        public List<EmployeeEducationDto> Education { get; set; } = new();
    }

    public class EmployeePhoneNumberDto
    {
        // Map từ EmployeePhoneNumber.PhoneNumber
        public string PhoneNumber { get; set; } = string.Empty;

        // Map từ EmployeePhoneNumber.Description (ví dụ: Personal, Relative, Emergency...)
        public string Description { get; set; } = string.Empty;
    }

    public class EmployeeBankAccountDto
    {
        // Map từ EmployeeBankAccount.BankName
        public string BankName { get; set; } = string.Empty;

        // Map từ EmployeeBankAccount.AccountNumber
        public string AccountNumber { get; set; } = string.Empty;

        // Map từ EmployeeBankAccount.IsPrimary
        public bool IsPrimary { get; set; }
    }

    public class EmployeeEducationDto
    {
        // Map từ EmployeeEducation.Degree
        public string Degree { get; set; } = string.Empty;

        // Map từ EmployeeEducation.Major
        public string Major { get; set; } = string.Empty;

        // Map từ EmployeeEducation.University
        public string University { get; set; } = string.Empty;

        // Map từ EmployeeEducation.GraduationYear
        public int GraduationYear { get; set; }

        // Map từ EmployeeEducation.OtherCertificates
        public string? OtherCertificates { get; set; }
    }

    public class ProfileUpdateHistoryDto
    {
        public int Id { get; set; }

        // Map từ ProfileUpdateHistory.RequestDate
        public DateTime RequestDate { get; set; }

        // Map từ ProfileUpdateHistory.Status (Pending/Approved/Rejected)
        public string Status { get; set; } = string.Empty;

        // Map từ ProfileUpdateHistory.ReviewedBy (tên manager/HR)
        public string? ReviewedBy { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public string? RejectReason { get; set; }

        public string? Comment { get; set; }
    }

    // Dùng khi employee gửi request cập nhật profile
    public class ProfileUpdateRequestCreateDto
    {
        public string Reason { get; set; } = string.Empty;
        public List<ProfileUpdateRequestDetailCreateDto> Details { get; set; } = new();
    }

    public class ProfileUpdateRequestDetailCreateDto
    {
        // Tên field được chỉnh (vd: "CurrentAddress", "PhoneNumber", "MaritalStatus")
        public string FieldName { get; set; } = string.Empty;

        // Giá trị cũ (server fill), FE có thể không gửi
        [JsonPropertyName("oldValue")] 
        public string? OldValue { get; set; }

        // Giá trị mới mà user muốn đổi
        public string NewValue { get; set; } = string.Empty;
    }
}
