using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HrmApi.Security
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _config;
        public JwtTokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(string employeeCode, string roleCode)
        {
            var jwtSection = _config.GetSection("Jwt");
            var key = _config["Jwt:Secret"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLongForHS256";    
            var issuer = _config["Jwt:Issuer"] ?? "HRMApi";
            var audience = _config["Jwt:Audience"] ?? "HRMClient";
            var expires = DateTime.UtcNow.AddHours(8);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, employeeCode),
                new Claim(ClaimTypes.Role, roleCode),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var keyBytes = Encoding.UTF8.GetBytes(key);
            var creds = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}