export default function KPICards({ issues }) {
  const total       = issues.length;
  const emAndamento = issues.filter(i => i.status === "Em Andamento").length;
  const fechados    = issues.filter(i => i.status === "Fechado").length;
  const breached    = issues.filter(i => i.sla_breached).length;

  const cards = [
    { label: "Total de Issues", value: total,       icon: "📋", bg: "#EFF6FF", color: "#1D4ED8" },
    { label: "Em Andamento",    value: emAndamento,  icon: "🔄", bg: "#FFFBEB", color: "#B45309" },
    { label: "Fechados",        value: fechados,     icon: "✅", bg: "#F0FDF4", color: "#15803D" },
    { label: "SLA Estourado",   value: breached,     icon: "🚨", bg: "#FEF2F2", color: "#B91C1C" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
      {cards.map((c) => (
        <div key={c.label} style={{ background: c.bg, borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <p style={{ fontSize: 13, color: "#6B7280" }}>{c.icon} {c.label}</p>
          <p style={{ fontSize: 36, fontWeight: 700, color: c.color, marginTop: 4 }}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
