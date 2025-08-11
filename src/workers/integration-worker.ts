import { integrationQueueService } from '@/services/integration-queue.service';

export class IntegrationWorker {
  private static instance: IntegrationWorker;
  private isRunning = false;
  private workerInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  private readonly WORKER_INTERVAL = 30000; // 30 seconds
  private readonly CLEANUP_INTERVAL = 3600000; // 1 hour

  private constructor() {}

  static getInstance(): IntegrationWorker {
    if (!IntegrationWorker.instance) {
      IntegrationWorker.instance = new IntegrationWorker();
    }
    return IntegrationWorker.instance;
  }

  /**
   * Starts the background worker
   */
  start(): void {
    if (this.isRunning) {
      console.log('Integration worker is already running');
      return;
    }

    console.log('Starting integration background worker');
    this.isRunning = true;

    // Start queue processing
    integrationQueueService.start();

    // Set up periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL);

    // Perform initial cleanup
    this.performCleanup();
  }

  /**
   * Stops the background worker
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping integration background worker');
    this.isRunning = false;

    // Stop queue processing
    integrationQueueService.stop();

    // Clear intervals
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Gets worker status
   */
  getStatus(): {
    isRunning: boolean;
    uptime: number;
    lastCleanup: Date | null;
  } {
    return {
      isRunning: this.isRunning,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      lastCleanup: this.lastCleanup
    };
  }

  /**
   * Forces immediate queue processing
   */
  async processNow(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Worker is not running');
    }

    console.log('Forcing immediate queue processing');
    await integrationQueueService.processQueue();
  }

  /**
   * Forces immediate cleanup
   */
  async cleanupNow(): Promise<void> {
    console.log('Forcing immediate cleanup');
    await this.performCleanup();
  }

  // Private properties
  private startTime = 0;
  private lastCleanup: Date | null = null;

  private async performCleanup(): Promise<void> {
    try {
      console.log('Performing integration worker cleanup');
      
      // Clean up old queue items (older than 24 hours)
      const deletedQueueItems = await integrationQueueService.cleanupOldItems(24);
      
      // Clean up old logs (this would be handled by the database function)
      // We could call it here if needed
      
      this.lastCleanup = new Date();
      
      console.log(`Cleanup completed. Removed ${deletedQueueItems} old queue items`);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Auto-start worker in browser environment
if (typeof window !== 'undefined') {
  const worker = IntegrationWorker.getInstance();
  
  // Start worker when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      worker.start();
    });
  } else {
    worker.start();
  }
  
  // Stop worker when page unloads
  window.addEventListener('beforeunload', () => {
    worker.stop();
  });
  
  // Handle visibility changes (pause/resume when tab is hidden/visible)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      worker.stop();
    } else {
      worker.start();
    }
  });
}

export const integrationWorker = IntegrationWorker.getInstance();