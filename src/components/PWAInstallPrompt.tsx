import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Verificar se já está instalado
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isInStandaloneMode || isInWebAppiOS);

    // Listener para o evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após 10 segundos (mais agressivo)
      // Ou 60 segundos (mais discreto)
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 10000); // Altere aqui: 10s, 30s, 60s, etc.
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA foi instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
      } else {
        console.log('Usuário recusou instalar o PWA');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Não mostrar se já está instalado ou foi dispensado nesta sessão
  if (isInstalled || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  // Prompt para iOS (manual)
  if (isIOS && showPrompt) {
    return (
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] mx-4 max-w-sm border-cv-blue-heart shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-6 h-6 text-cv-blue-heart mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-cv-gray-dark mb-1">
                Instalar Valente Conecta
              </h3>
              <p className="text-sm text-cv-gray-light mb-3">
                Adicione à sua tela inicial para acesso rápido como um app.
              </p>
              <div className="text-xs text-cv-gray-light mb-3 bg-blue-50 p-2 rounded">
                📱 <strong>Como instalar:</strong><br />
                1. Toque no botão "Compartilhar" ⬆️<br />
                2. Selecione "Adicionar à Tela de Início"<br />
                3. Toque em "Adicionar"
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Agora não
                </Button>
                <Button
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-1 bg-cv-blue-heart hover:bg-cv-blue-heart/90"
                >
                  Entendi
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prompt para Chrome/Edge (automático)
  if (deferredPrompt && showPrompt) {
    return (
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] mx-4 max-w-sm border-cv-blue-heart shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Monitor className="w-6 h-6 text-cv-blue-heart mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-cv-gray-dark mb-1">
                Instalar Valente Conecta
              </h3>
              <p className="text-sm text-cv-gray-light mb-3">
                Instale nosso app para acesso rápido e experiência melhorada.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Agora não
                </Button>
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="flex-1 bg-cv-blue-heart hover:bg-cv-blue-heart/90"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Instalar
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default PWAInstallPrompt;