namespace HrSystem.Models
{
    public class Position
    {
        public int PositionId { get; set; }
        public string PositionName { get; set; } = null!;
        public string? Level { get; set; }

        public ICollection<Employee> Employees { get; set; }
            = new List<Employee>();
    }
}
