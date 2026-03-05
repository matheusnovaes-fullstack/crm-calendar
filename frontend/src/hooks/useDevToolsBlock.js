// src/hooks/useDevToolsBlock.js - VERSÃO NUCLEAR
import { useEffect, useState } from 'react';

export const useDevToolsBlock = () => {
  const [debugMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true';
  });

  useEffect(() => {
    if (debugMode) return;

    // 🔪 BLOQUEIA CONSOLE TOTALMENTE
    const noop = () => {};
    const originalConsole = console;
    ['log', 'debug', 'info', 'warn', 'error', 'clear', 'table', 'dir'].forEach(method => {
      console[method] = noop;
    });

    // 🔪 BLOQUEIA REACT DEVTOOLS
    delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    const reactHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (reactHook) Object.keys(reactHook).forEach(key => reactHook[key] = noop);

    // 📏 VARIÁVEIS DE DETECÇÃO IMPLACÁVEL
    let devtoolsDetected = false;
    let prevOuterWidth = window.outerWidth;
    let prevOuterHeight = window.outerHeight;
    let prevInnerWidth = window.innerWidth;
    let prevInnerHeight = window.innerHeight;
    let prevDocHeight = document.documentElement.scrollHeight;

    const detectDevTools = () => {
      if (devtoolsDetected) return;

      const outerWidth = window.outerWidth;
      const outerHeight = window.outerHeight;
      const innerWidth = window.innerWidth;
      const innerHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // DevTools altera essas dimensões (tolerância de 1px)
      const outerChanged = Math.abs(outerWidth - prevOuterWidth) > 1 || Math.abs(outerHeight - prevOuterHeight) > 1;
      const innerChanged = Math.abs(innerWidth - prevInnerWidth) > 1 || Math.abs(innerHeight - prevInnerHeight) > 1;
      const docChanged = Math.abs(docHeight - prevDocHeight) > 10;

      if (outerChanged || innerChanged || docChanged) {
        devtoolsDetected = true;
        // NUCLEAR: recarrega + alerta + vai pra página "bloqueada"
        alert('Acesso às ferramentas de desenvolvedor detectado. Recarregando...');
        window.location.href = window.location.origin + window.location.pathname; // Remove ?debug
        return;
      }

      // Atualiza baselines
      prevOuterWidth = outerWidth;
      prevOuterHeight = outerHeight;
      prevInnerWidth = innerWidth;
      prevInnerHeight = innerHeight;
      prevDocHeight = docHeight;
    };

    // ⌨️ BLOQUEIO DE TECLAS (capture phase = prioridade máxima)
    const blockKeys = (e) => {
      const forbiddenKeys = ['F12', 'F1', 'F2', 'F3', 'F4', 'F5', 'KeyI', 'KeyJ', 'KeyK', 'KeyU'];
      const combos = e.ctrlKey && e.shiftKey && ['KeyI', 'KeyJ', 'KeyC', 'KeyK', 'KeyE'].includes(e.code);
      const ctrlU = e.ctrlKey && e.code === 'KeyU';

      if (forbiddenKeys.includes(e.code) || combos || ctrlU) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // 🚫 BLOQUEIOS COMPLETOS
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);

    document.addEventListener('keydown', blockKeys, true);
    window.addEventListener('resize', detectDevTools);
    window.addEventListener('keyup', detectDevTools);
    window.addEventListener('focus', detectDevTools);

    // 🔥 DETECÇÃO A CADA 100ms (implacável)
    const detectionInterval = setInterval(detectDevTools, 100);

    // Cleanup
    return () => {
      clearInterval(detectionInterval);
      // Restaura console (opcional)
      Object.assign(console, originalConsole);
    };
  }, [debugMode]);
};
