// File: Repositories/IUserAccountRepository.cs

using HrmApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
// Sử dụng entity

namespace HrmApi.Repositories // Đặt trong namespace chung cho Repository Interfaces
{
    public interface IUserAccountRepository
    {
        Task<UserAccount?> FindAccountByUsernameAsync(string username);
        Task AddAsync(UserAccount userAccount);
        Task<List<UserAccount>> GetAllAccountsAsync();
    }
}