export default function IssuesTable({ issues }) {
  const cols = [
    { key: "chave",        label: "Chave"        },
    { key: "resumo",       label: "Resumo"       },
    { key: "request_type", label: "Request Type" },
    { key: "componente",   label: "Componente"   },
    { key: "status",       label: "Status"       },
    { key: "prioridade",   label: "Prioridade"   },
    { key: "responsavel",  label: "Responsável"  },
    { key: "sla_tempo",    label: "SLA Tempo"    },
    { key: "sla_restante", label: "SLA Restante" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflowX: "auto" }}>
      <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>📋 Todas as Issues</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F9FAFB" }}>
            {cols.map(c => (
              <th key={c.key} style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #E5E7EB", color: "#6B7280", fontWeight: 600 }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.chave} style={{ borderBottom: "1px solid #F3F4F6" }}
              onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {cols.map(c => (
                <td key={c.key} style={{ padding: "10px 12px" }}>
                  {c.key === "sla_breached"
                    ? issue[c.key] ? "🔴 Sim" : "🟢 Não"
                    : issue[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
