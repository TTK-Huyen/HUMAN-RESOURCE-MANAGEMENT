using System.Text;
using System.Text.Json;
using HrmApi.Events.Requests;
using HrmApi.Services.Notifications;
using HrmApi.Dtos.Notifications;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using HrmApi.Messaging.RabbitMq;

namespace HrmApi.Consumers.Requests
{
    public class RequestSubmittedNotificationConsumer : BackgroundService
    {
        private readonly RabbitMqOptions _opt;
        private readonly IServiceProvider _sp;

        private IConnection? _conn;
        private IModel? _channel;

        private const string QueueName = "hrm.request.submitted.noti";
        private const string RoutingKey = "request.submitted.*"; // request.submitted.LEAVE ...

        public RequestSubmittedNotificationConsumer(
            IOptions<RabbitMqOptions> opt,
            IServiceProvider sp)
        {
            _opt = opt.Value;
            _sp = sp;
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            var factory = new ConnectionFactory
            {
                HostName = _opt.HostName,
                Port = _opt.Port,
                UserName = _opt.UserName,
                Password = _opt.Password,
                DispatchConsumersAsync = true
            };

            _conn = factory.CreateConnection();
            _channel = _conn.CreateModel();

            _channel.ExchangeDeclare(_opt.Exchange, _opt.ExchangeType, durable: true);

            _channel.QueueDeclare(
                queue: QueueName,
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            _channel.QueueBind(
                queue: QueueName,
                exchange: _opt.Exchange,
                routingKey: RoutingKey
            );

            // tránh bắn dồn
            _channel.BasicQos(0, prefetchCount: 10, global: false);

            return base.StartAsync(cancellationToken);
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var consumer = new AsyncEventingBasicConsumer(_channel!);

            consumer.Received += async (_, ea) =>
            {
                try
                {
                    var json = Encoding.UTF8.GetString(ea.Body.ToArray());
                    var ev = JsonSerializer.Deserialize<RequestSubmittedEvent>(json);

                    if (ev == null)
                    {
                        _channel!.BasicAck(ea.DeliveryTag, multiple: false);
                        return;
                    }

                    // resolve scoped services (NotificationPublisher dùng HttpClient DI)
                    using var scope = _sp.CreateScope();
                    var publisher = scope.ServiceProvider.GetRequiredService<INotificationPublisher>();

                    await publisher.PublishAsync(new NotificationEventDto
                    {
                        EventType = "REQUEST_CREATED",
                        RequestType = ev.RequestType,
                        RequestId = ev.RequestId,
                        ActorUserId = ev.ActorUserId,
                        ActorName = ev.ActorName,
                        RequesterUserId = ev.ActorUserId,
                        RequesterEmail = ev.RequesterEmail,
                        ManagerUserId = ev.ManagerUserId,
                        ManagerEmail = ev.ManagerEmail,
                        Status = ev.Status,
                        Message = ev.Message
                    });

                    _channel!.BasicAck(ea.DeliveryTag, multiple: false);
                }
                catch
                {
                    // Hướng A: tối thiểu -> NACK để RabbitMQ requeue.
                    // (Sau này Hướng B mới làm retry/DLQ chuẩn)
                    _channel!.BasicNack(ea.DeliveryTag, multiple: false, requeue: true);
                }
            };

            _channel!.BasicConsume(queue: QueueName, autoAck: false, consumer: consumer);
            return Task.CompletedTask;
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _channel?.Close();
            _conn?.Close();
            return base.StopAsync(cancellationToken);
        }
    }
}
