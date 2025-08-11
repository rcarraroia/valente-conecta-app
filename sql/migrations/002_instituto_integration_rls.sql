-- Migration: Instituto Integration RLS Policies
-- Description: Row Level Security policies for Instituto integration tables
-- Date: 2025-01-08

-- Enable RLS on all tables
ALTER TABLE instituto_integration_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE instituto_integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE instituto_integration_queue ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() ->> 'role') = 'admin' OR
      (auth.jwt() ->> 'user_role') = 'admin' OR
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data ->> 'role' = 'admin'
      ),
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for instituto_integration_config table
-- Only admins can access configuration
CREATE POLICY "Admin full access to config" ON instituto_integration_config
  FOR ALL USING (is_admin());

-- Policies for instituto_integration_logs table
-- Users can view their own logs, admins can view all
CREATE POLICY "Users can view own logs" ON instituto_integration_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to logs" ON instituto_integration_logs
  FOR ALL USING (is_admin());

-- Service role can insert logs (for system operations)
CREATE POLICY "Service role can insert logs" ON instituto_integration_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Service role can update logs (for retry operations)
CREATE POLICY "Service role can update logs" ON instituto_integration_logs
  FOR UPDATE USING (auth.role() = 'service_role');

-- Policies for instituto_integration_queue table
-- Only admins and service role can access queue
CREATE POLICY "Admin full access to queue" ON instituto_integration_queue
  FOR ALL USING (is_admin());

CREATE POLICY "Service role full access to queue" ON instituto_integration_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions to authenticated users
GRANT SELECT ON instituto_integration_logs TO authenticated;
GRANT INSERT ON instituto_integration_logs TO authenticated;

-- Grant permissions to service role for background processing
GRANT ALL ON instituto_integration_config TO service_role;
GRANT ALL ON instituto_integration_logs TO service_role;
GRANT ALL ON instituto_integration_queue TO service_role;

-- Grant permissions to admins (assuming admin role exists)
-- Note: This might need adjustment based on your actual admin role setup
GRANT ALL ON instituto_integration_config TO authenticated;
GRANT ALL ON instituto_integration_logs TO authenticated;
GRANT ALL ON instituto_integration_queue TO authenticated;