-- Seed data — run after schema.sql
-- Tickets are deliberately set in the past so the SLA cron fires on them immediately

INSERT INTO agents (name, email) VALUES
  ('Alice Johnson',  'alice@support.com'),
  ('Bob Martinez',   'bob@support.com'),
  ('Carol Singh',    'carol@support.com'),
  ('David Kim',      'david@support.com'),
  ('Eva Patel',      'eva@support.com');

INSERT INTO tickets (subject, description, priority, status, assigned_agent_id, sla_due_at, is_escalated, created_at) VALUES

('Login page throws 500 error',
 'Users cannot log in. Getting internal server error on /auth/login.',
 'urgent', 'open', 1,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -1 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -3 HOUR)),

('Payment gateway timeout',
 'Checkout is timing out for all users. Revenue impact.',
 'urgent', 'in_progress', 2,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -90 MINUTE)),

('Export CSV not working',
 'The export button on the reports page does nothing.',
 'high', 'open', 3,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -2 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -10 HOUR)),

('Dashboard charts not loading',
 'Bar charts on the analytics dashboard show blank.',
 'high', 'in_progress', 1,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -6 HOUR)),

('Email notifications delayed',
 'Notification emails are arriving 6+ hours late.',
 'medium', 'open', NULL,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -2 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -26 HOUR)),

('Profile picture upload fails',
 'Uploading a new avatar gives a 413 error.',
 'medium', 'open', 4,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 4 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -20 HOUR)),

('Dark mode toggle broken on mobile',
 'The theme toggle does not persist after refresh on iOS Safari.',
 'medium', 'open', NULL,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 22 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -2 HOUR)),

('Typo in terms and conditions page',
 'Section 4.2 has a spelling mistake: "servces" should be "services".',
 'low', 'open', 5,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -8 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -80 HOUR)),

('Add keyboard shortcut for search',
 'Pressing Ctrl+K should open the search bar.',
 'low', 'open', NULL,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 12 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -60 HOUR)),

('API rate limit errors',
 'Third party API returning 429s. Implemented backoff.',
 'high', 'resolved', 2,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -1 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -9 HOUR)),

('Onboarding modal shows twice',
 'New users see the welcome modal on every login.',
 'low', 'closed', 3,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 HOUR),
 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL -5 HOUR));

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
