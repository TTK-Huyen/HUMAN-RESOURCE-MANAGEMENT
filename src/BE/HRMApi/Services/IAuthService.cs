// File: Services/IAuthService.cs

using HrmApi.Dtos.Auth;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace HrmApi.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto requestDto);
        Task<bool> RegisterAsync(RegisterRequestDto requestDto);
        Task<IEnumerable<UserAccountListItemDto>> GetAllAccountsAsync();
    }
}