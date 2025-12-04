// IResignationRequestService.cs
using HrmApi.Dtos.Requests;

namespace HrmApi.Services
{
    public interface IResignationRequestService
    {
        Task<ResignationRequestCreatedDto> CreateAsync(string employeeCode, CreateResignationRequestDto dto);
    }
}
