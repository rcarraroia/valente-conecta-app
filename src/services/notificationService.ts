/**
 * Serviço de Notificações Push
 * Gerencia notificações do navegador para confirmação de pagamentos
 */

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  /**
   * Verificar se notificações são suportadas
   */
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Verificar status da permissão
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Solicitar permissão para notificações
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Notificações não são suportadas neste navegador');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Permissão para notificações concedida');
      } else {
        console.log('❌ Permissão para notificações negada');
      }
      
      return permission;
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return 'denied';
    }
  }

  /**
   * Enviar notificação
   */
  async sendNotification(options: NotificationOptions): Promise<Notification | null> {
    // Verificar suporte
    if (!this.isSupported) {
      console.warn('Notificações não suportadas');
      return null;
    }

    // Verificar permissão
    if (this.permission !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || 'default',
        data: options.data,
        requireInteraction: true, // Manter visível até interação
        silent: false
      });

      // Configurar eventos
      notification.onclick = () => {
        console.log('Notificação clicada');
        window.focus(); // Focar na janela
        notification.close();
        
        // Callback personalizado se fornecido
        if (options.data?.onClick) {
          options.data.onClick();
        }
      };

      notification.onclose = () => {
        console.log('Notificação fechada');
      };

      notification.onerror = (error) => {
        console.error('Erro na notificação:', error);
      };

      // Auto-fechar após 10 segundos (se não for interativa)
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return null;
    }
  }

  /**
   * Notificação específica para pagamento confirmado
   */
  async notifyPaymentReceived(amount: number, paymentMethod: string = 'PIX'): Promise<void> {
    const formattedAmount = (amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    await this.sendNotification({
      title: '🎉 Instituto Coração Valente',
      body: `Sua doação de ${formattedAmount} acabou de chegar! Muito obrigado por fazer diferença na vida de milhares de pessoas ❤️`,
      icon: '/favicon.ico',
      tag: 'payment-received',
      data: {
        type: 'payment_received',
        amount,
        paymentMethod,
        timestamp: new Date().toISOString(),
        onClick: () => {
          // Redirecionar para página de agradecimento ou dashboard
          console.log('Usuário clicou na notificação de pagamento');
        }
      }
    });
  }

  /**
   * Notificação de teste
   */
  async sendTestNotification(): Promise<void> {
    await this.sendNotification({
      title: '🧪 Teste de Notificação',
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      tag: 'test-notification'
    });
  }

  /**
   * Inicializar serviço (solicitar permissão se necessário)
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notificações não são suportadas neste navegador');
      return false;
    }

    if (this.permission === 'default') {
      const permission = await this.requestPermission();
      return permission === 'granted';
    }

    return this.permission === 'granted';
  }

  /**
   * Verificar se pode enviar notificações
   */
  canSendNotifications(): boolean {
    return this.isSupported && this.permission === 'granted';
  }
}

// Instância singleton
export const notificationService = new NotificationService();

// Funções de conveniência
export const initializeNotifications = () => notificationService.initialize();
export const canSendNotifications = () => notificationService.canSendNotifications();
export const notifyPaymentReceived = (amount: number, method?: string) => 
  notificationService.notifyPaymentReceived(amount, method);
export const sendTestNotification = () => notificationService.sendTestNotification();

export default notificationService;