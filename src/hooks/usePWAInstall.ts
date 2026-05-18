import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se ja esta em modo standalone (ja instalado e aberto como app)
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
      if (isStandalone) console.log('PWA: Rodando em modo Instalado');
    };

    checkInstalled();

    // Detecta se é iOS
    const userAgent = window.navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

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
      if (isIOS) {
        alert("Para instalar no seu iPhone:\n\n1. Clique no botão de Compartilhar (ícone de quadrado com seta para cima na barra inferior).\n2. Role a lista para baixo e selecione 'Adicionar à Tela de Início'.\n3. Confirme clicando em 'Adicionar'.");
      } else {
        alert("A instalação automática ainda não foi liberada pelo seu navegador.\n\nPara instalar agora:\n1. Clique nos 3 pontinhos (Menu) do navegador.\n2. Escolha Transmitir, Salvar e compartilhar, e após Instalar página como app.");
      }
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

  return { isInstallable, isInstalled, isIOS, installPWA };
}
