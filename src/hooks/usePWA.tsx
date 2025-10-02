import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PWAUpdateInfo {
  needRefresh: boolean;
  updateAvailable: boolean;
  updateSW: () => Promise<void>;
}

export const usePWA = (): PWAUpdateInfo => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
    onNeedRefresh() {
      setUpdateAvailable(true);
      console.log('Nova versão disponível');
    },
    onOfflineReady() {
      console.log('App pronto para funcionar offline');
    },
  });

  const updateSW = async () => {
    try {
      await updateServiceWorker(true);
      setUpdateAvailable(false);
    } catch (error) {
      console.error('Erro ao atualizar SW:', error);
    }
  };

  return {
    needRefresh,
    updateAvailable,
    updateSW,
  };
};

// Hook para detectar se está rodando como PWA
export const useIsPWA = (): boolean => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsPWA(isInStandaloneMode || isInWebAppiOS);
  }, []);

  return isPWA;
};

// Hook para detectar se PWA pode ser instalado
export const useCanInstallPWA = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setCanInstall(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      return false;
    }
  };

  return {
    canInstall,
    installPWA,
  };
};