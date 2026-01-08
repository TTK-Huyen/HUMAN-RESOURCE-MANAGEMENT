using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace HrmApi.Messaging.RabbitMq
{
    public class RabbitMqEventBus : IEventBus
    {
        private readonly RabbitMqOptions _opt;

        public RabbitMqEventBus(IOptions<RabbitMqOptions> opt)
        {
            _opt = opt.Value;
        }

        public Task PublishAsync<T>(T @event, string routingKey, CancellationToken ct = default)
        {
            var factory = new ConnectionFactory
            {
                HostName = _opt.HostName,
                Port = _opt.Port,
                UserName = _opt.UserName,
                Password = _opt.Password,
                DispatchConsumersAsync = true
            };

            using var conn = factory.CreateConnection();
            using var channel = conn.CreateModel();

            channel.ExchangeDeclare(exchange: _opt.Exchange, type: _opt.ExchangeType, durable: true);

            var json = JsonSerializer.Serialize(@event);
            var body = Encoding.UTF8.GetBytes(json);

            var props = channel.CreateBasicProperties();
            props.Persistent = true;

            channel.BasicPublish(
                exchange: _opt.Exchange,
                routingKey: routingKey,
                basicProperties: props,
                body: body
            );

            return Task.CompletedTask;
        }
    }
}
