using System.Collections.Generic;
using System.Threading.Tasks;
using HrmApi.Models;

namespace HrmApi.Repositories
{
    // Abstraction để tầng trên phụ thuộc vào
    public interface IDepartmentRepository
    {
        Task<IReadOnlyCollection<Department>> GetAllAsync();
    }
}
