import { useEffect, useRef, useState } from "react";

export function useNotificacoes(issues = []) {
  const [notificacao, setNotificacao] = useState(null);
  const notificadas = useRef(new Set());

  useEffect(() => {
    if (!Array.isArray(issues) || issues.length === 0) return;

    const intervalo = setInterval(() => {
      const agora = Date.now();

      issues.forEach((issue) => {
        if (!issue || !issue.data_resolucao) return;

        let fimDate = new Date(issue.data_resolucao);

        if (isNaN(fimDate.getTime())) return;

        // Corrige problema quando Jira envia data sem horário
        if (
          fimDate.getHours() === 0 &&
          fimDate.getMinutes() === 0 &&
          fimDate.getSeconds() === 0
        ) {
          fimDate.setHours(23, 59, 59, 999);
        }

        const fim = fimDate.getTime();
        const restante = fim - agora;
        const minutos = Math.floor(restante / 60000);

        const id15 = `${issue.key}-15`;
        const id5 = `${issue.key}-5`;
        const id0 = `${issue.key}-0`;

        if (minutos <= 15 && minutos > 5 && !notificadas.current.has(id15)) {
          notificadas.current.add(id15);

          setNotificacao({
            tipo: "alerta",
            minutos: 15,
            issue,
          });
        }

        if (minutos <= 5 && minutos > 0 && !notificadas.current.has(id5)) {
          notificadas.current.add(id5);

          setNotificacao({
            tipo: "alerta",
            minutos: 5,
            issue,
          });
        }

        if (minutos <= 0 && !notificadas.current.has(id0)) {
          notificadas.current.add(id0);

          setNotificacao({
            tipo: "encerramento",
            minutos: 0,
            issue,
          });
        }
      });
    }, 30000);

    return () => clearInterval(intervalo);
  }, [issues]);

  return { notificacao };
}
