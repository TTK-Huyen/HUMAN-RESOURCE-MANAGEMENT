package com.hrm.notificationservice.repo;

import com.hrm.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);
  long countByUserIdAndIsReadFalse(Integer userId);

  @Modifying
  @Transactional
  @Query("update Notification n set n.isRead = true where n.id = :id and n.userId = :userId")
  int markAsRead(Long id, Integer userId);
}
