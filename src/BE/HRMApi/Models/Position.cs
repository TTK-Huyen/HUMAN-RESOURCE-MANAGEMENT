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
        
        // Giữ lại nếu DB có cột 'level', nếu không thì xóa hoặc thêm [NotMapped]
        [Column("level")]
        public string? Level { get; set; } 

        // --- CÁC DÒNG GÂY LỖI ĐÃ ĐƯỢC XỬ LÝ ---
        // Đã xóa PositionId và PositionName vì Id và Title đã đảm nhận vai trò này.
        
        // Navigation Property
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}