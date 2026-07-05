-- Seed data — run after schema.sql
-- Tickets are deliberately set in the past so the SLA cron fires on them immediately

INSERT INTO agents (name, email) VALUES
  ('Alice Johnson',  'alice@support.com'),
  ('Bob Martinez',   'bob@support.com'),
  ('Carol Singh',    'carol@support.com'),
  ('David Kim',      'david@support.com'),
  ('Eva Patel',      'eva@support.com');

-- NOW() reference for SLA windows:
--   urgent  = 2h,  high = 8h,  medium = 24h,  low = 72h
-- Some tickets are created far enough in the past that they are already breached.

INSERT INTO tickets (subject, description, priority, status, assigned_agent_id, sla_due_at, is_escalated, created_at) VALUES

-- urgent: created 3h ago → sla_due_at 1h ago (BREACHED)
('Login page throws 500 error',
 'Users cannot log in. Getting internal server error on /auth/login.',
 'urgent', 'open', 1,
 DATE_ADD(NOW(), INTERVAL -1 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -3 HOUR)),

-- urgent: created 1.5h ago → sla_due_at in 30 min (AT-RISK, within 20% = 24 min)
('Payment gateway timeout',
 'Checkout is timing out for all users. Revenue impact.',
 'urgent', 'in_progress', 2,
 DATE_ADD(NOW(), INTERVAL 30 MINUTE),
 0,
 DATE_ADD(NOW(), INTERVAL -90 MINUTE)),

-- high: created 10h ago → sla_due_at 2h ago (BREACHED)
('Export CSV not working',
 'The export button on the reports page does nothing.',
 'high', 'open', 3,
 DATE_ADD(NOW(), INTERVAL -2 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -10 HOUR)),

-- high: created 6h ago → sla_due_at in 2h (OK)
('Dashboard charts not loading',
 'Bar charts on the analytics dashboard show blank.',
 'high', 'in_progress', 1,
 DATE_ADD(NOW(), INTERVAL 2 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -6 HOUR)),

-- medium: created 26h ago → sla_due_at 2h ago (BREACHED)
('Email notifications delayed',
 'Notification emails are arriving 6+ hours late.',
 'medium', 'open', NULL,
 DATE_ADD(NOW(), INTERVAL -2 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -26 HOUR)),

-- medium: created 20h ago → sla_due_at in 4h (AT-RISK, 20% of 24h = 4.8h)
('Profile picture upload fails',
 'Uploading a new avatar gives a 413 error.',
 'medium', 'open', 4,
 DATE_ADD(NOW(), INTERVAL 4 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -20 HOUR)),

-- medium: created 2h ago → sla_due_at in 22h (OK)
('Dark mode toggle broken on mobile',
 'The theme toggle does not persist after refresh on iOS Safari.',
 'medium', 'open', NULL,
 DATE_ADD(NOW(), INTERVAL 22 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -2 HOUR)),

-- low: created 80h ago → sla_due_at 8h ago (BREACHED)
('Typo in terms and conditions page',
 'Section 4.2 has a spelling mistake: "servces" should be "services".',
 'low', 'open', 5,
 DATE_ADD(NOW(), INTERVAL -8 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -80 HOUR)),

-- low: created 60h ago → sla_due_at in 12h (OK)
('Add keyboard shortcut for search',
 'Pressing Ctrl+K should open the search bar.',
 'low', 'open', NULL,
 DATE_ADD(NOW(), INTERVAL 12 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -60 HOUR)),

-- resolved ticket (cron should skip this)
('API rate limit errors',
 'Third party API returning 429s. Implemented backoff.',
 'high', 'resolved', 2,
 DATE_ADD(NOW(), INTERVAL -1 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -9 HOUR)),

-- closed ticket (cron should skip this)
('Onboarding modal shows twice',
 'New users see the welcome modal on every login.',
 'low', 'closed', 3,
 DATE_ADD(NOW(), INTERVAL 10 HOUR),
 0,
 DATE_ADD(NOW(), INTERVAL -5 HOUR));

-- Sample comments
INSERT INTO ticket_comments (ticket_id, author, message) VALUES
  (1, 'customer',      'This is urgent — none of our users can log in!'),
  (1, 'Alice Johnson', 'Looking into it now. Checking the auth service logs.'),
  (2, 'customer',      'Checkout has been broken for over an hour. Losing sales.'),
  (2, 'Bob Martinez',  'Identified the issue — payment provider API is timing out. Escalating.'),
  (3, 'customer',      'The export has been broken since the last deploy.'),
  (4, 'Alice Johnson', 'Reproduced. Looks like a null reference in the chart renderer.'),
  (5, 'customer',      'Email notifications are critical for our workflow.'),
  (6, 'customer',      'Profile pictures are essential. Please fix soon.'),
  (6, 'David Kim',     'Confirmed the 413. Checking nginx body size limits.'),
  (10, 'Bob Martinez', 'Root cause found: exponential backoff added to the API client. Resolved.');
