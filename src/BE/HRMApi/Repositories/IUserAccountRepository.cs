// File: Repositories/IUserAccountRepository.cs

using HrmApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HrmApi.Repositories 
{
    public interface IUserAccountRepository
    {
        Task<UserAccount?> FindAccountByUsernameAsync(string username);
        Task AddAsync(UserAccount userAccount);
        Task<List<UserAccount>> GetAllAccountsAsync();
    }
}