using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class ResignationRequestRepository : IResignationRequestRepository
    {
        private readonly AppDbContext _context;

        public ResignationRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(ResignationRequest request)
        {
            await _context.ResignationRequests.AddAsync(request);
        }

        public Task SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }

        // --- IMPLEMENT HÀM MỚI ---
        public async Task<ResignationRequest?> GetResignationRequestByIdAsync(int requestId)
        {
            return await _context.ResignationRequests
                // Join bảng Request cha
                .Include(r => r.Request)
                // Join thông tin nhân viên
                .Include(r => r.Employee)
                    .ThenInclude(e => e.Department) // Lấy tên phòng ban
                .Include(r => r.Employee)
                    .ThenInclude(e => e.JobTitle)   // Lấy chức vụ
                .FirstOrDefaultAsync(r => r.Id == requestId);
        }
    }
}