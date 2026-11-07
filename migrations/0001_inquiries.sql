CREATE TABLE IF NOT EXISTS clinic_inquiries (
 id TEXT PRIMARY KEY,
 request_key TEXT NOT NULL UNIQUE,
 payload_hash TEXT NOT NULL,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 stage TEXT NOT NULL,
 message TEXT NOT NULL,
 support TEXT NOT NULL,
 tools TEXT NOT NULL DEFAULT '',
 consent_at TEXT NOT NULL,
 notification_status TEXT NOT NULL DEFAULT 'pending',
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS clinic_rate_limits (
 ip_hash TEXT PRIMARY KEY,
 window_start INTEGER NOT NULL,
 hits INTEGER NOT NULL
);
