import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function SLAChart({ issues }) {
  const data = [
    { name: "No Prazo",   value: issues.filter(i => !i.sla_breached).length, cor: "#10B981" },
    { name: "Estourado",  value: issues.filter(i =>  i.sla_breached).length, cor: "#EF4444" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>🚨 Status do SLA</h3>
      <BarChart width={380} height={250} data={data}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.cor} />)}
        </Bar>
      </BarChart>
    </div>
  );
}
