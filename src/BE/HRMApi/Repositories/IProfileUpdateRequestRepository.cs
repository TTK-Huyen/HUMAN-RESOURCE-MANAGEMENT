using HrSystem.Dtos;
using HrSystem.Models;

namespace HrSystem.Repositories
{
    public interface IProfileUpdateRequestRepository
    {
        Task<List<ProfileUpdateRequest>> SearchAsync(RequestFilterDto filter);
        Task<ProfileUpdateRequest?> FindByIdWithDetailsAsync(long id);
        Task UpdateStatusAsync(int id, string newStatus, string? reason, int hrId);
    }
}
