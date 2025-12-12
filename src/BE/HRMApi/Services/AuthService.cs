using HrmApi.Dtos.Auth;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Security;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HrmApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserAccountRepository _userAccountRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthService(
            IUserAccountRepository userAccountRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenService jwtTokenService)
        {
            _userAccountRepository = userAccountRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto requestDto)
        {
            var userAccount = await _userAccountRepository.FindAccountByUsernameAsync(requestDto.Username);
            if (userAccount == null || userAccount.Status != AccountStatus.ACTIVE)
                return null;

            var isPasswordValid = _passwordHasher.VerifyPassword(userAccount.PasswordHash, requestDto.Password);
            if (!isPasswordValid)
                return null;

            var token = _jwtTokenService.GenerateToken(
                userAccount.Employee.EmployeeCode,
                userAccount.Role.RoleCode
            );

            return new LoginResponseDto
            {
                Token = token,
                EmployeeCode = userAccount.Employee.EmployeeCode,
                EmployeeName = userAccount.Employee.EmployeeName,
                Role = userAccount.Role.RoleCode
            };
        }

        public async Task<bool> RegisterAsync(RegisterRequestDto requestDto)
        {
            // Validate password
            if (string.IsNullOrWhiteSpace(requestDto.Password)
                || requestDto.Password.Length < 8
                || !requestDto.Password.Any(char.IsUpper)
                || !requestDto.Password.Any(char.IsLower)
                || !requestDto.Password.Any(char.IsDigit)
                || !requestDto.Password.Any(ch => !char.IsLetterOrDigit(ch)))
            {
                throw new ArgumentException("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.");
            }

            // Kiểm tra username đã tồn tại chưa
            var existing = await _userAccountRepository.FindAccountByUsernameAsync(requestDto.Username);
            if (existing != null) return false;

            // Tạo UserAccount mới
            var user = new UserAccount
            {
                Username = requestDto.Username,
                PasswordHash = _passwordHasher.HashPassword(requestDto.Password), // Hash password thật
                EmployeeId = requestDto.EmployeeId,
                RoleId = requestDto.RoleId,
                Status = AccountStatus.ACTIVE,
                LastLoginAt = null
            };
            await _userAccountRepository.AddAsync(user);
            return true;
        }

        public async Task<IEnumerable<UserAccountListItemDto>> GetAllAccountsAsync()
        {
            var accounts = await _userAccountRepository.GetAllAccountsAsync();
            return accounts.Select(a => new UserAccountListItemDto
            {
                UserId = a.UserId,
                Username = a.Username,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee?.EmployeeName,
                RoleId = a.RoleId,
                RoleCode = a.Role?.RoleCode,
                RoleName = a.Role?.RoleName,
                Status = a.Status.ToString(),
                LastLoginAt = a.LastLoginAt,
                PasswordHash = a.PasswordHash // Trả về password hash
            });
        }
    }
}