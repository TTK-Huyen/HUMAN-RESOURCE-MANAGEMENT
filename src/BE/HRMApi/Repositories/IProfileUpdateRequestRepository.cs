using HrmApi.Dtos;
using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IProfileUpdateRequestRepository
    {
        Task<List<ProfileUpdateRequest>> SearchAsync(RequestFilterDto filter);
        Task<ProfileUpdateRequest?> FindByIdWithDetailsAsync(long id);
        Task UpdateStatusAsync(int id, string newStatus, string? reason, int hrId);
        void Add(ProfileUpdateRequest request);
        Task<int> SaveChangesAsync();
    }
}
