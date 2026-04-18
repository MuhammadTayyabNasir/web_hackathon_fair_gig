-- FairGig — PostgreSQL schema (single source of truth)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  country VARCHAR(50) DEFAULT 'Pakistan',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(128) UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'worker',
  is_active BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE worker_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  city VARCHAR(100),
  zone VARCHAR(100),
  category VARCHAR(50),
  preferred_platform_id UUID REFERENCES platforms(id),
  id_document_url TEXT,
  cnic_last4 VARCHAR(4),
  profile_completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE csv_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255),
  total_rows INT DEFAULT 0,
  imported_rows INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'processing',
  error_log TEXT,
  imported_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES platforms(id),
  work_date DATE NOT NULL,
  shift_start TIME,
  shift_end TIME,
  hours_worked DECIMAL(5,2),
  gross_earned DECIMAL(10,2) NOT NULL,
  platform_deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_received DECIMAL(10,2) NOT NULL,
  commission_rate_pct DECIMAL(5,2)
    GENERATED ALWAYS AS (
      CASE WHEN gross_earned > 0
        THEN ROUND((platform_deductions / gross_earned * 100)::NUMERIC, 2)
      ELSE 0 END
    ) STORED,
  currency VARCHAR(3) DEFAULT 'PKR',
  import_source VARCHAR(20) DEFAULT 'manual',
  batch_id UUID REFERENCES csv_import_batches(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE screenshot_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id),
  storage_url TEXT NOT NULL,
  storage_provider VARCHAR(30) DEFAULT 'firebase',
  file_size_bytes BIGINT,
  mime_type VARCHAR(50),
  original_filename VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL UNIQUE REFERENCES shifts(id) ON DELETE CASCADE,
  verifier_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  verifier_note TEXT,
  flagged_reason VARCHAR(100),
  assigned_at TIMESTAMP,
  verified_at TIMESTAMP
);

CREATE TABLE anomaly_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  anomaly_type VARCHAR(50) NOT NULL,
  severity VARCHAR(10) NOT NULL DEFAULT 'medium',
  z_score DECIMAL(6,3),
  expected_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  plain_explanation TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  detected_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id),
  is_anonymous BOOLEAN DEFAULT false,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  city VARCHAR(100),
  zone VARCHAR(100),
  upvote_count INT DEFAULT 0,
  advocate_note TEXT,
  escalated_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grievance_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  color_hex VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grievance_tag_map (
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES grievance_tags(id) ON DELETE CASCADE,
  tagged_by UUID REFERENCES users(id),
  tagged_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (grievance_id, tag_id)
);

CREATE TABLE grievance_upvotes (
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (grievance_id, user_id)
);

CREATE TABLE complaint_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  platform_id UUID REFERENCES platforms(id),
  category VARCHAR(50),
  complaint_count INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cluster_mapping (
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  cluster_id UUID NOT NULL REFERENCES complaint_clusters(id) ON DELETE CASCADE,
  similarity_score DECIMAL(4,3),
  mapped_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (grievance_id, cluster_id)
);

CREATE TABLE commission_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES platforms(id),
  reported_by UUID NOT NULL REFERENCES users(id),
  city VARCHAR(100),
  category VARCHAR(50),
  reported_rate_pct DECIMAL(5,2) NOT NULL,
  snapshot_date DATE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE income_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_verified_earnings DECIMAL(12,2),
  avg_monthly_income DECIMAL(10,2),
  total_verified_shifts INT,
  currency VARCHAR(3) DEFAULT 'PKR',
  token VARCHAR(64) UNIQUE NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_shifts_worker_id ON shifts(worker_id);
CREATE INDEX idx_shifts_platform_id ON shifts(platform_id);
CREATE INDEX idx_shifts_work_date ON shifts(work_date);
CREATE INDEX idx_shifts_worker_date ON shifts(worker_id, work_date);
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_verifications_shift_id ON verifications(shift_id);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_platform_id ON grievances(platform_id);
CREATE INDEX idx_grievances_city ON grievances(city);
CREATE INDEX idx_grievance_upvotes_user ON grievance_upvotes(user_id);
CREATE INDEX idx_anomaly_logs_worker_id ON anomaly_logs(worker_id);
CREATE INDEX idx_anomaly_logs_detected_at ON anomaly_logs(detected_at);
CREATE INDEX idx_commission_snapshots_platform ON commission_snapshots(platform_id, snapshot_date);
CREATE INDEX idx_income_certificates_token ON income_certificates(token);
