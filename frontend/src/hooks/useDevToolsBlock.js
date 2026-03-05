// src/hooks/useDevToolsBlock.js - VERSÃO ESTÁVEL
import { useEffect, useState, useCallback, useRef } from 'react';

export const useDevToolsBlock = () => {
  const [debugMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true';
  });

  const isInitialized = useRef(false);
  const baselineSet = useRef(false);
  const devtoolsDetected = useRef(false);

  useEffect(() => {
    if (debugMode || devtoolsDetected.current) return;

    // 🔪 BLOQUEIA CONSOLE (leve)
    const noop = () => {};
    ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
      console[method] = noop;
    });

    // 🔪 BLOQUEIA REACT DEVTOOLS
    delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

    // 📏 ESTABELECE BASELINE APÓS 3 SEGUNDOS (evita falsos positivos)
    const establishBaseline = () => {
      if (baselineSet.current || devtoolsDetected.current) return;
      
      baselineSet.current = true;
      isInitialized.current = true;
    };

    const timeoutId = setTimeout(establishBaseline, 3000);

    // DETECTOR CALIBRADO (só após baseline)
    const detectDevTools = useCallback(() => {
      if (!isInitialized.current || !baselineSet.current || devtoolsDetected.current) return;

      const outerWidth = window.outerWidth;
      const outerHeight = window.outerHeight;
      const innerWidth = window.innerWidth;
      const innerHeight = window.innerHeight;

      // CALIBRAÇÃO: só detecta se diferença > 100px (DevTools típica)
      const widthDiff = Math.abs(outerWidth - innerWidth);
      const heightDiff = Math.abs(outerHeight - innerHeight);

      if (widthDiff > 100 || heightDiff > 100) {
        devtoolsDetected.current = true;
        alert('Ferramentas de desenvolvedor detectadas!');
        window.location.href = window.location.origin + window.location.pathname;
      }
    }, []);

    // HOOKS (intervalo mais relaxado)
    const intervalId = setInterval(detectDevTools, 1000); // 1s ao invés de 100ms

    // EVENTOS
    const blockKeys = (e) => {
      const forbidden = ['F12'];
      if (forbidden.includes(e.code)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        devtoolsDetected.current = true;
        window.location.reload();
      }
    };

    document.addEventListener('contextmenu', (e) => e.preventDefault(), true);
    window.addEventListener('keydown', blockKeys, true);
    window.addEventListener('resize', detectDevTools);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('keydown', blockKeys, true);
      window.removeEventListener('resize', detectDevTools);
    };
  }, [debugMode]);
};
