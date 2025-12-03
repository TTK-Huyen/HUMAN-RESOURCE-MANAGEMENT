namespace HrmApi.Models
{
    // Ánh xạ đến bảng 'positions'
    public class JobTitle
    {
        // Khóa chính: position_id
        public int Id { get; set; } 
        
        // position_name
        public string Title { get; set; } = default!;
        
        // level
        public string? Level { get; set; } // Nullable

        // Navigation Property: Mối quan hệ 1-nhiều với Employee
        // Một JobTitle (Position) có nhiều Employees
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}