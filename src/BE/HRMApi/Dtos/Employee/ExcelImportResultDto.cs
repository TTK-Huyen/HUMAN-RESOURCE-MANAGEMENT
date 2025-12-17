namespace HrmApi.Dtos.Employee
{
    public class ExcelImportResultDto
    {
        public int TotalRows { get; set; }
        public int ProcessedRows { get; set; }
        public int CreatedCount { get; set; }
        public int UpdatedCount { get; set; }
        public int SkippedCount { get; set; }
        public List<ExcelImportErrorDto> Errors { get; set; } = new List<ExcelImportErrorDto>();
        public List<string> Warnings { get; set; } = new List<string>();
    }

    public class ExcelImportErrorDto
    {
        public int Row { get; set; }
        public string? EmployeeCode { get; set; }
        public string Error { get; set; } = string.Empty;
        public string? Field { get; set; }
    }
}
