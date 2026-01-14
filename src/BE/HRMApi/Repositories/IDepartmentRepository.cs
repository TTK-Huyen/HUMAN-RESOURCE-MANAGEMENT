using System.Collections.Generic;
using System.Threading.Tasks;
using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IDepartmentRepository
    {
        Task<IReadOnlyCollection<Department>> GetAllAsync();
    }
}
