using HrmApi.Dtos;
using HrmApi.Models;
using HrmApi.Repositories;
using System.Text.RegularExpressions;

namespace HrmApi.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly ICampaignRepository _repo;

        public CampaignService(ICampaignRepository repo)
        {
            _repo = repo;
        }

        // UC 3.1: Add Campaign
        public async Task<CampaignResponseDto> CreateCampaignAsync(CampaignCreateDto dto)
        {
            // 1. Validate: Ngày thông báo phải trước ngày bắt đầu 3 ngày
            if (dto.AnnouncementDate.HasValue)
            {
                if ((dto.StartDate - dto.AnnouncementDate.Value).TotalDays < 3)
                {
                    throw new ArgumentException("Announcement Date must be at least 3 days prior to the Start Date.");
                }
            }

            // 2. Validate: Tên không trùng trong năm
            bool exists = await _repo.ExistsByNameAndYearAsync(dto.CampaignName, dto.StartDate.Year);
            if (exists)
            {
                throw new ArgumentException("The Campaign Name must be unique within the same year.");
            }

            // 3. Sinh mã Code tự động (Logic: Lấy mã cũ + 1)
            string nextCode = await GenerateNextCode();

            // 4. Tạo Entity
            var campaign = new Campaign
            {
                CampaignCode = nextCode,
                CampaignName = dto.CampaignName,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                AnnouncementDate = dto.AnnouncementDate,
                RewardsDescription = dto.RewardDescription,
                CreatedById = dto.CreatedBy,
                MaxParticipants = dto.MaxParticipants,
                Status = CampaignStatus.PENDING, // Mặc định là Pending
                CurrentParticipants = 0,
                CreatedAt = DateTime.Now
            };

            await _repo.AddAsync(campaign);

            return new CampaignResponseDto
            {
                CampaignCode = nextCode,
                Status = "Pending",
                Message = "Campaign created successfully pending approval."
            };
        }

        // UC 3.11: Delete Campaign
        public async Task<CampaignResponseDto> DeleteCampaignAsync(string campaignCode)
        {
            var campaign = await _repo.GetByCodeAsync(campaignCode);
            if (campaign == null) 
                throw new KeyNotFoundException("Campaign not found.");

            // Chỉ xóa được nếu là Pending, Draft hoặc Rejected
            // Không xóa được nếu Active (Upcoming), Ongoing, Finished
            if (campaign.Status == CampaignStatus.UPCOMING || 
                campaign.Status == CampaignStatus.ONGOING || 
                campaign.Status == CampaignStatus.FINISHED)
            {
                // Logic trả về lỗi nghiệp vụ (không throw exception để controller trả về message nhẹ nhàng)
                return new CampaignResponseDto 
                { 
                    CampaignCode = campaignCode,
                    Status = campaign.Status.ToString(),
                    ErrorCode = "CAMPAIGN_NOT_DELETABLE",
                    Message = "Cannot delete a campaign that is active or has participants." 
                };
            }

            // Soft Delete -> Đổi status thành DELETED
            campaign.Status = CampaignStatus.DELETED;
            await _repo.SaveChangesAsync();

            return new CampaignResponseDto
            {
                CampaignCode = campaign.CampaignCode,
                Status = "Deleted",
                Message = "Campaign deleted successfully."
            };
        }

        // Hàm phụ: Sinh mã Code (CAM001, CAM002...)
        private async Task<string> GenerateNextCode()
        {
            var latest = await _repo.GetLatestCampaignAsync();
            if (latest == null) return "CAM001";

            // Tách số từ mã cũ (VD: CAM015 -> lấy 15)
            var match = Regex.Match(latest.CampaignCode, @"\d+");
            if (match.Success)
            {
                int num = int.Parse(match.Value);
                return "CAM" + (num + 1).ToString("D3"); // D3 là format 3 chữ số (001)
            }
            return "CAM001"; // Fallback
        }
    }
}