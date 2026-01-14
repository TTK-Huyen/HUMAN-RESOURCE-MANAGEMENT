using System.Text;
using System.Text.Json;
using HrmApi.Dtos.Notifications;

namespace HrmApi.Services.Notifications
{
    public class NotificationPublisher : INotificationPublisher
    {
        private readonly HttpClient _client;
        private readonly IConfiguration _config;

        public NotificationPublisher(HttpClient client, IConfiguration config)
        {
            _client = client;
            _config = config;
        }

        public async Task PublishAsync(NotificationEventDto dto)
        {
            try
            {
                var baseUrl = _config["Notification:BaseUrl"];
                var key = _config["Notification:InternalKey"];

                var json = JsonSerializer.Serialize(dto);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _client.DefaultRequestHeaders.Clear();
                _client.DefaultRequestHeaders.Add("X-Internal-Key", key);

                await _client.PostAsync($"{baseUrl}/api/v1/notifications/events", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NotificationPublisher] Failed: {ex.Message}");
            }
        }
    }
}
