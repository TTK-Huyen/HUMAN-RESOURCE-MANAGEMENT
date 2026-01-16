using HrmApi.Dtos;
using HrmApi.Dtos.Employee;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class ProfileUpdateRequestService : IProfileUpdateRequestService
    {
        private readonly IProfileUpdateRequestRepository _requestRepo;
        private readonly IEmployeeRepository _employeeRepo;

        public ProfileUpdateRequestService(
            IProfileUpdateRequestRepository requestRepo,
            IEmployeeRepository employeeRepo)
        {
            _requestRepo = requestRepo;
            _employeeRepo = employeeRepo;
        }

        // ========= API #1: GET LIST (ĐÃ SỬA: THÊM MAPPING DETAILS) =========
        public async Task<IEnumerable<RequestListItemDto>> SearchAsync(RequestFilterDto filter)
        {
            var requests = await _requestRepo.SearchAsync(filter);

            return requests.Select(r => new RequestListItemDto
            {
                RequestId    = r.UpdateRequestId,
                EmployeeCode = r.Employee.EmployeeCode,
                FullName     = r.Employee.EmployeeName,
                CreatedAt    = r.RequestDate,
                Status       = r.Status,
                ReviewedAt   = r.ReviewedAt,
                Details      = r.Details?.Select(d => new RequestDetailItemDto 
                {
                    FieldName = d.FieldName,
                    OldValue  = d.OldValue,
                    NewValue  = d.NewValue
                }).ToList()
            }).ToList();
        }

        // ========= API #2: GET DETAIL =========
        public async Task<RequestDetailDto> GetDetailAsync(long requestId)
        {
            var request = await _requestRepo.FindByIdWithDetailsAsync(requestId);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            return new RequestDetailDto
            {
                RequestId  = request.UpdateRequestId,
                EmployeeId = request.EmployeeId,
                Status     = request.Status,
                Details    = request.Details.Select(d => new RequestDetailItemDto
                {
                    FieldName = d.FieldName,
                    OldValue  = d.OldValue,
                    NewValue  = d.NewValue
                }).ToList()
            };
        }

        // ========= API #2: GET DETAIL (ENRICHED) =========
        public async Task<ProfileUpdateRequestDetailDto> GetDetailEnrichedAsync(long requestId)
        {
            var request = await _requestRepo.FindByIdWithDetailsAsync(requestId);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            var reviewedByName = string.Empty;
            if (request.ReviewedBy.HasValue)
            {
                var reviewer = await _employeeRepo.FindByIdAsync(request.ReviewedBy.Value);
                reviewedByName = reviewer?.EmployeeName ?? "Unknown";
            }

            return new ProfileUpdateRequestDetailDto
            {
                RequestId      = request.UpdateRequestId,
                EmployeeId     = request.EmployeeId,
                EmployeeCode   = request.Employee?.EmployeeCode ?? string.Empty,
                EmployeeName   = request.Employee?.EmployeeName ?? string.Empty,
                RequestDate    = request.RequestDate,
                Status         = request.Status,
                ReviewedByName = reviewedByName,
                ReviewedAt     = request.ReviewedAt,
                RejectReason   = request.RejectReason,
                Comment        = request.Comment,
                Details        = request.Details.Select(d => new ProfileUpdateRequestDetailItemDto
                {
                    FieldName = d.FieldName,
                    OldValue  = d.OldValue,
                    NewValue  = d.NewValue
                }).ToList()
            };
        }

        // ========= API #3: PATCH STATUS (ĐÃ SỬA: LOGIC UPDATE AN TOÀN) =========
        public async Task<RequestStatusResponseDto> ChangeStatusAsync(
            int hrId,
            long requestId,
            RequestStatusUpdateDto dto)
        {
            var normalizedStatus = dto.NewStatus.ToUpper(); // APPROVED / REJECTED

            if (normalizedStatus != "APPROVED" && normalizedStatus != "REJECTED")
            {
                throw new ArgumentException("new_status is invalid");
            }

            if (normalizedStatus == "REJECTED" &&
                string.IsNullOrWhiteSpace(dto.RejectReason))
            {
                throw new ArgumentException("reject_reason is required when status is REJECTED");
            }

            var request = await _requestRepo.FindByIdWithDetailsAsync(requestId);
            if (request == null)
            {
                throw new KeyNotFoundException("Request not found");
            }

            // NẾU APPROVED THÌ APPLY THAY ĐỔI VÀO EMPLOYEE
            if (normalizedStatus == "APPROVED")
            {
                // [FIX] Cố gắng lấy Employee kèm BankAccounts (nếu Repository hỗ trợ Include thì càng tốt)
                var employee = await _employeeRepo.FindByIdAsync(request.EmployeeId)
                               ?? throw new InvalidOperationException("Employee not found");

                foreach (var d in request.Details)
                {
                    switch (d.FieldName)
                    {
                        // --- Nhóm Thông Tin Liên Hệ ---
                        case "PersonalEmail":
                            employee.PersonalEmail = d.NewValue;
                            break;

                        case "PhoneNumber":
                            // Cập nhật cả field PhoneNumber và PhoneNumbers collection
                            employee.PhoneNumber = d.NewValue;
                            
                            // Cập nhật PhoneNumbers collection nếu có
                            if (employee.PhoneNumbers == null)
                                employee.PhoneNumbers = new List<EmployeePhoneNumber>();
                            
                            // Lấy số điện thoại chính (item đầu tiên hoặc Personal)
                            var primaryPhone = employee.PhoneNumbers
                                .FirstOrDefault(p => p.Description?.ToLower() == "personal")
                                ?? employee.PhoneNumbers.FirstOrDefault();
                            
                            if (primaryPhone != null)
                            {
                                primaryPhone.PhoneNumber = d.NewValue;
                            }
                            else if (!string.IsNullOrWhiteSpace(d.NewValue))
                            {
                                // Tạo mới nếu chưa có
                                employee.PhoneNumbers.Add(new EmployeePhoneNumber
                                {
                                    EmployeeId = employee.Id,
                                    PhoneNumber = d.NewValue,
                                    Description = "Personal"
                                });
                            }
                            break;

                        case "CurrentAddress":
                            employee.CurrentAddress = d.NewValue;
                            break;

                        // --- Nhóm Thông Tin Cá Nhân ---
                        case "MaritalStatus":
                            employee.MaritalStatus = d.NewValue;
                            break;

                        case "Nationality":
                            employee.Nationality = d.NewValue;
                            break;

                        case "HasChildren":
                            if (bool.TryParse(d.NewValue, out bool hasChildren))
                                employee.HasChildren = hasChildren;
                            break;

                        // --- Nhóm Hiệu Đính Pháp Lý ---
                        case "CitizenIdNumber":
                            employee.CitizenIdNumber = d.NewValue;
                            break;

                        case "PersonalTaxCode":
                            employee.PersonalTaxCode = d.NewValue;
                            break;

                        case "SocialInsuranceNumber":
                            employee.SocialInsuranceNumber = d.NewValue;
                            break;

                        // --- Nhóm Tài Khoản Ngân Hàng (Xử lý an toàn null) ---
                        case "BankName":
                        case "BankAccountNumber":
                            if (employee.BankAccounts == null) 
                                employee.BankAccounts = new List<EmployeeBankAccount>();

                            // Tìm account chính hoặc account đầu tiên
                            var bankAcc = employee.BankAccounts.FirstOrDefault(b => b.IsPrimary) 
                                          ?? employee.BankAccounts.FirstOrDefault();

                            // Nếu chưa có account nào, tạo mới và set là Primary
                            if (bankAcc == null)
                            {
                                bankAcc = new EmployeeBankAccount { IsPrimary = true };
                                employee.BankAccounts.Add(bankAcc);
                            }

                            if (d.FieldName == "BankName") bankAcc.BankName = d.NewValue;
                            if (d.FieldName == "BankAccountNumber") bankAcc.AccountNumber = d.NewValue;
                            break;

                        case "DateOfBirth":
                            if (DateTime.TryParse(d.NewValue, out DateTime dob))
                                employee.DateOfBirth = dob;
                            break;

                        case "Gender":
                            employee.Gender = d.NewValue;
                            break;
                    }
                } 
                
                // [QUAN TRỌNG] Lưu thay đổi Employee xuống DB
                // Nếu Repository của bạn có hàm Update, hãy dùng nó.
                // Nếu chỉ có SaveAsync, đảm bảo nó gọi SaveChanges().
                
                // Cách 1: Dùng Update nếu có (Khuyên dùng)
                // _employeeRepo.Update(employee);
                
                // Cách 2: Dùng SaveAsync (như code cũ của bạn)
                await _employeeRepo.SaveAsync(employee);
            }

            // Update trạng thái Request
            var intId = checked((int)requestId);
            await _requestRepo.UpdateStatusAsync(
                intId,
                normalizedStatus,
                dto.RejectReason,
                hrId
            );

            return new RequestStatusResponseDto
            {
                RequestId     = requestId,
                RequestStatus = normalizedStatus
            };
        }
    
        public async Task<bool> SendProfileUpdateRequestAsync(string employeeCode, ProfileUpdateRequestCreateDto dto)
        {
            var employee = await _employeeRepo.GetByCodeAsync(employeeCode);
            if (employee == null) return false;
            
            if (dto.Details == null || !dto.Details.Any()) return false;
            
            foreach (var detail in dto.Details)
            {
                if (string.IsNullOrWhiteSpace(detail.FieldName)) 
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

            await _requestRepo.AddAsync(request);
            return await _requestRepo.SaveChangesAsync();
        }
    }
}