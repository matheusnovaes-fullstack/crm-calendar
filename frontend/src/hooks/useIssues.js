import { useState, useEffect, useRef } from "react";
import { getIssues } from "../services/api";

export function useIssues(projeto = "CP") {
  const [issues,    setIssues]    = useState([]);
  const [newPromos, setNewPromos] = useState([]);
  const [tick,      setTick]      = useState(0);
  const prevKeys = useRef(new Set());

  const carregar = async () => {
    try {
      const { data } = await getIssues(projeto);
      const lista = data?.data || [];
      const novos = lista.filter(i => !prevKeys.current.has(i.chave));
      if (prevKeys.current.size > 0 && novos.length > 0) {
        setNewPromos(novos.map(i => i.chave));
        setTimeout(() => setNewPromos([]), 10000);
      }
      prevKeys.current = new Set(lista.map(i => i.chave));
      setIssues(lista);
    } catch (e) {
      console.error("Erro ao buscar issues:", e);
    }
  };

  useEffect(() => {
    carregar();
    const fetchInterval = setInterval(carregar, 60 * 1000);
    const tickInterval  = setInterval(() => setTick(t => t + 1), 30 * 1000);
    return () => { clearInterval(fetchInterval); clearInterval(tickInterval); };
  }, []); // eslint-disable-line

  const issuesComStatus = issues.map(i => {
    const agora = Date.now();
    const s = i.data_inicio    ? new Date(i.data_inicio).getTime()    : null;
    const e = i.data_resolucao ? new Date(i.data_resolucao).getTime() : null;

    let statusDinamico = "sem_data";
    if (s && e) {
      if (agora < s)                     statusDinamico = "agendada";
      else if (agora >= s && agora <= e) statusDinamico = "ativa";
      else                               statusDinamico = "encerrada";
    }

    // 🔥 NOVOS CAMPOS
    const segmento   = i.segmento   || i.customfield_17929?.value || i.customfield_17929?.[0]?.value || "—";
    const tipoPremio = i.tipo_premio || i.customfield_17930?.value || i.customfield_17930?.[0]?.value || "—";

    return { ...i, statusDinamico, segmento, tipoPremio };
  });

  return { issues: issuesComStatus, newPromos, recarregar: carregar, tick };
}
