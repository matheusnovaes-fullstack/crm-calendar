import { useState, useEffect, useRef } from "react";

const ANTECEDENCIA_15 = 15 * 60 * 1000;
const ANTECEDENCIA_5  =  5 * 60 * 1000;

const STORAGE_HISTORICO = "crm_notif_historico";

// ─── Histórico persiste entre sessões (sino) ──────────────────
function salvarHistorico(h) {
  try { localStorage.setItem(STORAGE_HISTORICO, JSON.stringify(h)); } catch {}
}
function carregarHistorico() {
  try { return JSON.parse(localStorage.getItem(STORAGE_HISTORICO) || "[]"); } catch { return []; }
}

// ─── jaNotificado é APENAS em memória (não persiste) ─────────
// Garante que dentro da mesma sessão o popup não repete.
// Ao recarregar a página, o Set é zerado — se a campanha ainda
// estiver na janela de alerta, o popup aparece novamente. ✅
function criarJaNotificado() {
  return new Set();
}

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
  } catch {}
}

// Respeita hora real se existir; estende para 23:59:59 só se vier sem hora (00:00:00)
function resolverFim(dataStr) {
  const d = new Date(dataStr);
  if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
    d.setHours(23, 59, 59, 999);
  }
  return d;
}

export function useNotificacoes(issues, newPromos = []) {
  const [fila,      setFila]      = useState([]);
  const [atual,     setAtual]     = useState(null);
  const [historico, setHistorico] = useState(() => carregarHistorico());

  // Em memória — zera a cada sessão/recarga
  const jaNotificado = useRef(criarJaNotificado());
  const timerRef     = useRef(null);

  function adicionarHistorico(notif) {
    setHistorico(h => {
      const nova = [notif, ...h].slice(0, 100);
      salvarHistorico(nova);
      return nova;
    });
  }

  // ─── Nova campanha detectada no Jira ─────────────────────────
  useEffect(() => {
    if (newPromos.length === 0) return;
    newPromos.forEach(chave => {
      const id = `${chave}_nova`;
      if (jaNotificado.current.has(id)) return;
      jaNotificado.current.add(id);

      const issue = issues.find(i => i.chave === chave);
      const notif = {
        id, chave,
        resumo:  issue?.resumo || chave,
        minutos: 0,
        horario: new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" }),
        urgente: false,
        tipo:    "nova",
        ts:      Date.now(),
        lida:    false,
      };
      adicionarHistorico(notif);
      tocarSinal(false);
      setFila(prev => [...prev, notif]);
    });
  }, [newPromos]);

  // ─── Verificação de encerramento (a cada 10s) ─────────────────
  useEffect(() => {
    function checar() {
      const agora = Date.now();
      const novas = [];

      issues.forEach(issue => {
        if (!issue.data_resolucao) return;

        const fimDate  = resolverFim(issue.data_resolucao);
        const fim      = fimDate.getTime();
        const inicio   = issue.data_inicio ? new Date(issue.data_inicio).getTime() : null;
        const restante = fim - agora;

        // Só alerta campanhas que já iniciaram
        if (inicio && agora < inicio) return;

        // Horário legível
        const horario = fimDate.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });

        // ── Alerta 15 min ──────────────────────────────────────
        // Dispara se restante está entre 0 e 15min.
        // jaNotificado em memória evita repetir na mesma sessão.
        // Se o analista recarregar dentro dessa janela → dispara de novo. ✅
        const id15 = `${issue.chave}_15`;
        if (restante > 0 && restante <= ANTECEDENCIA_15 && !jaNotificado.current.has(id15)) {
          jaNotificado.current.add(id15);
          const notif = { id:id15, chave:issue.chave, resumo:issue.resumo, minutos:15, horario, urgente:false, tipo:"encerramento", ts:Date.now(), lida:false };
          adicionarHistorico(notif);
          novas.push(notif);
        }

        // ── Alerta 5 min ───────────────────────────────────────
        const id5 = `${issue.chave}_5`;
        if (restante > 0 && restante <= ANTECEDENCIA_5 && !jaNotificado.current.has(id5)) {
          jaNotificado.current.add(id5);
          const notif = { id:id5, chave:issue.chave, resumo:issue.resumo, minutos:5, horario, urgente:true, tipo:"encerramento", ts:Date.now(), lida:false };
          adicionarHistorico(notif);
          novas.push(notif);
        }

        // ── Campanha iniciando (só histórico) ──────────────────
        const idInicio = `${issue.chave}_inicio`;
        if (inicio && Math.abs(agora - inicio) <= 30000 && !jaNotificado.current.has(idInicio)) {
          jaNotificado.current.add(idInicio);
          const hi = new Date(inicio).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
          adicionarHistorico({ id:idInicio, chave:issue.chave, resumo:issue.resumo, minutos:0, horario:hi, urgente:false, tipo:"inicio", ts:Date.now(), lida:false });
        }

        // ── Campanha encerrada (só histórico) ──────────────────
        const idFim = `${issue.chave}_fim`;
        if (restante <= 0 && Math.abs(agora - fim) <= 30000 && !jaNotificado.current.has(idFim)) {
          jaNotificado.current.add(idFim);
          adicionarHistorico({ id:idFim, chave:issue.chave, resumo:issue.resumo, minutos:0, horario, urgente:false, tipo:"encerrada", ts:Date.now(), lida:false });
        }
      });

      if (novas.length > 0) {
        tocarSinal(novas.some(n => n.urgente));
        setFila(prev => [...prev, ...novas]);
      }
    }

    checar();
    timerRef.current = setInterval(checar, 10 * 1000);
    return () => clearInterval(timerRef.current);
  }, [issues]);

  // ─── Exibe próxima da fila ────────────────────────────────────
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
    notificacao:   atual,
    confirmar:     () => setAtual(null),
    historico,
    totalNaoLidas: historico.filter(n => !n.lida).length,

    marcarLidas: () => {
      setHistorico(h => {
        const atualizado = h.map(n => ({ ...n, lida: true }));
        salvarHistorico(atualizado);
        return atualizado;
      });
    },

    limparHistorico: () => {
      setHistorico([]);
      localStorage.removeItem(STORAGE_HISTORICO);
      jaNotificado.current = criarJaNotificado();
    },
  };
}
