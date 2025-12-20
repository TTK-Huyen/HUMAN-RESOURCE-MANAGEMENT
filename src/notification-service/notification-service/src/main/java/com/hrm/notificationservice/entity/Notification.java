package com.hrm.notificationservice.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Integer userId;

  @Column(name = "event_id")
  private String eventId;

  @Column(name = "event_type")
  private String eventType;

  @Column(name = "request_type")
  private String requestType;

  @Column(name = "request_id")
  private Integer requestId;

  @Column(name = "status")
  private String status;

  @Column(name = "message", length = 1000)
  private String message;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "is_read", nullable = false)
  private Boolean isRead = false;

  public Long getId() { return id; }

  public Integer getUserId() { return userId; }
  public void setUserId(Integer userId) { this.userId = userId; }

  public String getEventId() { return eventId; }
  public void setEventId(String eventId) { this.eventId = eventId; }

  public String getEventType() { return eventType; }
  public void setEventType(String eventType) { this.eventType = eventType; }

  public String getRequestType() { return requestType; }
  public void setRequestType(String requestType) { this.requestType = requestType; }

  public Integer getRequestId() { return requestId; }
  public void setRequestId(Integer requestId) { this.requestId = requestId; }

  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }

  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

  public Boolean getIsRead() { return isRead; }
  public void setIsRead(Boolean read) { isRead = read; }
}
