using System;
using System.Collections.Generic;

namespace HrmApi.Models
{
    public class Employee
    {
        public int Id { get; set; }                          // PK
        public string EmployeeCode { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public DateTime DateOfBirth { get; set; }
        public string CompanyEmail { get; set; } = default!;
        public string PersonalEmail { get; set; } = default!;
        public string Department { get; set; } = default!;
        public string JobTitle { get; set; } = default!;
        public string Status { get; set; } = "Active";       // Working / Inactive

        // Navigation (1-n)
        public ICollection<LeaveRequest> LeaveRequests { get; set; } 
            = new List<LeaveRequest>();

        public ICollection<OvertimeRequest> OvertimeRequests { get; set; } 
            = new List<OvertimeRequest>();

        public ICollection<ResignationRequest> ResignationRequests { get; set; } 
            = new List<ResignationRequest>();
    }
}
