import { useState, useEffect, useRef } from "react";

const ANTECEDENCIA_15 = 15 * 60 * 1000;
const ANTECEDENCIA_5  =  5 * 60 * 1000;

function tocarSinal(urgente = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const tocar = (freq, inicio, duracao) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + inicio);
      gain.gain.setValueAtTime(0, ctx.currentTime + inicio);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + inicio + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + inicio + duracao);
      osc.start(ctx.currentTime + inicio);
      osc.stop(ctx.currentTime + inicio + duracao);
    };
    if (urgente) {
      tocar(880, 0.0, 0.18);
      tocar(880, 0.2, 0.18);
      tocar(880, 0.4, 0.28);
    } else {
      tocar(660, 0.0, 0.2);
      tocar(880, 0.3, 0.2);
    }
  } catch { /* áudio bloqueado */ }
}

export function useNotificacoes(issues) {
  const [fila,      setFila]      = useState([]);
  const [atual,     setAtual]     = useState(null);
  const [historico, setHistorico] = useState([]);  // ← novo
  const jaNotificado = useRef(new Set());
  const timerRef     = useRef(null);

  // Verifica a cada 10s para maior precisão
  useEffect(() => {
    function checar() {
      const agora = Date.now();
      const novas = [];

      issues.forEach(issue => {
        if (!issue.data_resolucao) return;

        const fim      = new Date(issue.data_resolucao).getTime();
        const inicio   = issue.data_inicio ? new Date(issue.data_inicio).getTime() : null;
        const restante = fim - agora;
        const horario  = new Date(fim).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });

        // Alerta 15 min antes do fim
        if (restante > 0 && restante <= ANTECEDENCIA_15 && !jaNotificado.current.has(`${issue.chave}_15`)) {
          jaNotificado.current.add(`${issue.chave}_15`);
          const notif = { id:`${issue.chave}_15`, chave:issue.chave, resumo:issue.resumo, minutos:15, horario, urgente:false, tipo:"encerramento", ts: Date.now() };
          novas.push(notif);
          setHistorico(h => [notif, ...h].slice(0, 50));
        }

        // Alerta 5 min antes do fim
        if (restante > 0 && restante <= ANTECEDENCIA_5 && !jaNotificado.current.has(`${issue.chave}_5`)) {
          jaNotificado.current.add(`${issue.chave}_5`);
          const notif = { id:`${issue.chave}_5`, chave:issue.chave, resumo:issue.resumo, minutos:5, horario, urgente:true, tipo:"encerramento", ts: Date.now() };
          novas.push(notif);
          setHistorico(h => [notif, ...h].slice(0, 50));
        }

        // Notifica quando campanha inicia (janela de 30s)
        if (inicio && Math.abs(agora - inicio) <= 30000 && !jaNotificado.current.has(`${issue.chave}_inicio`)) {
          jaNotificado.current.add(`${issue.chave}_inicio`);
          const notif = { id:`${issue.chave}_inicio`, chave:issue.chave, resumo:issue.resumo, minutos:0, horario: new Date(inicio).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}), urgente:false, tipo:"inicio", ts: Date.now() };
          novas.push(notif);
          setHistorico(h => [notif, ...h].slice(0, 50));
        }

        // Notifica quando campanha encerra (janela de 30s)
        if (restante <= 0 && Math.abs(agora - fim) <= 30000 && !jaNotificado.current.has(`${issue.chave}_fim`)) {
          jaNotificado.current.add(`${issue.chave}_fim`);
          const notif = { id:`${issue.chave}_fim`, chave:issue.chave, resumo:issue.resumo, minutos:0, horario, urgente:false, tipo:"encerrada", ts: Date.now() };
          novas.push(notif);
          setHistorico(h => [notif, ...h].slice(0, 50));
        }
      });

      if (novas.length > 0) {
        tocarSinal(novas.some(n => n.urgente));
        setFila(prev => [...prev, ...novas]);
      }
    }

    checar();
    // Intervalo de 10s para precisão nos alertas de 5 e 15 min
    timerRef.current = setInterval(checar, 10 * 1000);
    return () => clearInterval(timerRef.current);
  }, [issues]);

  useEffect(() => {
    if (!atual && fila.length > 0) {
      const t = setTimeout(() => {
        setAtual(fila[0]);
        setFila(prev => prev.slice(1));
      }, 0);
      return () => clearTimeout(t);
    }
  }, [fila, atual]);

  return {
    notificacao: atual,
    confirmar: () => setAtual(null),
    historico,               // ← exposto para o sininho
    totalNaoLidas: historico.filter(n => !n.lida).length,
    marcarLidas: () => setHistorico(h => h.map(n => ({ ...n, lida: true }))),
  };
}
