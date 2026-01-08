namespace HrmApi.Messaging
{
    public interface IEventBus
    {
        Task PublishAsync<T>(T @event, string routingKey, CancellationToken ct = default);
    }
}
