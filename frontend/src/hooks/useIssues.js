import { useState, useEffect, useRef } from "react";
import { getIssues } from "../services/api";

export function useIssues(projeto = "CP") {
  const [issues,    setIssues]    = useState([]);
  const [newPromos, setNewPromos] = useState([]);
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
    const run = async () => { await carregar(); };
    run();
    const interval = setInterval(run, 60 * 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { issues, newPromos, recarregar: carregar };
}
