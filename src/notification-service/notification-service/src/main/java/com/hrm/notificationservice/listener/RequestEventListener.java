package com.hrm.notificationservice.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import com.hrm.notificationservice.repo.NotificationRepository;
import com.hrm.notificationservice.entity.Notification;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class RequestEventListener {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    public RequestEventListener(NotificationRepository notificationRepository, ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "${rabbitmq.queue.requests:request.notifications}")
    public void handleRequestEvent(String message) {
        try {
            System.out.println("EVENT RECEIVED FROM RABBITMQ: " + message);
            
            JsonNode event = objectMapper.readTree(message);
            
            String requestType = getStringValue(event, "RequestType", "requestType");
            Integer requestId = getIntValue(event, "RequestId", "requestId");
            String status = getStringValue(event, "Status", "status");
            String message_text = getStringValue(event, "Message", "message");
            Integer managerUserId = getIntValue(event, "ManagerUserId", "managerUserId");
            Integer requesterUserId = getIntValue(event, "ActorUserId", "actorUserId");
            String eventType = "REQUEST_CREATED";

            // For REQUEST_CREATED, notify only the manager
            if (managerUserId != null && managerUserId > 0) {
                addNotification(managerUserId, eventType, requestType, requestId, status, message_text);
                System.out.println("Notification saved for manager: " + managerUserId);
            } else {
                System.out.println("Warning: No manager found for request " + requestId);
            }
            
        } catch (Exception e) {
            System.err.println("Error processing request event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void addNotification(Integer userId, String eventType, String requestType, 
                                 Integer requestId, String status, String message) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setEventType(eventType);
        notification.setRequestType(requestType);
        notification.setRequestId(requestId);
        notification.setStatus(status);
        notification.setMessage(message);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    private String getStringValue(JsonNode node, String... keys) {
        for (String key : keys) {
            if (node.has(key) && !node.get(key).isNull()) {
                return node.get(key).asText();
            }
        }
        return null;
    }

    private Integer getIntValue(JsonNode node, String... keys) {
        for (String key : keys) {
            if (node.has(key) && !node.get(key).isNull()) {
                try {
                    return node.get(key).asInt();
                } catch (Exception e) {
                    return null;
                }
            }
        }
        return null;
    }
}
