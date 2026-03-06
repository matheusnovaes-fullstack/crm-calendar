import { useState, useEffect, useRef } from "react";
import { getIssues } from "../services/api";

export function useIssues(projeto = "CP") {

  const [issues, setIssues] = useState([]);
  const [newPromos, setNewPromos] = useState([]);

  const prevKeys = useRef(new Set());

  const carregar = async () => {

    try {

      const data = await getIssues(projeto);
      const lista = data?.data || [];

      const novos = lista.filter(i => !prevKeys.current.has(i.chave));

      if (prevKeys.current.size === 0 && novos.length > 0) {
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

    const interval = setInterval(carregar, 60000);

    return () => clearInterval(interval);

  }, []);

  const issuesComStatus = issues.map(i => {

    const agora = Date.now();

    const s = i.data_inicio ? new Date(i.data_inicio).getTime() : null;
    const e = i.data_resolucao ? new Date(i.data_resolucao).getTime() : null;

    let statusDinamico = "semdata";

    if (s && e) {

      if (agora < s) statusDinamico = "agendada";
      else if (agora <= e) statusDinamico = "ativa";
      else statusDinamico = "encerrada";

    }

    return { ...i, statusDinamico };

  });

  return {
    issues: issuesComStatus,
    newPromos
  };

}
