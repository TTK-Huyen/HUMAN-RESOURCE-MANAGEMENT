using HrmApi.Dtos.Reward;

namespace HrmApi.Services
{
    public interface IRewardService
    {
        Task GivePointsAsync(string managerId, GivePointsRequestDto request);
    }
}