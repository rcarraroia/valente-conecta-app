// Monitoring and health check service

import { supabase } from '@/integrations/supabase/client';
import { chatService } from './chat.service';

// Health check status
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

// Service health check result
export interface HealthCheckResult {
  service: string;
  status: HealthStatus;
  response_time: number;
  timestamp: string;
  details?: Record<string, any>;
  error?: string;
}

// System health summary
export interface SystemHealth {
  overall_status: HealthStatus;
  services: HealthCheckResult[];
  last_check: string;
  uptime: number;
  version: string;
}

// Alert configuration
export interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  channels: ('email' | 'webhook' | 'console')[];
  cooldown_minutes: number;
}

// Alert event
export interface AlertEvent {
  id: string;
  alert_config_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
}

class MonitoringService {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private alertConfigs: AlertConfig[] = [];
  private activeAlerts: Map<string, AlertEvent> = new Map();
  private lastAlertTimes: Map<string, number> = new Map();
  private startTime: number = Date.now();

  constructor() {
    this.initializeDefaultAlerts();
    this.startHealthChecks();
  }

  // Health check methods
  async checkSystemHealth(): Promise<SystemHealth> {
    const services = await Promise.all([
      this.checkSupabaseHealth(),
      this.checkN8nWebhookHealth(),
      this.checkStorageHealth(),
      this.checkDatabaseHealth(),
    ]);

    const overallStatus = this.determineOverallStatus(services);

    return {
      overall_status: overallStatus,
      services,
      last_check: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.VITE_APP_VERSION || '1.0.0',
    };
  }

  async checkSupabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.auth.getSession();
      const responseTime = Date.now() - startTime;

      if (error && error.message !== 'No session found') {
        return {
          service: 'supabase_auth',
          status: HealthStatus.UNHEALTHY,
          response_time: responseTime,
          timestamp: new Date().toISOString(),
          error: error.message,
        };
      }

      return {
        service: 'supabase_auth',
        status: responseTime < 1000 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: {
          session_exists: !!data.session,
        },
      };
    } catch (error: any) {
      return {
        service: 'supabase_auth',
        status: HealthStatus.UNHEALTHY,
        response_time: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async checkN8nWebhookHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Health check endpoint for n8n webhook
      const healthCheckUrl = process.env.VITE_N8N_WEBHOOK_URL?.replace('/webhook/', '/health/') || '';
      
      if (!healthCheckUrl) {
        return {
          service: 'n8n_webhook',
          status: HealthStatus.UNKNOWN,
          response_time: 0,
          timestamp: new Date().toISOString(),
          error: 'Webhook URL not configured',
        };
      }

      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          service: 'n8n_webhook',
          status: HealthStatus.UNHEALTHY,
          response_time: responseTime,
          timestamp: new Date().toISOString(),
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        service: 'n8n_webhook',
        status: responseTime < 2000 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: {
          status_code: response.status,
        },
      };
    } catch (error: any) {
      return {
        service: 'n8n_webhook',
        status: HealthStatus.UNHEALTHY,
        response_time: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async checkStorageHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test storage by listing buckets
      const { data, error } = await supabase.storage.listBuckets();
      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          service: 'supabase_storage',
          status: HealthStatus.UNHEALTHY,
          response_time: responseTime,
          timestamp: new Date().toISOString(),
          error: error.message,
        };
      }

      const diagnosisBucket = data?.find(bucket => bucket.name === 'diagnosis-reports');

      return {
        service: 'supabase_storage',
        status: responseTime < 1000 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: {
          buckets_count: data?.length || 0,
          diagnosis_bucket_exists: !!diagnosisBucket,
        },
      };
    } catch (error: any) {
      return {
        service: 'supabase_storage',
        status: HealthStatus.UNHEALTHY,
        response_time: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test database with a simple query
      const { data, error } = await supabase
        .from('relatorios_diagnostico')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          service: 'supabase_database',
          status: HealthStatus.UNHEALTHY,
          response_time: responseTime,
          timestamp: new Date().toISOString(),
          error: error.message,
        };
      }

      return {
        service: 'supabase_database',
        status: responseTime < 500 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: {
          query_successful: true,
        },
      };
    } catch (error: any) {
      return {
        service: 'supabase_database',
        status: HealthStatus.UNHEALTHY,
        response_time: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  // Alert management
  async checkAlerts(systemHealth: SystemHealth): Promise<void> {
    for (const config of this.alertConfigs) {
      if (!config.enabled) continue;

      const shouldAlert = this.evaluateAlertCondition(config, systemHealth);
      const alertKey = config.id;
      const lastAlertTime = this.lastAlertTimes.get(alertKey) || 0;
      const cooldownMs = config.cooldown_minutes * 60 * 1000;

      if (shouldAlert && Date.now() - lastAlertTime > cooldownMs) {
        await this.triggerAlert(config, systemHealth);
        this.lastAlertTimes.set(alertKey, Date.now());
      } else if (!shouldAlert && this.activeAlerts.has(alertKey)) {
        await this.resolveAlert(alertKey);
      }
    }
  }

  private evaluateAlertCondition(config: AlertConfig, systemHealth: SystemHealth): boolean {
    switch (config.condition) {
      case 'overall_status_unhealthy':
        return systemHealth.overall_status === HealthStatus.UNHEALTHY;
      
      case 'service_response_time_high':
        return systemHealth.services.some(service => 
          service.response_time > config.threshold
        );
      
      case 'service_unhealthy':
        return systemHealth.services.some(service => 
          service.status === HealthStatus.UNHEALTHY
        );
      
      case 'multiple_services_degraded':
        const degradedCount = systemHealth.services.filter(service => 
          service.status === HealthStatus.DEGRADED || service.status === HealthStatus.UNHEALTHY
        ).length;
        return degradedCount >= config.threshold;
      
      default:
        return false;
    }
  }

  private async triggerAlert(config: AlertConfig, systemHealth: SystemHealth): Promise<void> {
    const alertEvent: AlertEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alert_config_id: config.id,
      severity: this.determineSeverity(config, systemHealth),
      message: this.generateAlertMessage(config, systemHealth),
      details: {
        system_health: systemHealth,
        config,
      },
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.activeAlerts.set(config.id, alertEvent);

    // Send alert through configured channels
    for (const channel of config.channels) {
      await this.sendAlert(channel, alertEvent);
    }

    // Store alert in database
    try {
      await supabase
        .from('monitoring_alerts')
        .insert([alertEvent]);
    } catch (error) {
      console.error('Failed to store alert:', error);
    }
  }

  private async resolveAlert(alertKey: string): Promise<void> {
    const alert = this.activeAlerts.get(alertKey);
    if (!alert) return;

    alert.resolved = true;
    alert.resolved_at = new Date().toISOString();

    this.activeAlerts.delete(alertKey);

    // Update alert in database
    try {
      await supabase
        .from('monitoring_alerts')
        .update({
          resolved: true,
          resolved_at: alert.resolved_at,
        })
        .eq('id', alert.id);
    } catch (error) {
      console.error('Failed to update resolved alert:', error);
    }
  }

  private async sendAlert(channel: string, alert: AlertEvent): Promise<void> {
    switch (channel) {
      case 'console':
        console.error(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
        break;
      
      case 'email':
        // In production, integrate with email service
        console.log('Email alert would be sent:', alert);
        break;
      
      case 'webhook':
        // In production, send to monitoring webhook
        console.log('Webhook alert would be sent:', alert);
        break;
    }
  }

  private determineSeverity(config: AlertConfig, systemHealth: SystemHealth): AlertEvent['severity'] {
    if (systemHealth.overall_status === HealthStatus.UNHEALTHY) {
      return 'critical';
    }
    
    const unhealthyServices = systemHealth.services.filter(s => s.status === HealthStatus.UNHEALTHY);
    if (unhealthyServices.length > 0) {
      return 'high';
    }
    
    const degradedServices = systemHealth.services.filter(s => s.status === HealthStatus.DEGRADED);
    if (degradedServices.length > 1) {
      return 'medium';
    }
    
    return 'low';
  }

  private generateAlertMessage(config: AlertConfig, systemHealth: SystemHealth): string {
    switch (config.condition) {
      case 'overall_status_unhealthy':
        return `System health is ${systemHealth.overall_status}`;
      
      case 'service_response_time_high':
        const slowServices = systemHealth.services.filter(s => s.response_time > config.threshold);
        return `High response times detected: ${slowServices.map(s => `${s.service} (${s.response_time}ms)`).join(', ')}`;
      
      case 'service_unhealthy':
        const unhealthyServices = systemHealth.services.filter(s => s.status === HealthStatus.UNHEALTHY);
        return `Unhealthy services detected: ${unhealthyServices.map(s => s.service).join(', ')}`;
      
      case 'multiple_services_degraded':
        const degradedServices = systemHealth.services.filter(s => 
          s.status === HealthStatus.DEGRADED || s.status === HealthStatus.UNHEALTHY
        );
        return `Multiple services degraded: ${degradedServices.map(s => s.service).join(', ')}`;
      
      default:
        return `Alert triggered: ${config.name}`;
    }
  }

  private determineOverallStatus(services: HealthCheckResult[]): HealthStatus {
    const unhealthyCount = services.filter(s => s.status === HealthStatus.UNHEALTHY).length;
    const degradedCount = services.filter(s => s.status === HealthStatus.DEGRADED).length;

    if (unhealthyCount > 0) {
      return HealthStatus.UNHEALTHY;
    }
    
    if (degradedCount > 1) {
      return HealthStatus.DEGRADED;
    }
    
    if (degradedCount > 0) {
      return HealthStatus.DEGRADED;
    }
    
    return HealthStatus.HEALTHY;
  }

  private initializeDefaultAlerts(): void {
    this.alertConfigs = [
      {
        id: 'system_unhealthy',
        name: 'System Unhealthy',
        condition: 'overall_status_unhealthy',
        threshold: 0,
        enabled: true,
        channels: ['console', 'email'],
        cooldown_minutes: 5,
      },
      {
        id: 'high_response_times',
        name: 'High Response Times',
        condition: 'service_response_time_high',
        threshold: 3000, // 3 seconds
        enabled: true,
        channels: ['console'],
        cooldown_minutes: 10,
      },
      {
        id: 'service_failures',
        name: 'Service Failures',
        condition: 'service_unhealthy',
        threshold: 0,
        enabled: true,
        channels: ['console', 'email'],
        cooldown_minutes: 5,
      },
      {
        id: 'multiple_degraded',
        name: 'Multiple Services Degraded',
        condition: 'multiple_services_degraded',
        threshold: 2,
        enabled: true,
        channels: ['console'],
        cooldown_minutes: 15,
      },
    ];
  }

  private startHealthChecks(): void {
    // Initial health check
    this.performHealthCheck();

    // Schedule regular health checks (every 2 minutes)
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 2 * 60 * 1000);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const systemHealth = await this.checkSystemHealth();
      
      // Store health check results
      await this.storeHealthCheck(systemHealth);
      
      // Check for alerts
      await this.checkAlerts(systemHealth);
      
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  private async storeHealthCheck(systemHealth: SystemHealth): Promise<void> {
    try {
      await supabase
        .from('monitoring_health_checks')
        .insert([{
          overall_status: systemHealth.overall_status,
          services: systemHealth.services,
          uptime: systemHealth.uptime,
          version: systemHealth.version,
          timestamp: systemHealth.last_check,
        }]);
    } catch (error) {
      console.error('Failed to store health check:', error);
    }
  }

  // Public API methods
  async getHealthStatus(): Promise<SystemHealth> {
    return this.checkSystemHealth();
  }

  async getAlerts(limit: number = 50): Promise<AlertEvent[]> {
    try {
      const { data, error } = await supabase
        .from('monitoring_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get alerts:', error);
      return [];
    }
  }

  async getHealthHistory(hours: number = 24): Promise<any[]> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    try {
      const { data, error } = await supabase
        .from('monitoring_health_checks')
        .select('*')
        .gte('timestamp', startTime)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get health history:', error);
      return [];
    }
  }

  // Cleanup
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Export singleton instance with error handling
export const monitoringService = (() => {
  try {
    return new MonitoringService();
  } catch (error) {
    console.warn('MonitoringService initialization failed:', error);
    return null;
  }
})();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    monitoringService.destroy();
  });
}