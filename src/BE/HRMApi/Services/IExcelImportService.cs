using HrmApi.Dtos.Employee;

namespace HrmApi.Services
{
    public interface IExcelImportService
    {
        /// <summary>
        /// Import nhân viên từ file Excel
        /// </summary>
        Task<ExcelImportResultDto> ImportEmployeesFromExcelAsync(IFormFile file);
        
        /// <summary>
        /// Download template Excel file
        /// </summary>
        Task<byte[]> GenerateExcelTemplateAsync();
        
        /// <summary>
        /// Validate file Excel
        /// </summary>
        (bool isValid, string error) ValidateExcelFile(IFormFile file);
    }
}
