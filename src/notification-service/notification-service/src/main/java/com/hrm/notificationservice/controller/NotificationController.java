package com.hrm.notificationservice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

import com.hrm.notificationservice.repo.NotificationRepository;
import com.hrm.notificationservice.entity.Notification;

@RestController
@RequestMapping("/api/v1")
public class NotificationController {

  @Value("${notification.internalApiKey}")
  private String internalApiKey;

  private final NotificationRepository repo;

  public NotificationController(NotificationRepository repo) {
    this.repo = repo;
  }
  @PostMapping("/notifications/events")
  public ResponseEntity<?> ingest(
      @RequestHeader(value = "X-Internal-Key", required = false) String key,
      @RequestBody Map<String, Object> e
  ) {
    System.out.println("EVENT IN FROM .NET: " + e); 
    if (key == null || !key.equals(internalApiKey)) {
      return ResponseEntity.status(401).body("Unauthorized");
    }

    Integer requesterUserId = asInt(getAny(e, "requesterUserId", "RequesterUserId"));
    Integer managerUserId   = asInt(getAny(e, "managerUserId", "ManagerUserId"));
    String eventType        = asStr(getAny(e, "eventType", "EventType"));


    if ("REQUEST_CREATED".equalsIgnoreCase(eventType)) {
      if (managerUserId != null) add(managerUserId, e);
    } else {
      if (requesterUserId != null) add(requesterUserId, e);
      if (managerUserId != null) add(managerUserId, e);
    }

    return ResponseEntity.accepted().build();
  }

  @GetMapping("/users/{userId}/notifications")
  public List<Notification> get(@PathVariable Integer userId) {
    return repo.findByUserIdOrderByCreatedAtDesc(userId);
  }

  @GetMapping("/users/{userId}/notifications/unread-count")
  public Map<String, Object> unreadCount(@PathVariable Integer userId) {
    long count = repo.countByUserIdAndIsReadFalse(userId);
    return Map.of("userId", userId, "unreadCount", count);
  }

  @PatchMapping("/users/{userId}/notifications/{id}/read")
  public ResponseEntity<?> markRead(@PathVariable Integer userId, @PathVariable Long id) {
    int updated = repo.markAsRead(id, userId);
    if (updated == 0) {
      return ResponseEntity.status(404).body("Notification not found for this user");
    }
    return ResponseEntity.noContent().build();
  }


  private void add(Integer userId, java.util.Map<String, Object> e) {
    if (userId == null) return;

    Notification n = new Notification();
    n.setUserId(userId);

    n.setEventId(asStr(getAny(e, "eventId", "EventId")));
    n.setEventType(asStr(getAny(e, "eventType", "EventType")));
    n.setRequestType(asStr(getAny(e, "requestType", "RequestType")));
    n.setRequestId(asInt(getAny(e, "requestId", "RequestId")));
    n.setStatus(asStr(getAny(e, "status", "Status")));
    n.setMessage(asStr(getAny(e, "message", "Message")));

    // createdAt nếu muốn lấy từ payload:
    // var createdAt = asStr(getAny(e, "createdAt", "CreatedAt"));
    // if (createdAt != null) n.setCreatedAt(Instant.parse(createdAt));

    repo.save(n);
  }

  private Object getAny(Map<String, Object> m, String... keys) {
    // match exact keys first
    for (String k : keys) {
      if (m.containsKey(k)) return m.get(k);
    }
    // fallback: match case-insensitive
    for (var entry : m.entrySet()) {
      String mk = entry.getKey();
      if (mk == null) continue;
      for (String k : keys) {
        if (mk.equalsIgnoreCase(k)) return entry.getValue();
      }
    }
    return null;
  }
  private static Integer asInt(Object v) {
    if (v == null) return null;
    if (v instanceof Number n) return n.intValue();
    try { return Integer.parseInt(v.toString()); } catch (Exception ex) { return null; }
  }

  private static String asStr(Object v) {
    return v == null ? null : v.toString();
  }
}
