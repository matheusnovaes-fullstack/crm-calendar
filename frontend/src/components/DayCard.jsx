import { useIssuesCtx, useTemaCtx } from "../App";

export default function KPICards({ issues }) {
  const { t } = useTemaCtx();

  const total       = issues.length;
  const emAndamento = issues.filter(i => i.status === "Em Andamento").length;
  const fechados    = issues.filter(i => i.status === "Fechado").length;
  const breached    = issues.filter(i => i.sla_breached).length;

  const cards = [
    { label:"Total de Issues", value:total,       icon:"📋", color:"#1D4ED8" },
    { label:"Em Andamento",    value:emAndamento,  icon:"🔄", color:"#B45309" },
    { label:"Fechados",        value:fechados,     icon:"✅", color:"#15803D" },
    { label:"SLA Estourado",   value:breached,     icon:"🚨", color:"#B91C1C" },
  ];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:24 }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius:12, padding:20,
          boxShadow:"0 1px 4px rgba(0,0,0,0.08)",
          transition:"background 0.2s"
        }}>
          <p style={{ fontSize:13, color:t.textMuted }}>{c.icon} {c.label}</p>
          <p style={{ fontSize:36, fontWeight:700, color:c.color, marginTop:4 }}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
