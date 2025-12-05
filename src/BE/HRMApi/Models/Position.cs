using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("positions")]
    public class JobTitle
    {
        [Key]
        [Column("position_id")]
        public int Id { get; set; } 

        [Column("position_name")]
        public string Title { get; set; } = default!;
        
        // level
        public string? Level { get; set; } // Nullable
        public int PositionId { get; set; }
        public string PositionName { get; set; } = ""; 
        // Navigation Property: Mối quan hệ 1-nhiều với Employee
        // Một JobTitle (Position) có nhiều Employees
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
