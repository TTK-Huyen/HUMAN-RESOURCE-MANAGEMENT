// File: Repositories/UserAccountRepository.cs

using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HrmApi.Repositories
{
    public class UserAccountRepository : IUserAccountRepository
    {
        private readonly AppDbContext _context;

        public UserAccountRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserAccount?> FindAccountByUsernameAsync(string username)
        {
            return await _context.UserAccounts
                .Include(ua => ua.Employee)
                .Include(ua => ua.Role)
                .FirstOrDefaultAsync(ua => ua.Username == username);
        }

        public async Task AddAsync(UserAccount userAccount)
        {
            _context.UserAccounts.Add(userAccount);
            await _context.SaveChangesAsync();
        }

        public async Task<List<UserAccount>> GetAllAccountsAsync()
        {
            return await _context.UserAccounts
                .Include(u => u.Employee)
                .Include(u => u.Role)
                .ToListAsync();
        }
    }
}