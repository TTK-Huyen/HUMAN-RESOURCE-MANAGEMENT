using HrmApi.Security;

namespace HrmApi.Security
{
    public class JwtTokenServiceStub : IJwtTokenService
    {
        public string GenerateToken(string employeeCode, string roleCode) => "stub-token";
    }
}
