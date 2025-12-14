using System.Collections.Generic;
using System.Threading.Tasks;
using HrmApi.Dtos;

namespace HrmApi.Services
{
    public interface IDepartmentService
    {
        Task<IReadOnlyCollection<DepartmentDto>> GetAllAsync();
    }
}
