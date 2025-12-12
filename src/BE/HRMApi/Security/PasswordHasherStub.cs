using HrmApi.Security;

namespace HrmApi.Security
{
    public class PasswordHasherStub : IPasswordHasher
    {
        public bool VerifyPassword(string hash, string password) => hash == password;

        public string HashPassword(string password)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(password);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
