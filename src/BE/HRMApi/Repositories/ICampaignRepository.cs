using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface ICampaignRepository
    {
        // Tìm campaign mới nhất để tính toán mã code tiếp theo (VD: CAM001 -> CAM002)
        Task<Campaign?> GetLatestCampaignAsync();
        
        // Kiểm tra tên có trùng trong năm không
        Task<bool> ExistsByNameAndYearAsync(string name, int year);
        
        // Thêm mới vào DB
        Task AddAsync(Campaign campaign);
        
        // Tìm theo mã code (để xóa)
        Task<Campaign?> GetByCodeAsync(string code);
        
        Task UpdateAsync(Campaign campaign);
        // Lưu thay đổi (dùng cho xóa/update)
        Task SaveChangesAsync();
        Task<List<Campaign>> GetCampaignsAsync();
    }
}