using HrmApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/employees")]
    public class EmployeeExcelController : ControllerBase
    {
        private readonly IExcelImportService _excelImportService;

        public EmployeeExcelController(IExcelImportService excelImportService)
        {
            _excelImportService = excelImportService;
        }

        /// <summary>
        /// Import danh sách nhân viên từ file Excel
        /// Nếu mã nhân viên đã tồn tại thì sẽ cập nhật thông tin
        /// </summary>
        [HttpPost("import-excel")]
        public async Task<IActionResult> ImportEmployeesFromExcel(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "File không được để trống" });

                var result = await _excelImportService.ImportEmployeesFromExcelAsync(file);
                
                if (result.Errors.Any() && result.ProcessedRows == 0)
                    return BadRequest(new { message = "Không thể xử lý file", errors = result.Errors });

                return Ok(new
                {
                    message = "Import successful",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        /// <summary>
        /// Download template Excel để import nhân viên
        /// </summary>
        [HttpGet("excel-template")]
        public async Task<IActionResult> DownloadExcelTemplate()
        {
            try
            {
                var templateBytes = await _excelImportService.GenerateExcelTemplateAsync();
                var fileName = $"Employee_Import_Template_{DateTime.Now:yyyyMMdd}.xlsx";
                
                return File(templateBytes, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi tạo template: " + ex.Message });
            }
        }

        /// <summary>
        /// Validate file Excel trước khi import
        /// </summary>
        [HttpPost("validate-excel")]
        public IActionResult ValidateExcelFile(IFormFile file)
        {
            try
            {
                var (isValid, error) = _excelImportService.ValidateExcelFile(file);
                
                if (!isValid)
                    return BadRequest(new { message = error, isValid = false });

                return Ok(new { message = "File hợp lệ", isValid = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi validate file: " + ex.Message });
            }
        }
    }
}
