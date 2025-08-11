import { supabase } from '@/integrations/supabase/client';
import { institutoIntegrationService } from './instituto-integration.service';
import { IntegrationJob } from '@/types/instituto-integration';
import { RetryStrategy } from '@/utils/retry-strategy';

export class IntegrationQueueService {
  private static instance: IntegrationQueueService;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly PROCESSING_INTERVAL = 30000; // 30 seconds
  private readonly BATCH_SIZE = 10;

  private constructor() {}

  static getInstance(): IntegrationQueueService {
    if (!IntegrationQueueService.instance) {
      IntegrationQueueService.instance = new IntegrationQueueService();
    }
    return IntegrationQueueService.instance;
  }

  /**
   * Starts the queue processing service
   */
  start(): void {
    if (this.processingInterval) {
      return; // Already started
    }

    console.log('Starting integration queue processing service');
    
    // Process immediately
    this.processQueue();
    
    // Set up interval processing
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.PROCESSING_INTERVAL);
  }

  /**
   * Stops the queue processing service
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Stopped integration queue processing service');
    }
  }

  /**
   * Processes the retry queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing
    }

    this.isProcessing = true;

    try {
      const queueItems = await this.getQueueItems();
      
      if (queueItems.length === 0) {
        return;
      }

      console.log(`Processing ${queueItems.length} items from integration queue`);

      // Process items in parallel with limited concurrency
      const promises = queueItems.map(item => this.processQueueItem(item));
      await Promise.allSettled(promises);

    } catch (error) {
      console.error('Error processing integration queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Adds an item to the retry queue
   */
  async addToQueue(
    logId: string,
    delaySeconds: number = 300,
    maxAttempts: number = 3
  ): Promise<string | null> {
    try {
      const scheduledFor = new Date(Date.now() + delaySeconds * 1000).toISOString();

      const { data, error } = await supabase
        .from('instituto_integration_queue')
        .insert([{
          log_id: logId,
          scheduled_for: scheduledFor,
          attempts: 0,
          max_attempts: maxAttempts
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error adding item to queue:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error adding item to queue:', error);
      return null;
    }
  }

  /**
   * Removes an item from the queue
   */
  async removeFromQueue(queueId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('instituto_integration_queue')
        .delete()
        .eq('id', queueId);

      if (error) {
        console.error('Error removing item from queue:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing item from queue:', error);
      return false;
    }
  }

  /**
   * Gets queue statistics
   */
  async getQueueStats(): Promise<{
    total_items: number;
    ready_to_process: number;
    failed_items: number;
    average_wait_time: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('instituto_integration_queue')
        .select('scheduled_for, attempts, max_attempts, created_at');

      if (error) {
        throw error;
      }

      const now = new Date();
      const items = data || [];
      
      const readyToProcess = items.filter(item => 
        new Date(item.scheduled_for) <= now
      ).length;

      const failedItems = items.filter(item => 
        item.attempts >= item.max_attempts
      ).length;

      const averageWaitTime = items.length > 0 
        ? items.reduce((sum, item) => {
            const waitTime = now.getTime() - new Date(item.created_at).getTime();
            return sum + waitTime;
          }, 0) / items.length / 1000 // Convert to seconds
        : 0;

      return {
        total_items: items.length,
        ready_to_process: readyToProcess,
        failed_items: failedItems,
        average_wait_time: Math.round(averageWaitTime)
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        total_items: 0,
        ready_to_process: 0,
        failed_items: 0,
        average_wait_time: 0
      };
    }
  }

  /**
   * Cleans up old queue items
   */
  async cleanupOldItems(olderThanHours: number = 24): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('instituto_integration_queue')
        .delete()
        .lt('created_at', cutoffTime)
        .select('id');

      if (error) {
        throw error;
      }

      const deletedCount = data?.length || 0;
      console.log(`Cleaned up ${deletedCount} old queue items`);
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old queue items:', error);
      return 0;
    }
  }

  // Private methods

  private async getQueueItems(): Promise<IntegrationJob[]> {
    try {
      const { data, error } = await supabase
        .from('instituto_integration_queue')
        .select(`
          id,
          log_id,
          scheduled_for,
          attempts,
          max_attempts,
          instituto_integration_logs (
            user_id,
            payload,
            attempt_count
          )
        `)
        .lte('scheduled_for', new Date().toISOString())
        .lt('attempts', supabase.raw('max_attempts'))
        .order('scheduled_for', { ascending: true })
        .limit(this.BATCH_SIZE);

      if (error) {
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        log_id: item.log_id,
        user_data: item.instituto_integration_logs?.payload,
        scheduled_for: item.scheduled_for,
        attempts: item.attempts,
        max_attempts: item.max_attempts
      })).filter(item => item.user_data); // Filter out items without log data
    } catch (error) {
      console.error('Error fetching queue items:', error);
      return [];
    }
  }

  private async processQueueItem(item: IntegrationJob): Promise<void> {
    try {
      console.log(`Processing queue item ${item.id} (attempt ${item.attempts + 1}/${item.max_attempts})`);

      // Update attempt count
      await this.updateQueueItemAttempts(item.id, item.attempts + 1);

      // Get log data
      const logData = await this.getLogData(item.log_id);
      if (!logData) {
        console.error(`Log data not found for queue item ${item.id}`);
        await this.removeFromQueue(item.id);
        return;
      }

      // Try to send the data
      const result = await institutoIntegrationService.sendUserData(
        logData.payload,
        logData.user_id
      );

      if (result.success) {
        // Success - remove from queue
        console.log(`Queue item ${item.id} processed successfully`);
        await this.removeFromQueue(item.id);
      } else {
        // Failed - check if we should retry
        const newAttemptCount = item.attempts + 1;
        
        if (newAttemptCount >= item.max_attempts) {
          // Max attempts reached - remove from queue and mark as failed
          console.log(`Queue item ${item.id} failed after ${newAttemptCount} attempts`);
          await this.removeFromQueue(item.id);
          await this.markLogAsFinallyFailed(item.log_id);
        } else {
          // Schedule next retry with exponential backoff
          const delay = RetryStrategy.calculateDelay(newAttemptCount, {
            maxAttempts: item.max_attempts,
            baseDelay: 5000,
            maxDelay: 300000,
            backoffMultiplier: 2,
            jitter: true
          });

          await this.rescheduleQueueItem(item.id, delay);
          console.log(`Queue item ${item.id} rescheduled for retry in ${delay}ms`);
        }
      }
    } catch (error) {
      console.error(`Error processing queue item ${item.id}:`, error);
      
      // On processing error, reschedule with a longer delay
      await this.rescheduleQueueItem(item.id, 60000); // 1 minute
    }
  }

  private async updateQueueItemAttempts(queueId: string, attempts: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('instituto_integration_queue')
        .update({ attempts })
        .eq('id', queueId);

      if (error) {
        console.error('Error updating queue item attempts:', error);
      }
    } catch (error) {
      console.error('Error updating queue item attempts:', error);
    }
  }

  private async rescheduleQueueItem(queueId: string, delayMs: number): Promise<void> {
    try {
      const newScheduledFor = new Date(Date.now() + delayMs).toISOString();

      const { error } = await supabase
        .from('instituto_integration_queue')
        .update({ scheduled_for: newScheduledFor })
        .eq('id', queueId);

      if (error) {
        console.error('Error rescheduling queue item:', error);
      }
    } catch (error) {
      console.error('Error rescheduling queue item:', error);
    }
  }

  private async getLogData(logId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('instituto_integration_logs')
        .select('user_id, payload, attempt_count')
        .eq('id', logId)
        .single();

      if (error) {
        console.error('Error fetching log data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching log data:', error);
      return null;
    }
  }

  private async markLogAsFinallyFailed(logId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('instituto_integration_logs')
        .update({
          status: 'failed',
          error_message: 'Falha após múltiplas tentativas de retry',
          updated_at: new Date().toISOString()
        })
        .eq('id', logId);

      if (error) {
        console.error('Error marking log as finally failed:', error);
      }
    } catch (error) {
      console.error('Error marking log as finally failed:', error);
    }
  }
}

// Export singleton instance
export const integrationQueueService = IntegrationQueueService.getInstance();