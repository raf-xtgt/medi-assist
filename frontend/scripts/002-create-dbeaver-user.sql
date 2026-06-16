-- Create a dedicated DBeaver user with read/write access for database queries
-- This user can be used to connect via DBeaver without needing IAM tokens

-- Create the user (replace 'dbeaver_password' with a strong password)
CREATE USER dbeaver_user WITH PASSWORD 'dbeaver_password' LOGIN;

-- Grant permissions on the current database
GRANT CONNECT ON DATABASE postgres TO dbeaver_user;

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO dbeaver_user;

-- Grant all privileges on all tables in the public schema (for read/write access)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbeaver_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbeaver_user;

-- Make these permissions the default for future tables/sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO dbeaver_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO dbeaver_user;
