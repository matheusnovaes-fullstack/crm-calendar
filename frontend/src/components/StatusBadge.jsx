import { useTemaCtx } from "../App";

export default function StatusBadge({ inicio, fim }) {
  const { t } = useTemaCtx();

  const agora = new Date();
  const start = inicio ? new Date(inicio) : null;
  const end   = fim    ? new Date(fim)    : null;

  let label, bg, color, border, dot;

  if (!start && !end) {
    label = "Sem data";
    bg = t.cardAlt; color = t.textMuted; border = t.border; dot = t.textMuted;
  } else if (start && agora < start) {
    label = "Agendada";
    bg = "rgba(139,92,246,0.12)"; color = "#A78BFA"; border = "rgba(139,92,246,0.3)"; dot = "#A78BFA";
  } else if (start && end && agora >= start && agora <= end) {
    label = "Rodando";
    bg = "rgba(16,185,129,0.12)"; color = "#10B981"; border = "rgba(16,185,129,0.3)"; dot = "#10B981";
  } else {
    const diff    = Math.floor((agora - end) / 60000);
    const horas   = Math.floor(diff / 60);
    const minutos = diff % 60;
    label  = horas > 0 ? `Encerrada há ${horas}h ${minutos}min` : `Encerrada há ${minutos}min`;
    bg     = "rgba(239,68,68,0.12)"; color = "#F87171"; border = "rgba(239,68,68,0.3)"; dot = "#EF4444";
  }

  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      background:bg, color, border:`1px solid ${border}`,
      padding:"4px 10px", borderRadius:20,
      fontSize:11, fontWeight:600, whiteSpace:"nowrap"
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:dot, flexShrink:0 }} />
      {label}
    </span>
  );
}
