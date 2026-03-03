import { useState, useEffect, useRef } from "react";

const ANTECEDENCIA_15 = 15 * 60 * 1000;
const ANTECEDENCIA_5  =  5 * 60 * 1000;

function tocarSinal(urgente = false) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();

    const tocar = (freq, inicio, duracao) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type      = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + inicio);

      gain.gain.setValueAtTime(0, ctx.currentTime + inicio);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + inicio + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + inicio + duracao);

      osc.start(ctx.currentTime + inicio);
      osc.stop(ctx.currentTime + inicio + duracao);
    };

    if (urgente) {
      // 3 bipes rápidos e agudos — urgente
      tocar(880, 0.0, 0.18);
      tocar(880, 0.2, 0.18);
      tocar(880, 0.4, 0.28);
    } else {
      // 2 bipes suaves — aviso
      tocar(660, 0.0, 0.2);
      tocar(880, 0.3, 0.2);
    }
  } catch {
    // Navegador bloqueou o áudio — ignora silenciosamente
  }
}

export function useNotificacoes(issues) {
  const [fila, setFila]   = useState([]);
  const [atual, setAtual] = useState(null);
  const jaNotificado      = useRef(new Set());

  useEffect(() => {
    function checar() {
      const agora = Date.now();
      const novas = [];

      issues.forEach(issue => {
        if (!issue.data_resolucao) return;

        const fim      = new Date(issue.data_resolucao).getTime();
        const restante = fim - agora;
        const horario  = new Date(fim).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });

        if (restante > 0 && restante <= ANTECEDENCIA_15 && !jaNotificado.current.has(`${issue.chave}_15`)) {
          jaNotificado.current.add(`${issue.chave}_15`);
          novas.push({ id:`${issue.chave}_15`, chave:issue.chave, resumo:issue.resumo, minutos:15, horario, urgente:false });
        }

        if (restante > 0 && restante <= ANTECEDENCIA_5 && !jaNotificado.current.has(`${issue.chave}_5`)) {
          jaNotificado.current.add(`${issue.chave}_5`);
          novas.push({ id:`${issue.chave}_5`, chave:issue.chave, resumo:issue.resumo, minutos:5, horario, urgente:true });
        }
      });

      if (novas.length > 0) {
        tocarSinal(novas.some(n => n.urgente));
        setFila(prev => [...prev, ...novas]);
      }
    }

    checar();
    const intervalo = setInterval(checar, 60 * 1000);
    return () => clearInterval(intervalo);
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

  return { notificacao: atual, confirmar: () => setAtual(null) };
}
