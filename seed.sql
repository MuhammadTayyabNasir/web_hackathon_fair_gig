-- FairGig seed data — run after schema.sql (fresh database)
-- Password for all seeded users: password

BEGIN;

INSERT INTO platforms (id, name, slug, country) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Careem', 'careem', 'Pakistan'),
  ('10000000-0000-4000-8000-000000000002', 'Uber', 'uber', 'Pakistan'),
  ('10000000-0000-4000-8000-000000000003', 'Bykea', 'bykea', 'Pakistan'),
  ('10000000-0000-4000-8000-000000000004', 'foodpanda', 'foodpanda', 'Pakistan'),
  ('10000000-0000-4000-8000-000000000005', 'Rozee.pk', 'rozee', 'Pakistan'),
  ('10000000-0000-4000-8000-000000000006', 'Daraz', 'daraz', 'Pakistan');

-- bcrypt 12 rounds for "password"
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
  ('20000000-0000-4000-8000-000000000001', 'Advocate Lahore', 'advocate.lahore@fairgig.pk', '+923001111001', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'advocate'),
  ('20000000-0000-4000-8000-000000000002', 'Advocate Karachi', 'advocate.karachi@fairgig.pk', '+923001111002', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'advocate'),
  ('21000000-0000-4000-8000-000000000001', 'Verifier A', 'verifier.a@fairgig.pk', '+923002222001', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'verifier'),
  ('21000000-0000-4000-8000-000000000002', 'Verifier B', 'verifier.b@fairgig.pk', '+923002222002', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'verifier'),
  ('21000000-0000-4000-8000-000000000003', 'Verifier C', 'verifier.c@fairgig.pk', '+923002222003', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'verifier');

INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
  ('22000000-0000-4000-8000-000000000001', 'Worker L1', 'worker.l1@fairgig.pk', '+923010000001', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000002', 'Worker L2', 'worker.l2@fairgig.pk', '+923010000002', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000003', 'Worker L3', 'worker.l3@fairgig.pk', '+923010000003', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000004', 'Worker L4', 'worker.l4@fairgig.pk', '+923010000004', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000005', 'Worker L5', 'worker.l5@fairgig.pk', '+923010000005', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000006', 'Worker K1', 'worker.k1@fairgig.pk', '+923020000001', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000007', 'Worker K2', 'worker.k2@fairgig.pk', '+923020000002', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000008', 'Worker K3', 'worker.k3@fairgig.pk', '+923020000003', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000009', 'Worker K4', 'worker.k4@fairgig.pk', '+923020000004', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000010', 'Worker K5', 'worker.k5@fairgig.pk', '+923020000005', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000011', 'Worker I1', 'worker.i1@fairgig.pk', '+923030000001', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000012', 'Worker I2', 'worker.i2@fairgig.pk', '+923030000002', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000013', 'Worker I3', 'worker.i3@fairgig.pk', '+923030000003', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000014', 'Worker I4', 'worker.i4@fairgig.pk', '+923030000004', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker'),
  ('22000000-0000-4000-8000-000000000015', 'Worker I5', 'worker.i5@fairgig.pk', '+923030000005', '$2a$12$rJxt.r4la7wlSD3DHpY.qOx/bjsApNLkIE3w.xAf0OG7qsSsmBzB2', 'worker');

INSERT INTO worker_profiles (user_id, city, zone, category, preferred_platform_id, cnic_last4, profile_completed_at) VALUES
  ('22000000-0000-4000-8000-000000000001', 'Lahore', 'Gulberg', 'ride_hailing', '10000000-0000-4000-8000-000000000001', '1001', NOW()),
  ('22000000-0000-4000-8000-000000000002', 'Lahore', 'DHA', 'food_delivery', '10000000-0000-4000-8000-000000000004', '1002', NOW()),
  ('22000000-0000-4000-8000-000000000003', 'Lahore', 'Johar Town', 'freelance', '10000000-0000-4000-8000-000000000005', '1003', NOW()),
  ('22000000-0000-4000-8000-000000000004', 'Lahore', 'Gulberg', 'ride_hailing', '10000000-0000-4000-8000-000000000002', '1004', NOW()),
  ('22000000-0000-4000-8000-000000000005', 'Lahore', 'DHA', 'food_delivery', '10000000-0000-4000-8000-000000000004', '1005', NOW()),
  ('22000000-0000-4000-8000-000000000006', 'Karachi', 'Clifton', 'ride_hailing', '10000000-0000-4000-8000-000000000001', '2001', NOW()),
  ('22000000-0000-4000-8000-000000000007', 'Karachi', 'Saddar', 'food_delivery', '10000000-0000-4000-8000-000000000004', '2002', NOW()),
  ('22000000-0000-4000-8000-000000000008', 'Karachi', 'Gulshan', 'freelance', '10000000-0000-4000-8000-000000000006', '2003', NOW()),
  ('22000000-0000-4000-8000-000000000009', 'Karachi', 'Clifton', 'ride_hailing', '10000000-0000-4000-8000-000000000002', '2004', NOW()),
  ('22000000-0000-4000-8000-000000000010', 'Karachi', 'Saddar', 'food_delivery', '10000000-0000-4000-8000-000000000003', '2005', NOW()),
  ('22000000-0000-4000-8000-000000000011', 'Islamabad', 'F-7', 'ride_hailing', '10000000-0000-4000-8000-000000000001', '3001', NOW()),
  ('22000000-0000-4000-8000-000000000012', 'Islamabad', 'G-9', 'food_delivery', '10000000-0000-4000-8000-000000000004', '3002', NOW()),
  ('22000000-0000-4000-8000-000000000013', 'Islamabad', 'Blue Area', 'freelance', '10000000-0000-4000-8000-000000000005', '3003', NOW()),
  ('22000000-0000-4000-8000-000000000014', 'Islamabad', 'F-7', 'ride_hailing', '10000000-0000-4000-8000-000000000002', '3004', NOW()),
  ('22000000-0000-4000-8000-000000000015', 'Islamabad', 'G-9', 'food_delivery', '10000000-0000-4000-8000-000000000004', '3005', NOW());

INSERT INTO grievance_tags (id, name, color_hex) VALUES
  ('30000000-0000-4000-8000-000000000001', 'urgent', '#dc2626'),
  ('30000000-0000-4000-8000-000000000002', 'commission-issue', '#d97706'),
  ('30000000-0000-4000-8000-000000000003', 'deactivation', '#7c3aed'),
  ('30000000-0000-4000-8000-000000000004', 'payment-delay', '#2563eb'),
  ('30000000-0000-4000-8000-000000000005', 'verified', '#16a34a'),
  ('30000000-0000-4000-8000-000000000006', 'needs-review', '#64748b'),
  ('30000000-0000-4000-8000-000000000007', 'escalated', '#b45309'),
  ('30000000-0000-4000-8000-000000000008', 'resolved', '#059669');

INSERT INTO shifts (
  id, worker_id, platform_id, work_date, shift_start, shift_end, hours_worked,
  gross_earned, platform_deductions, net_received, import_source
)
SELECT
  gen_random_uuid(),
  w.id,
  p.id,
  (DATE '2025-10-20' + ((gs.n + (hashtext(w.id::text || gs.n::text)) % 170)::int)),
  TIME '08:00' + (gs.n % 3) * INTERVAL '30 minutes',
  TIME '16:00' + (gs.n % 4) * INTERVAL '15 minutes',
  ROUND((6 + (gs.n % 40) / 10.0)::numeric, 2),
  (1200 + (gs.n * 17) % 2500)::decimal,
  ROUND(((1200 + (gs.n * 17) % 2500) * (0.20 + ((gs.n * 13) % 26) / 100.0))::numeric, 2),
  (1200 + (gs.n * 17) % 2500)::decimal - ROUND(((1200 + (gs.n * 17) % 2500) * (0.20 + ((gs.n * 13) % 26) / 100.0))::numeric, 2),
  CASE WHEN gs.n % 5 = 0 THEN 'csv' WHEN gs.n % 7 = 0 THEN 'api' ELSE 'manual' END
FROM generate_series(1, 305) AS gs(n)
CROSS JOIN LATERAL (
  SELECT id FROM users WHERE role = 'worker' ORDER BY email
  LIMIT 1 OFFSET ((gs.n - 1) % 15)
) w
CROSS JOIN LATERAL (
  SELECT id FROM platforms ORDER BY slug
  LIMIT 1 OFFSET ((gs.n + hashtext(gs.n::text)) % 6)
) p;

INSERT INTO shifts (
  id, worker_id, platform_id, work_date, shift_start, shift_end, hours_worked,
  gross_earned, platform_deductions, net_received, import_source
) VALUES
  ('a0000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '2026-03-15', '09:00', '17:30', 8.0, 2400.00, 1056.00, 1344.00, 'manual'),
  ('a0000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '2026-03-20', '09:00', '17:30', 8.0, 2500.00, 1125.00, 1375.00, 'manual'),
  ('a0000000-0000-4000-8000-000000000003', '22000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004', '2026-03-10', '10:00', '14:00', 5.0, 1800.00, 900.00, 900.00, 'manual'),
  ('a0000000-0000-4000-8000-000000000004', '22000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '2026-03-22', '08:00', '12:00', 8.0, 2200.00, 1100.00, 1100.00, 'manual'),
  ('a0000000-0000-4000-8000-000000000005', '22000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '2026-03-25', '09:00', '18:00', 4.0, 3000.00, 1350.00, 1650.00, 'manual');

INSERT INTO shifts (
  id, worker_id, platform_id, work_date, shift_start, shift_end, hours_worked,
  gross_earned, platform_deductions, net_received, import_source
) VALUES
  ('b0000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', '2026-03-28', '09:00', '12:00', 8.0, 2000.00, 900.00, 1100.00, 'manual'),
  ('b0000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000004', '2026-03-29', '11:00', '15:00', 3.0, 1500.00, 675.00, 825.00, 'manual');

INSERT INTO verifications (shift_id, verifier_id, status, verified_at)
SELECT s.id, '21000000-0000-4000-8000-000000000001', 'verified', NOW() - INTERVAL '3 days'
FROM shifts s
WHERE s.work_date < DATE '2026-02-01'
LIMIT 120;

INSERT INTO verifications (shift_id, status)
SELECT s.id, 'pending'
FROM shifts s
WHERE NOT EXISTS (SELECT 1 FROM verifications v WHERE v.shift_id = s.id)
LIMIT 80;

INSERT INTO commission_snapshots (platform_id, reported_by, city, category, reported_rate_pct, snapshot_date, is_verified)
SELECT
  p.id,
  '20000000-0000-4000-8000-000000000001',
  v.city,
  v.cat,
  (v.base_pct + mo * 0.65)::decimal,
  (DATE '2025-11-01' + make_interval(months => mo))::date,
  true
FROM platforms p
CROSS JOIN generate_series(0, 5) AS mo
CROSS JOIN (VALUES
  ('Lahore', 'ride_hailing', 23.0::decimal),
  ('Karachi', 'food_delivery', 27.0::decimal),
  ('Islamabad', 'freelance', 21.0::decimal)
) AS v(city, cat, base_pct)
WHERE p.slug IN ('careem', 'uber', 'bykea', 'foodpanda', 'rozee', 'daraz');

INSERT INTO grievances (id, worker_id, platform_id, is_anonymous, category, description, status, city, zone, upvote_count, advocate_note, escalated_at, resolved_at)
SELECT
  gen_random_uuid(),
  w.id,
  p.id,
  (gs.n % 4 = 0),
  (ARRAY['commission_change', 'deactivation', 'payment_delay', 'unfair_rating', 'account_issue', 'other'])[1 + (gs.n % 6)],
  'Seeded grievance #' || gs.n || ': ' ||
  (ARRAY['Commission increased without notice', 'Account deactivated', 'Delayed payout', 'Unfair rating', 'Login issues', 'Other platform concern'])[1 + (gs.n % 6)],
  (ARRAY['open', 'tagged', 'escalated', 'resolved'])[1 + (gs.n % 4)],
  wp.city,
  wp.zone,
  (gs.n * 3) % 40,
  CASE WHEN gs.n % 4 = 2 THEN 'Reviewed in weekly triage' ELSE NULL END,
  CASE WHEN gs.n % 4 = 2 THEN NOW() - INTERVAL '5 days' ELSE NULL END,
  CASE WHEN gs.n % 4 = 3 THEN NOW() - INTERVAL '1 day' ELSE NULL END
FROM generate_series(1, 55) gs(n)
CROSS JOIN LATERAL (
  SELECT id FROM users WHERE role = 'worker' ORDER BY email
  LIMIT 1 OFFSET ((gs.n - 1) % 15)
) w
JOIN worker_profiles wp ON wp.user_id = w.id
CROSS JOIN LATERAL (
  SELECT id FROM platforms ORDER BY slug LIMIT 1 OFFSET (gs.n % 6)
) p;

INSERT INTO complaint_clusters (id, name, description, platform_id, category, complaint_count, created_by)
VALUES
  ('40000000-0000-4000-8000-000000000001', 'Lahore Careem commission spike', 'Cluster of Lahore riders reporting higher commission', '10000000-0000-4000-8000-000000000001', 'commission_change', 12, '20000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000002', 'foodpanda payout delays Karachi', 'Delayed payouts in Karachi zones', '10000000-0000-4000-8000-000000000004', 'payment_delay', 9, '20000000-0000-4000-8000-000000000002');

INSERT INTO cluster_mapping (grievance_id, cluster_id, similarity_score)
SELECT g.id, '40000000-0000-4000-8000-000000000001', 0.820
FROM grievances g
WHERE g.city = 'Lahore' AND g.category = 'commission_change'
LIMIT 8;

INSERT INTO cluster_mapping (grievance_id, cluster_id, similarity_score)
SELECT g.id, '40000000-0000-4000-8000-000000000002', 0.760
FROM grievances g
WHERE g.city = 'Karachi' AND g.category = 'payment_delay'
LIMIT 6;

INSERT INTO grievance_tag_map (grievance_id, tag_id, tagged_by)
SELECT g.id, '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001'
FROM grievances g
WHERE g.category = 'commission_change'
LIMIT 15;

COMMIT;
