import { useState, useEffect, useRef } from "react";

const ANTECEDENCIA_15 = 15 * 60 * 1000;
const ANTECEDENCIA_5  =  5 * 60 * 1000;

const STORAGE_HISTORICO  = "crm_notif_historico";
const STORAGE_NOTIFICADO = "crm_notif_janotificado";

function salvarHistorico(h) {
  try { localStorage.setItem(STORAGE_HISTORICO, JSON.stringify(h)); } catch {}
}

function carregarHistorico() {
  try { return JSON.parse(localStorage.getItem(STORAGE_HISTORICO) || "[]"); } catch { return []; }
}

function salvarJaNotificado(set) {
  try { localStorage.setItem(STORAGE_NOTIFICADO, JSON.stringify([...set])); } catch {}
}

function carregarJaNotificado() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_NOTIFICADO) || "[]")); } catch { return new Set(); }
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

export function useNotificacoes(issues, newPromos = []) {
  const [fila,      setFila]      = useState([]);
  const [atual,     setAtual]     = useState(null);

  // 🔥 Histórico carregado do localStorage — persiste entre recargas
  const [historico, setHistorico] = useState(() => carregarHistorico());

  // 🔥 jaNotificado carregado do localStorage — não repete após recarga
  const jaNotificado = useRef(carregarJaNotificado());

  const timerRef = useRef(null);

  // Helper para adicionar notificação ao histórico e persistir
  function adicionarNotif(notif) {
    setHistorico(h => {
      const nova = [notif, ...h].slice(0, 100); // guarda até 100
      salvarHistorico(nova);
      return nova;
    });
    jaNotificado.current.add(notif.id);
    salvarJaNotificado(jaNotificado.current);
  }

  // 🔥 Monitora newPromos — nova campanha inserida no Jira
  const prevNewPromos = useRef([]);
  useEffect(() => {
    if (newPromos.length === 0) return;

    newPromos.forEach(chave => {
      const id = `${chave}_nova`;
      if (jaNotificado.current.has(id)) return;

      const issue = issues.find(i => i.chave === chave);
      const notif = {
        id,
        chave,
        resumo:  issue?.resumo || chave,
        minutos: 0,
        horario: new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" }),
        urgente: false,
        tipo:    "nova",
        ts:      Date.now(),
        lida:    false,
      };

      adicionarNotif(notif);
      tocarSinal(false);
      setFila(prev => [...prev, notif]);
    });
  }, [newPromos]);

  // Verificação de alertas de tempo (a cada 10s)
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
          const notif = { id:`${issue.chave}_15`, chave:issue.chave, resumo:issue.resumo, minutos:15, horario, urgente:false, tipo:"encerramento", ts:Date.now(), lida:false };
          novas.push(notif);
          adicionarNotif(notif);
        }

        // Alerta 5 min antes do fim
        if (restante > 0 && restante <= ANTECEDENCIA_5 && !jaNotificado.current.has(`${issue.chave}_5`)) {
          const notif = { id:`${issue.chave}_5`, chave:issue.chave, resumo:issue.resumo, minutos:5, horario, urgente:true, tipo:"encerramento", ts:Date.now(), lida:false };
          novas.push(notif);
          adicionarNotif(notif);
        }

        // Campanha iniciando (janela de 30s)
        if (inicio && Math.abs(agora - inicio) <= 30000 && !jaNotificado.current.has(`${issue.chave}_inicio`)) {
          const hi = new Date(inicio).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
          const notif = { id:`${issue.chave}_inicio`, chave:issue.chave, resumo:issue.resumo, minutos:0, horario:hi, urgente:false, tipo:"inicio", ts:Date.now(), lida:false };
          novas.push(notif);
          adicionarNotif(notif);
        }

        // Campanha encerrando (janela de 30s)
        if (restante <= 0 && Math.abs(agora - fim) <= 30000 && !jaNotificado.current.has(`${issue.chave}_fim`)) {
          const notif = { id:`${issue.chave}_fim`, chave:issue.chave, resumo:issue.resumo, minutos:0, horario, urgente:false, tipo:"encerrada", ts:Date.now(), lida:false };
          novas.push(notif);
          adicionarNotif(notif);
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

  // Exibe próxima da fila
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

    // 🔥 marcarLidas persiste no localStorage
    marcarLidas: () => {
      setHistorico(h => {
        const atualizado = h.map(n => ({ ...n, lida: true }));
        salvarHistorico(atualizado);
        return atualizado;
      });
    },

    // 🔥 NOVO — analista pode limpar o histórico quando quiser
    limparHistorico: () => {
      setHistorico([]);
      localStorage.removeItem(STORAGE_HISTORICO);
      localStorage.removeItem(STORAGE_NOTIFICADO);
      jaNotificado.current = new Set();
    },
  };
}
