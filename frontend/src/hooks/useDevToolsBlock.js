// src/hooks/useDevToolsBlock.js
import { useEffect, useState } from 'react';

export const useDevToolsBlock = () => {
  const [debugMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true';
  });

  useEffect(() => {
    if (debugMode) return;

    // 1. BLOQUEIA CONSOLE COMPLETAMENTE
    const noop = () => {};
    ['log', 'debug', 'info', 'warn', 'error', 'clear', 'table'].forEach(method => {
      console[method] = noop;
    });

    // 2. BLOQUEIA REACT DEVTOOLS
    const reactHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (reactHook) {
      Object.keys(reactHook).forEach(key => {
        reactHook[key] = () => {};
      });
    }

    // 3. VARIÁVEIS DE DETECÇÃO
    let devtoolsOpen = false;
    let prevWidth = window.outerWidth;
    let prevHeight = window.outerHeight;
    let prevDocHeight = document.documentElement.offsetHeight;

    const checkDevTools = () => {
      const width = window.outerWidth;
      const height = window.outerHeight;
      const docHeight = document.documentElement.offsetHeight;

      // DevTools altera dimensões ou altura do documento
      if (width !== prevWidth || height !== prevHeight || docHeight !== prevDocHeight) {
        devtoolsOpen = true;
        window.location.reload();
      }
      
      prevWidth = width;
      prevHeight = height;
      prevDocHeight = docHeight;
    };

    // 4. BLOQUEIA TODAS AS TECLAS SUSPEITAS
    const blockKeys = (e) => {
      const forbidden = [
        'F12',
        'KeyI', 'KeyJ', 'KeyK', 'KeyL',  // DevTools comuns
        'F1', 'F2', 'F3', 'F4', 'F5',    // Function keys
        'KeyU'                           // Ctrl+U (view source)
      ];
      
      // Combinações comuns
      if (forbidden.includes(e.code) || 
          (e.ctrlKey && e.shiftKey && ['KeyI', 'KeyJ', 'KeyC'].includes(e.code)) ||
          (e.ctrlKey && e.shiftKey && e.code === 'KeyK') ||
          (e.ctrlKey && e.code === 'KeyU') ||
          (e.ctrlKey && e.shiftKey && e.code === 'KeyE')) {  // Ctrl+Shift+E (Network)
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
    };

    // 5. BLOQUEIA MENU DE CONTEXTO (Mais ferramentas incluso)
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
      window.location.reload();
      return false;
    });

    // 6. BLOQUEIA INSPECIONAR ELEMENTO VIA MENU
    document.addEventListener('mousedown', (e) => {
      if (e.detail === 3) { // Clique triplo (inspecionar)
        e.preventDefault();
        window.location.reload();
      }
    });

    // 7. HOOKS DE DETECÇÃO
    window.addEventListener('keydown', blockKeys, true);  // Capture phase
    window.addEventListener('resize', checkDevTools);
    window.addEventListener('load', checkDevTools);

    // LOOP AGRESSIVO DE DETECÇÃO (250ms)
    const interval = setInterval(checkDevTools, 250);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', blockKeys, true);
      window.removeEventListener('resize', checkDevTools);
      window.removeEventListener('load', checkDevTools);
    };
  }, [debugMode]);
};
