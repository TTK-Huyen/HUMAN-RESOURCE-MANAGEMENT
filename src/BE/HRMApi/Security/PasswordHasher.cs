using System.Security.Cryptography;
using System.Text;

namespace HrmApi.Security
{
    public class PasswordHasher : IPasswordHasher
    {
        // Hash password using SHA256 (for demo; use BCrypt/Argon2 in production)
        public string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public bool VerifyPassword(string hash, string password)
        {
            var hashedInput = HashPassword(password);
            return hash == hashedInput;
        }
    }
}
