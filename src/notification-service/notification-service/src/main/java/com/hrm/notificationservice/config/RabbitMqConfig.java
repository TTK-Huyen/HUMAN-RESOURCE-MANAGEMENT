package com.hrm.notificationservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitMqConfig {

    @Value("${rabbitmq.exchange:hrm.events}")
    private String exchange;

    @Value("${rabbitmq.queue.requests:request.notifications}")
    private String requestQueue;

    @Value("${rabbitmq.routing-key.request-submitted:request.submitted.#}")
    private String requestSubmittedRoutingKey;

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(exchange, true, false);
    }

    @Bean
    public Queue requestNotificationQueue() {
        return new Queue(requestQueue, true);
    }

    @Bean
    public Binding requestBinding(Queue requestNotificationQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(requestNotificationQueue)
                .to(eventExchange)
                .with(requestSubmittedRoutingKey);
    }
}
