-- Support Ticket & SLA Tracking System — Schema
-- Run: mysql -u root -p support_tickets < schema.sql

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sla_events;
DROP TABLE IF EXISTS ticket_comments;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS agents;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE agents (
  id         INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)     NOT NULL,
  email      VARCHAR(150)     NOT NULL UNIQUE,
  created_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject           VARCHAR(255) NOT NULL,
  description       TEXT,
  priority          ENUM('low','medium','high','urgent') NOT NULL,
  status            ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  assigned_agent_id INT UNSIGNED NULL,
  sla_due_at        DATETIME     NOT NULL,
  is_escalated      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_ticket_agent
    FOREIGN KEY (assigned_agent_id) REFERENCES agents(id)
    ON DELETE SET NULL
);

CREATE TABLE ticket_comments (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id  INT UNSIGNED NOT NULL,
  author     VARCHAR(100) NOT NULL,
  message    TEXT         NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_comment_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    ON DELETE CASCADE
);

CREATE TABLE sla_events (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id  INT UNSIGNED NOT NULL,
  event_type ENUM('warning','breached','escalated') NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_slaevent_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    ON DELETE CASCADE
);

-- Indexes
-- Cron job: fetch open/in_progress tickets scanned by sla_due_at
CREATE INDEX idx_tickets_status_sla      ON tickets (status, sla_due_at);

-- Ticket list API: filter by status + priority
CREATE INDEX idx_tickets_status_priority ON tickets (status, priority);

-- Subject search
CREATE INDEX idx_tickets_subject         ON tickets (subject);

-- Idempotency check: does a warning/breach event exist for this ticket?
CREATE INDEX idx_slaevents_ticket_type   ON sla_events (ticket_id, event_type);
