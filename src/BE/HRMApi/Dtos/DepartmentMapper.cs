using System.Collections.Generic;
using System.Linq;
using HrmApi.Dtos;
using HrmApi.Models;

namespace HrmApi.Dtos.Mappers
{
    public static class DepartmentMapper
    {
        public static DepartmentDto ToDto(this Department entity)
        {
            if (entity == null) return null;

            return new DepartmentDto
            {
                Id = entity.Id,
                Name = entity.Name
            };
        }

        public static IReadOnlyCollection<DepartmentDto> ToDtos(
            this IEnumerable<Department> entities)
        {
            return entities?.Select(e => e.ToDto()).ToList();
        }
    }
}
