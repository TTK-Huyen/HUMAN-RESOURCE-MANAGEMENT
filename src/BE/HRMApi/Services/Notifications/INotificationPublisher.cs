using HrmApi.Dtos.Notifications;

namespace HrmApi.Services.Notifications
{
    public interface INotificationPublisher
    {
        Task PublishAsync(NotificationEventDto dto);
    }
}
