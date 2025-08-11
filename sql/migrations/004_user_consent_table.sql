-- Migration: User Consent Table
-- Description: Creates table for tracking user consent for data sharing
-- Date: 2025-01-08

-- Table: user_consent
-- Stores user consent records for data sharing with Instituto Coração Valente
CREATE TABLE IF NOT EXISTS user_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_data_sharing BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_consent_user_id ON user_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consent_consent_date ON user_consent(consent_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_consent_active ON user_consent(user_id, consent_data_sharing, revoked_date) 
  WHERE consent_data_sharing = true AND revoked_date IS NULL;

-- Trigger for automatic updated_at updates
CREATE TRIGGER update_user_consent_updated_at 
    BEFORE UPDATE ON user_consent 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own consent records
CREATE POLICY "Users can view own consent records" ON user_consent
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records" ON user_consent
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent records" ON user_consent
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all consent records (for compliance and auditing)
CREATE POLICY "Admin can view all consent records" ON user_consent
  FOR SELECT USING (is_admin());

-- Service role can access all records (for integration processing)
CREATE POLICY "Service role can access all consent records" ON user_consent
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_consent TO authenticated;
GRANT ALL ON user_consent TO service_role;

-- Function to get current user consent status
CREATE OR REPLACE FUNCTION get_user_consent_status(p_user_id UUID DEFAULT auth.uid())
RETURNS JSON AS $$
DECLARE
  consent_record user_consent%ROWTYPE;
  result JSON;
BEGIN
  -- Get the most recent consent record for the user
  SELECT * INTO consent_record
  FROM user_consent
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    result := json_build_object(
      'has_consent_record', false,
      'has_active_consent', false,
      'consent_status', 'never_given',
      'consent_date', null,
      'revoked_date', null
    );
  ELSE
    result := json_build_object(
      'has_consent_record', true,
      'has_active_consent', (consent_record.consent_data_sharing AND consent_record.revoked_date IS NULL),
      'consent_status', CASE 
        WHEN consent_record.consent_data_sharing AND consent_record.revoked_date IS NULL THEN 'active'
        WHEN consent_record.revoked_date IS NOT NULL THEN 'revoked'
        ELSE 'inactive'
      END,
      'consent_date', consent_record.consent_date,
      'revoked_date', consent_record.revoked_date,
      'last_updated', consent_record.updated_at
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get consent statistics (admin only)
CREATE OR REPLACE FUNCTION get_consent_statistics()
RETURNS JSON AS $$
DECLARE
  stats JSON;
  total_users INTEGER;
  users_with_consent INTEGER;
  active_consents INTEGER;
  revoked_consents INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Get total users
  SELECT COUNT(*) INTO total_users FROM auth.users;
  
  -- Get users with any consent record
  SELECT COUNT(DISTINCT user_id) INTO users_with_consent FROM user_consent;
  
  -- Get active consents
  SELECT COUNT(DISTINCT user_id) INTO active_consents 
  FROM user_consent 
  WHERE consent_data_sharing = true AND revoked_date IS NULL;
  
  -- Get revoked consents
  SELECT COUNT(DISTINCT user_id) INTO revoked_consents 
  FROM user_consent 
  WHERE revoked_date IS NOT NULL;
  
  stats := json_build_object(
    'total_users', total_users,
    'users_with_consent_record', users_with_consent,
    'active_consents', active_consents,
    'revoked_consents', revoked_consents,
    'never_consented', total_users - users_with_consent,
    'consent_rate', CASE 
      WHEN total_users > 0 THEN ROUND((active_consents::NUMERIC / total_users::NUMERIC) * 100, 2)
      ELSE 0 
    END
  );
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_consent_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_consent_statistics() TO authenticated;

-- Comments for documentation
COMMENT ON TABLE user_consent IS 'Stores user consent records for data sharing with external organizations';
COMMENT ON COLUMN user_consent.consent_data_sharing IS 'Whether user has consented to data sharing';
COMMENT ON COLUMN user_consent.consent_date IS 'When the consent was granted';
COMMENT ON COLUMN user_consent.revoked_date IS 'When the consent was revoked (NULL if still active)';

COMMENT ON FUNCTION get_user_consent_status(UUID) IS 'Returns current consent status for a user';
COMMENT ON FUNCTION get_consent_statistics() IS 'Returns consent statistics (admin only)';