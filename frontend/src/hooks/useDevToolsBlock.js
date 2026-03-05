// src/hooks/useDevToolsBlock.js
import { useEffect, useState } from 'react';

export const useDevToolsBlock = () => {
  const [debugMode] = useState(() => {
    // Libera debug via parâmetro URL: ?debug=true
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true';
  });

  useEffect(() => {
    if (debugMode) return; // Debug liberado, sai

    // 1. BLOQUEIA REACT DEVTOOLS
    const reactHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (reactHook) {
      Object.keys(reactHook).forEach(key => {
        reactHook[key] = () => {};
      });
    }

    // 2. BLOQUEIA CONSOLE.LOG E OUTROS
    const noop = () => {};
    ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
      console[method] = noop;
    });

    // 3. DETECTA ABERTURA DAS DEVTOOLS (F12, Ctrl+Shift+I)
    let devtoolsOpen = false;
    let currentWidth = window.outerWidth;
    let currentHeight = window.outerHeight;

    const checkDevTools = () => {
      const newWidth = window.outerWidth;
      const newHeight = window.outerHeight;
      
      // Se DevTools abriu, dimensões mudam
      if (newWidth !== currentWidth || newHeight !== currentHeight) {
        devtoolsOpen = true;
        window.location.reload(); // Recarrega e bloqueia
      }
      currentWidth = newWidth;
      currentHeight = newHeight;
    };

    // 4. BLOQUEIA TECLAS COMUNS
    const blockKeys = (e) => {
      const forbidden = [
        'F12',
        'KeyI', // Ctrl+Shift+I
        'KeyJ', // Ctrl+Shift+J
      ];
      
      if (forbidden.includes(e.code) || 
          (e.ctrlKey && e.shiftKey && (e.code === 'KeyI' || e.code === 'KeyJ'))) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
    };

    // 5. BLOQUEIA MENU DE CONTEXTO
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    window.addEventListener('keydown', blockKeys);
    window.addEventListener('resize', checkDevTools);
    
    // Loop de detecção
    const interval = setInterval(checkDevTools, 500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', blockKeys);
      window.removeEventListener('resize', checkDevTools);
    };
  }, [debugMode]);
};
