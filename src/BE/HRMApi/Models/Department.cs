namespace HrmApi.Models
{
    // Ánh xạ đến bảng 'departments'
    public class Department
    {
        // Khóa chính: department_id
        public int Id { get; set; } 
        
        // department_code
        public string DepartmentCode { get; set; } = default!;
        
        // department_name
        public string Name { get; set; } = default!;

        // Navigation Property: Mối quan hệ 1-nhiều với Employee
        // Một Department có nhiều Employees
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
