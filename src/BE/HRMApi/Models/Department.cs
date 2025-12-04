namespace HrSystem.Models
{
    public class Department
    {
        public int DepartmentId { get; set; }
        public string DepartmentCode { get; set; } = null!;
        public string DepartmentName { get; set; } = null!;

        public ICollection<Employee> Employees { get; set; }
            = new List<Employee>();
    }
}
