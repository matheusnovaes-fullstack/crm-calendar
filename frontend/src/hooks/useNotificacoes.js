import { useEffect, useRef } from "react";

export function useNotificacoes(issues = [], onNotificar) {
  const notificadas = useRef(new Set());

  useEffect(() => {
    if (!issues || issues.length === 0) return;

    const intervalo = setInterval(() => {
      const agora = Date.now();

      issues.forEach((issue) => {
        if (!issue?.data_resolucao) return;

        let fimDate = new Date(issue.data_resolucao);

        // 🔧 CORREÇÃO:
        // Se o Jira mandar data sem horário (00:00:00),
        // assumimos que o encerramento é no final do dia
        if (
          fimDate.getHours() === 0 &&
          fimDate.getMinutes() === 0 &&
          fimDate.getSeconds() === 0
        ) {
          fimDate.setHours(23, 59, 59, 999);
        }

        const fim = fimDate.getTime();
        const restante = fim - agora;

        if (restante <= 0) return;

        const minutos = Math.floor(restante / 60000);

        const id15 = `${issue.key}-15`;
        const id5 = `${issue.key}-5`;
        const id0 = `${issue.key}-0`;

        // 🔔 alerta 15 min
        if (minutos <= 15 && minutos > 5 && !notificadas.current.has(id15)) {
          notificadas.current.add(id15);

          onNotificar({
            tipo: "alerta",
            minutos: 15,
            issue,
          });
        }

        // 🔔 alerta 5 min
        if (minutos <= 5 && minutos > 0 && !notificadas.current.has(id5)) {
          notificadas.current.add(id5);

          onNotificar({
            tipo: "alerta",
            minutos: 5,
            issue,
          });
        }

        // 🚨 encerramento
        if (minutos <= 0 && !notificadas.current.has(id0)) {
          notificadas.current.add(id0);

          onNotificar({
            tipo: "encerramento",
            minutos: 0,
            issue,
          });
        }
      });
    }, 30000); // checa a cada 30s

    return () => clearInterval(intervalo);
  }, [issues, onNotificar]);
}
