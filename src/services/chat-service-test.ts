// Simple test to verify chat service is working
import { chatService } from './chat.service';

export const testChatService = () => {
  console.log('Testing ChatService...');
  
  if (!chatService) {
    console.error('❌ ChatService is null');
    return false;
  }
  
  console.log('✅ ChatService instance created');
  
  // Test configuration
  const config = chatService.getConfiguration();
  console.log('📋 Configuration:', config);
  
  // Test metrics
  const metrics = chatService.getMetrics();
  console.log('📊 Metrics:', metrics);
  
  // Test health check
  chatService.healthCheck()
    .then(health => {
      console.log('🏥 Health check:', health);
    })
    .catch(error => {
      console.error('❌ Health check failed:', error);
    });
  
  return true;
};

// Auto-run test in development
if (import.meta.env.MODE === 'development') {
  setTimeout(() => {
    testChatService();
  }, 1000);
}