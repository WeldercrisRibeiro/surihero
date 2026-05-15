import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se ja esta em modo standalone (ja instalado e aberto como app)
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
      if (isStandalone) console.log('PWA: Rodando em modo Instalado');
    };

    checkInstalled();

    const handler = (e: any) => {
      console.log('PWA: Navegador pronto para instalar!');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const installedHandler = () => {
      console.log('PWA: Instalado com sucesso!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      alert("A instalação automática ainda não foi liberada pelo seu navegador.\n\nPara instalar agora:\n1. Clique nos 3 pontinhos (Menu) do navegador.\n2. Escolha Transmitir, Salvar e compartilhar, e após Instalar página como app.");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } catch (err) {
      console.error('PWA: Erro ao disparar instalacao:', err);
    }
  };

  return { isInstallable, isInstalled, installPWA };
}
