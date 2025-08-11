-- Migration: Instituto Integration Helper Functions
-- Description: Utility functions for Instituto integration operations
-- Date: 2025-01-08

-- Function to get integration statistics
CREATE OR REPLACE FUNCTION get_instituto_integration_stats(
  time_range_hours INTEGER DEFAULT 24
)
RETURNS JSON AS $$
DECLARE
  stats JSON;
  total_attempts INTEGER;
  successful_sends INTEGER;
  failed_sends INTEGER;
  pending_retries INTEGER;
  success_rate NUMERIC;
  last_24h_attempts INTEGER;
  last_24h_success_rate NUMERIC;
BEGIN
  -- Get overall statistics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'success'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*) FILTER (WHERE status IN ('pending', 'retry'))
  INTO total_attempts, successful_sends, failed_sends, pending_retries
  FROM instituto_integration_logs;
  
  -- Calculate success rate
  success_rate := CASE 
    WHEN total_attempts > 0 THEN 
      ROUND((successful_sends::NUMERIC / total_attempts::NUMERIC) * 100, 2)
    ELSE 0 
  END;
  
  -- Get last 24h statistics
  SELECT 
    COUNT(*),
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0 
    END
  INTO last_24h_attempts, last_24h_success_rate
  FROM instituto_integration_logs
  WHERE created_at >= NOW() - INTERVAL '24 hours';
  
  -- Build JSON response
  stats := json_build_object(
    'total_attempts', COALESCE(total_attempts, 0),
    'successful_sends', COALESCE(successful_sends, 0),
    'failed_sends', COALESCE(failed_sends, 0),
    'pending_retries', COALESCE(pending_retries, 0),
    'success_rate', COALESCE(success_rate, 0),
    'last_24h_attempts', COALESCE(last_24h_attempts, 0),
    'last_24h_success_rate', COALESCE(last_24h_success_rate, 0)
  );
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old logs (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_integration_logs(
  days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete logs older than specified days, but keep failed ones for longer
  DELETE FROM instituto_integration_logs
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND status = 'success';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete very old failed logs (keep for 180 days)
  DELETE FROM instituto_integration_logs
  WHERE created_at < NOW() - INTERVAL '180 days'
    AND status IN ('failed', 'retry');
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add integration log entry
CREATE OR REPLACE FUNCTION add_integration_log(
  p_user_id UUID,
  p_status TEXT,
  p_payload JSONB,
  p_response JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_attempt_count INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO instituto_integration_logs (
    user_id,
    status,
    payload,
    response,
    error_message,
    attempt_count
  ) VALUES (
    p_user_id,
    p_status,
    p_payload,
    p_response,
    p_error_message,
    p_attempt_count
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule retry
CREATE OR REPLACE FUNCTION schedule_integration_retry(
  p_log_id UUID,
  p_delay_seconds INTEGER DEFAULT 300
)
RETURNS UUID AS $$
DECLARE
  queue_id UUID;
  max_attempts INTEGER;
  current_attempts INTEGER;
BEGIN
  -- Get current attempt count and max attempts from config
  SELECT 
    l.attempt_count,
    COALESCE(c.retry_attempts, 3)
  INTO current_attempts, max_attempts
  FROM instituto_integration_logs l
  CROSS JOIN instituto_integration_config c
  WHERE l.id = p_log_id
    AND c.is_active = true
  LIMIT 1;
  
  -- Only schedule if we haven't exceeded max attempts
  IF current_attempts < max_attempts THEN
    INSERT INTO instituto_integration_queue (
      log_id,
      scheduled_for,
      attempts,
      max_attempts
    ) VALUES (
      p_log_id,
      NOW() + INTERVAL '1 second' * p_delay_seconds,
      current_attempts,
      max_attempts
    ) RETURNING id INTO queue_id;
    
    -- Update log status to retry
    UPDATE instituto_integration_logs
    SET 
      status = 'retry',
      next_retry_at = NOW() + INTERVAL '1 second' * p_delay_seconds,
      updated_at = NOW()
    WHERE id = p_log_id;
  END IF;
  
  RETURN queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_instituto_integration_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_integration_logs(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION add_integration_log(UUID, TEXT, JSONB, JSONB, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_integration_retry(UUID, INTEGER) TO authenticated;