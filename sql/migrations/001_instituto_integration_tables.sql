-- Migration: Instituto Integration Tables
-- Description: Creates tables for Instituto Coração Valente API integration
-- Date: 2025-01-08

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: instituto_integration_config
-- Stores API configuration and credentials
CREATE TABLE IF NOT EXISTS instituto_integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST' CHECK (method IN ('POST', 'PUT')),
  auth_type TEXT NOT NULL CHECK (auth_type IN ('api_key', 'bearer', 'basic')),
  encrypted_credentials JSONB NOT NULL DEFAULT '{}',
  sandbox_endpoint TEXT,
  is_sandbox BOOLEAN NOT NULL DEFAULT true,
  retry_attempts INTEGER NOT NULL DEFAULT 3 CHECK (retry_attempts >= 1 AND retry_attempts <= 10),
  retry_delay INTEGER NOT NULL DEFAULT 5000 CHECK (retry_delay >= 1000 AND retry_delay <= 300000),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: instituto_integration_logs
-- Stores all integration attempts and their results
CREATE TABLE IF NOT EXISTS instituto_integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'retry')),
  payload JSONB NOT NULL,
  response JSONB,
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1 CHECK (attempt_count >= 1),
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: instituto_integration_queue
-- Manages retry queue for failed integrations
CREATE TABLE IF NOT EXISTS instituto_integration_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES instituto_integration_logs(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 3 CHECK (max_attempts >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_integration_logs_status ON instituto_integration_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_logs_user_id ON instituto_integration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON instituto_integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_queue_scheduled ON instituto_integration_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_integration_queue_log_id ON instituto_integration_queue(log_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at updates
CREATE TRIGGER update_instituto_integration_config_updated_at 
    BEFORE UPDATE ON instituto_integration_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instituto_integration_logs_updated_at 
    BEFORE UPDATE ON instituto_integration_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE instituto_integration_config IS 'Configuration settings for Instituto Coração Valente API integration';
COMMENT ON TABLE instituto_integration_logs IS 'Log of all integration attempts with Instituto API';
COMMENT ON TABLE instituto_integration_queue IS 'Queue for managing retry attempts of failed integrations';

COMMENT ON COLUMN instituto_integration_config.encrypted_credentials IS 'Encrypted JSON containing API credentials (api_key, bearer_token, etc.)';
COMMENT ON COLUMN instituto_integration_logs.payload IS 'JSON payload sent to Instituto API';
COMMENT ON COLUMN instituto_integration_logs.response IS 'JSON response received from Instituto API';
COMMENT ON COLUMN instituto_integration_queue.scheduled_for IS 'When this retry attempt should be processed';