-- Monitoring and analytics tables for diagnosis system

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    properties JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS analytics_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(20) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User engagement metrics table
CREATE TABLE IF NOT EXISTS analytics_engagement (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    duration INTEGER, -- in milliseconds
    interactions_count INTEGER DEFAULT 0,
    completion_rate NUMERIC(5,2), -- percentage
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health checks table
CREATE TABLE IF NOT EXISTS monitoring_health_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    overall_status VARCHAR(20) NOT NULL,
    services JSONB NOT NULL,
    uptime BIGINT NOT NULL,
    version VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
    id VARCHAR(255) PRIMARY KEY,
    alert_config_id VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_performance_metric_name ON analytics_performance(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_timestamp ON analytics_performance(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_user_id ON analytics_performance(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_engagement_user_id ON analytics_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_engagement_timestamp ON analytics_engagement(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_engagement_event_type ON analytics_engagement(event_type);

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_session_id ON system_logs(session_id);

CREATE INDEX IF NOT EXISTS idx_monitoring_health_checks_timestamp ON monitoring_health_checks(timestamp);
CREATE INDEX IF NOT EXISTS idx_monitoring_health_checks_overall_status ON monitoring_health_checks(overall_status);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_timestamp ON monitoring_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_resolved ON monitoring_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON monitoring_alerts(severity);

-- Row Level Security (RLS) policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- Analytics events policies
CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Performance metrics policies
CREATE POLICY "Users can view their own performance metrics" ON analytics_performance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert performance metrics" ON analytics_performance
    FOR INSERT WITH CHECK (true);

-- Engagement metrics policies
CREATE POLICY "Users can view their own engagement metrics" ON analytics_engagement
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert engagement metrics" ON analytics_engagement
    FOR INSERT WITH CHECK (true);

-- System logs policies (admin only for viewing)
CREATE POLICY "Service can insert system logs" ON system_logs
    FOR INSERT WITH CHECK (true);

-- Health checks policies (admin only)
CREATE POLICY "Service can insert health checks" ON monitoring_health_checks
    FOR INSERT WITH CHECK (true);

-- Alerts policies (admin only)
CREATE POLICY "Service can manage alerts" ON monitoring_alerts
    FOR ALL WITH CHECK (true);

-- Create a function to clean up old data (for data retention)
CREATE OR REPLACE FUNCTION cleanup_monitoring_data()
RETURNS void AS $$
BEGIN
    -- Delete analytics events older than 90 days
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete performance metrics older than 30 days
    DELETE FROM analytics_performance 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete system logs older than 30 days (except errors)
    DELETE FROM system_logs 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND level NOT IN ('error', 'fatal');
    
    -- Delete error logs older than 90 days
    DELETE FROM system_logs 
    WHERE created_at < NOW() - INTERVAL '90 days' 
    AND level IN ('error', 'fatal');
    
    -- Delete health checks older than 7 days
    DELETE FROM monitoring_health_checks 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Delete resolved alerts older than 30 days
    DELETE FROM monitoring_alerts 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND resolved = true;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-monitoring-data', '0 2 * * *', 'SELECT cleanup_monitoring_data();');

-- Create views for common queries
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    event,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events 
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp), event
ORDER BY date DESC, event_count DESC;

CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    DATE(timestamp) as date,
    metric_name,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    COUNT(*) as measurement_count
FROM analytics_performance 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp), metric_name
ORDER BY date DESC, metric_name;

CREATE OR REPLACE VIEW system_health_summary AS
SELECT 
    DATE(timestamp) as date,
    overall_status,
    COUNT(*) as check_count,
    AVG(uptime) as avg_uptime
FROM monitoring_health_checks 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp), overall_status
ORDER BY date DESC;

-- Grant necessary permissions
GRANT SELECT ON analytics_summary TO authenticated;
GRANT SELECT ON performance_summary TO authenticated;
GRANT SELECT ON system_health_summary TO authenticated;