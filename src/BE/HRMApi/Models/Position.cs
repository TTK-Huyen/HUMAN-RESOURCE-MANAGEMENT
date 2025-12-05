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

        [Column("level")]
        public string? Level { get; set; }

        // Navigation 1 - many
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
