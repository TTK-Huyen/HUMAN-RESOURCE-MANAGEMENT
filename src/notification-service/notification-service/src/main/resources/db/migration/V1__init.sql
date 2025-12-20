CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,

  event_id VARCHAR(64) NULL,
  event_type VARCHAR(64) NULL,
  request_type VARCHAR(64) NULL,
  request_id INT NULL,

  status VARCHAR(32) NULL,
  message VARCHAR(1000) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT(1) NOT NULL DEFAULT 0,

  PRIMARY KEY (id)
);

CREATE INDEX idx_notifications_user_created
ON notifications(user_id, created_at);
