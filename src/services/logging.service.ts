// Structured logging service for diagnosis system

import { supabase } from '@/integrations/supabase/client';

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Log categories
export enum LogCategory {
  SYSTEM = 'system',
  AUTH = 'auth',
  CHAT = 'chat',
  PDF = 'pdf',
  STORAGE = 'storage',
  DATABASE = 'database',
  WEBHOOK = 'webhook',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  USER_ACTION = 'user_action',
}

// Log entry structure
export interface LogEntry {
  id?: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  context?: Record<string, any>;
  metadata?: {
    user_agent?: string;
    ip_address?: string;
    page_url?: string;
    component?: string;
    function?: string;
    line_number?: number;
    stack_trace?: string;
  };
  tags?: string[];
}

// Log query filters
export interface LogQuery {
  level?: LogLevel;
  category?: LogCategory;
  user_id?: string;
  session_id?: string;
  start_time?: string;
  end_time?: string;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

class LoggingService {
  private logQueue: LogEntry[] = [];
  private batchSize: number = 20;
  private flushInterval: number = 10000; // 10 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  private isEnabled: boolean;
  private currentRequestId: string | null = null;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || 
                    process.env.VITE_ENABLE_LOGGING === 'true';
    
    if (this.isEnabled) {
      this.startBatchFlush();
    }

    // Generate request ID for this session
    this.currentRequestId = this.generateRequestId();
  }

  // Main logging methods
  debug(message: string, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.DEBUG, category, message, context, metadata);
  }

  info(message: string, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.INFO, category, message, context, metadata);
  }

  warn(message: string, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.WARN, category, message, context, metadata);
  }

  error(message: string, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.ERROR, category, message, context, metadata);
  }

  fatal(message: string, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.FATAL, category, message, context, metadata);
  }

  // Specialized logging methods
  logUserAction(action: string, userId: string, sessionId?: string, details?: Record<string, any>): void {
    this.info(`User action: ${action}`, LogCategory.USER_ACTION, {
      action,
      user_id: userId,
      session_id: sessionId,
      ...details,
    }, {
      component: 'user_interaction',
    });
  }

  logChatInteraction(type: 'message_sent' | 'message_received' | 'session_started' | 'session_ended', userId: string, sessionId: string, details?: Record<string, any>): void {
    this.info(`Chat ${type}`, LogCategory.CHAT, {
      interaction_type: type,
      user_id: userId,
      session_id: sessionId,
      ...details,
    }, {
      component: 'chat_service',
    });
  }

  logPDFOperation(operation: 'generation_started' | 'generation_completed' | 'generation_failed' | 'download' | 'view', userId: string, sessionId?: string, details?: Record<string, any>): void {
    const level = operation === 'generation_failed' ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, LogCategory.PDF, `PDF ${operation}`, {
      operation,
      user_id: userId,
      session_id: sessionId,
      ...details,
    }, {
      component: 'pdf_service',
    });
  }

  logDatabaseOperation(operation: string, table: string, success: boolean, duration?: number, error?: Error): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    this.log(level, LogCategory.DATABASE, `Database ${operation} on ${table}`, {
      operation,
      table,
      success,
      duration_ms: duration,
      error_message: error?.message,
    }, {
      component: 'database',
      stack_trace: error?.stack,
    });
  }

  logWebhookCall(url: string, method: string, statusCode?: number, duration?: number, error?: Error): void {
    const level = error || (statusCode && statusCode >= 400) ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, LogCategory.WEBHOOK, `Webhook ${method} ${url}`, {
      url,
      method,
      status_code: statusCode,
      duration_ms: duration,
      error_message: error?.message,
    }, {
      component: 'webhook_service',
      stack_trace: error?.stack,
    });
  }

  logPerformanceMetric(metric: string, value: number, unit: string, context?: Record<string, any>): void {
    this.info(`Performance metric: ${metric}`, LogCategory.PERFORMANCE, {
      metric,
      value,
      unit,
      ...context,
    }, {
      component: 'performance_monitor',
    });
  }

  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: Record<string, any>): void {
    const level = severity === 'critical' ? LogLevel.FATAL : 
                 severity === 'high' ? LogLevel.ERROR :
                 severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(level, LogCategory.SECURITY, `Security event: ${event}`, {
      event,
      severity,
      ...details,
    }, {
      component: 'security_monitor',
    });
  }

  logAuthEvent(event: 'login' | 'logout' | 'token_refresh' | 'auth_failure', userId?: string, details?: Record<string, any>): void {
    const level = event === 'auth_failure' ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, LogCategory.AUTH, `Auth event: ${event}`, {
      event,
      user_id: userId,
      ...details,
    }, {
      component: 'auth_service',
    });
  }

  // Error logging with automatic context extraction
  logError(error: Error, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>): void {
    this.error(error.message, category, {
      error_name: error.name,
      error_stack: error.stack,
      ...context,
    }, {
      component: this.extractComponentFromStack(error.stack),
      function: this.extractFunctionFromStack(error.stack),
      line_number: this.extractLineNumberFromStack(error.stack),
      stack_trace: error.stack,
    });
  }

  // Query logs
  async queryLogs(query: LogQuery): Promise<LogEntry[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      let supabaseQuery = supabase
        .from('system_logs')
        .select('*');

      // Apply filters
      if (query.level) {
        supabaseQuery = supabaseQuery.eq('level', query.level);
      }
      
      if (query.category) {
        supabaseQuery = supabaseQuery.eq('category', query.category);
      }
      
      if (query.user_id) {
        supabaseQuery = supabaseQuery.eq('user_id', query.user_id);
      }
      
      if (query.session_id) {
        supabaseQuery = supabaseQuery.eq('session_id', query.session_id);
      }
      
      if (query.start_time) {
        supabaseQuery = supabaseQuery.gte('timestamp', query.start_time);
      }
      
      if (query.end_time) {
        supabaseQuery = supabaseQuery.lte('timestamp', query.end_time);
      }
      
      if (query.search) {
        supabaseQuery = supabaseQuery.ilike('message', `%${query.search}%`);
      }
      
      if (query.tags && query.tags.length > 0) {
        supabaseQuery = supabaseQuery.contains('tags', query.tags);
      }

      // Apply pagination
      if (query.offset) {
        supabaseQuery = supabaseQuery.range(query.offset, (query.offset + (query.limit || 50)) - 1);
      } else {
        supabaseQuery = supabaseQuery.limit(query.limit || 50);
      }

      // Order by timestamp descending
      supabaseQuery = supabaseQuery.order('timestamp', { ascending: false });

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Failed to query logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Log query failed:', error);
      return [];
    }
  }

  // Get log statistics
  async getLogStats(startTime: string, endTime: string): Promise<any> {
    if (!this.isEnabled) {
      return { message: 'Logging disabled in development' };
    }

    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('level, category, timestamp')
        .gte('timestamp', startTime)
        .lte('timestamp', endTime);

      if (error) throw error;

      return this.processLogStats(data || []);
    } catch (error) {
      console.error('Failed to get log stats:', error);
      return null;
    }
  }

  // Private methods
  private log(level: LogLevel, category: LogCategory, message: string, context?: Record<string, any>, metadata?: LogEntry['metadata']): void {
    const logEntry: LogEntry = {
      level,
      category,
      message,
      timestamp: new Date().toISOString(),
      request_id: this.currentRequestId,
      context,
      metadata: {
        ...this.getDefaultMetadata(),
        ...metadata,
      },
    };

    // Add to queue for batch processing
    this.logQueue.push(logEntry);

    // Console output in development or for errors
    if (!this.isEnabled || level === LogLevel.ERROR || level === LogLevel.FATAL) {
      this.consoleLog(logEntry);
    }

    // Immediate flush for fatal errors
    if (level === LogLevel.FATAL) {
      this.flush();
    }
  }

  private consoleLog(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.context);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, entry.message, entry.context, entry.metadata?.stack_trace);
        break;
    }
  }

  private getDefaultMetadata(): LogEntry['metadata'] {
    if (typeof window === 'undefined') return {};

    return {
      user_agent: navigator.userAgent,
      page_url: window.location.href,
    };
  }

  private extractComponentFromStack(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    const match = stack.match(/at\s+(\w+)\s+/);
    return match?.[1];
  }

  private extractFunctionFromStack(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    const match = stack.match(/at\s+(\w+\.\w+|\w+)\s+/);
    return match?.[1];
  }

  private extractLineNumberFromStack(stack?: string): number | undefined {
    if (!stack) return undefined;
    
    const match = stack.match(/:(\d+):\d+/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logsToFlush = this.logQueue.splice(0, this.batchSize);

    try {
      await supabase
        .from('system_logs')
        .insert(logsToFlush);
    } catch (error) {
      console.error('Failed to flush logs:', error);
      
      // Re-queue failed logs (with limit to prevent infinite growth)
      if (this.logQueue.length < 100) {
        this.logQueue.unshift(...logsToFlush.slice(0, 10)); // Keep only recent logs
      }
    }
  }

  private processLogStats(data: any[]): any {
    const stats = {
      total_logs: data.length,
      logs_by_level: {} as Record<string, number>,
      logs_by_category: {} as Record<string, number>,
      logs_by_hour: {} as Record<string, number>,
      error_rate: 0,
      warning_rate: 0,
    };

    let errorCount = 0;
    let warningCount = 0;

    data.forEach(log => {
      // Count by level
      stats.logs_by_level[log.level] = (stats.logs_by_level[log.level] || 0) + 1;
      
      // Count by category
      stats.logs_by_category[log.category] = (stats.logs_by_category[log.category] || 0) + 1;
      
      // Count by hour
      const hour = new Date(log.timestamp).toISOString().substr(0, 13);
      stats.logs_by_hour[hour] = (stats.logs_by_hour[hour] || 0) + 1;
      
      // Count errors and warnings
      if (log.level === LogLevel.ERROR || log.level === LogLevel.FATAL) {
        errorCount++;
      } else if (log.level === LogLevel.WARN) {
        warningCount++;
      }
    });

    stats.error_rate = data.length > 0 ? (errorCount / data.length) * 100 : 0;
    stats.warning_rate = data.length > 0 ? (warningCount / data.length) * 100 : 0;

    return stats;
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    this.flush();
  }
}

// Export singleton instance with error handling
export const loggingService = (() => {
  try {
    return new LoggingService();
  } catch (error) {
    console.warn('LoggingService initialization failed:', error);
    return null;
  }
})();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    loggingService.destroy();
  });
}