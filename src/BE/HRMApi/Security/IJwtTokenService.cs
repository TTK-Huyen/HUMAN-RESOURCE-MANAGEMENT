namespace HrmApi.Security
{
    public interface IJwtTokenService
    {
        string GenerateToken(string employeeCode, string roleCode);
    }
}
