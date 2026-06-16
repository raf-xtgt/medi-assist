CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS app_mda_user (
  guid        UUID PRIMARY KEY,
  email       VARCHAR(255),
  phone       VARCHAR(255),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  status      VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_user_email
  ON app_mda_user USING BTREE (email);

CREATE INDEX IF NOT EXISTS idx_app_mda_user_phone
  ON app_mda_user USING BTREE (phone);

CREATE INDEX IF NOT EXISTS idx_app_mda_user_status
  ON app_mda_user USING BTREE (status);

CREATE INDEX IF NOT EXISTS idx_app_mda_user_created_date
  ON app_mda_user USING BTREE (created_date);
