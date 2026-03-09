import { AlertTriangle, Clock } from "lucide-react";
import { useTemaCtx } from "../App";

export default function NotificacaoPopup({ notificacao, onConfirmar }) {
  const { t } = useTemaCtx();

  if (!notificacao) return null;

  const urgente = notificacao.minutos <= 5;
  const cor     = urgente ? "#F87171" : "#FBBF24";
  const corBg   = urgente ? "rgba(239,68,68,0.15)"  : "rgba(251,191,36,0.12)";
  const corBd   = urgente ? "rgba(239,68,68,0.3)"   : "rgba(251,191,36,0.3)";
  const shadow  = urgente ? "rgba(239,68,68,0.4)"   : "rgba(99,102,241,0.4)";
  const btnBg   = urgente ? "linear-gradient(135deg,#EF4444,#DC2626)" : "linear-gradient(135deg,#6366F1,#4F46E5)";

  return (
    <>
      {/* Overlay — fecha ao clicar fora */}
      <div
        onClick={onConfirmar}
        style={{
          position:"fixed", inset:0,
          background:"rgba(0,0,0,0.6)",
          backdropFilter:"blur(4px)",
          zIndex:9000,
          animation:"fadeIn 0.2s ease",
          cursor:"pointer"
        }}
      />

      {/* Modal — z-index maior que o overlay, pointer-events garantidos */}
      <div style={{
        position:"fixed", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        zIndex:9001,
        pointerEvents:"all",
        background:t.card,
        border:`1.5px solid ${corBd}`,
        borderRadius:16,
        padding:"32px 36px",
        width:420,
        boxShadow:`0 24px 60px rgba(0,0,0,0.6), 0 0 40px ${corBg}`,
        animation:"slideUp 0.25s ease",
        transition:"background 0.2s"
      }}>

        <div style={{
          width:52, height:52, borderRadius:14,
          background:corBg, border:`1px solid ${corBd}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          marginBottom:20
        }}>
          <AlertTriangle size={24} color={cor} strokeWidth={2} />
        </div>

        <p style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:cor, marginBottom:8 }}>
          {urgente ? "ENCERRAMENTO IMINENTE" : "AVISO DE ENCERRAMENTO"}
        </p>

        <h2 style={{ fontSize:18, fontWeight:800, color:t.text, marginBottom:6, lineHeight:1.3 }}>
          Faltam {notificacao.minutos} minutos
        </h2>

        <p style={{ fontSize:13, color:t.textSub, marginBottom:20, lineHeight:1.6 }}>
          A campanha{" "}
          <span style={{ color:t.text, fontWeight:600 }}>"{notificacao.resumo}"</span>
          {" "}({notificacao.chave}) encerra às{" "}
          <span style={{ color:t.text, fontWeight:600 }}>{notificacao.horario}</span>.
        </p>

        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:t.cardAlt, borderRadius:8, padding:"10px 14px",
          marginBottom:24, border:`1px solid ${t.border}`
        }}>
          <Clock size={13} color={t.textMuted} strokeWidth={2} />
          <span style={{ fontSize:12, color:t.textMuted }}>Encerramento programado:</span>
          <span style={{ fontSize:12, color:t.textSub, fontWeight:600 }}>{notificacao.horario}</span>
        </div>

        <button
          onClick={onConfirmar}
          style={{
            width:"100%", padding:"12px",
            background:btnBg,
            color:"#fff", border:"none", borderRadius:10,
            fontSize:13, fontWeight:700, cursor:"pointer",
            boxShadow:`0 4px 14px ${shadow}`,
            letterSpacing:0.5, transition:"opacity 0.15s",
            position:"relative", zIndex:1
          }}
          onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity="1"}
        >
          ENTENDIDO
        </button>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
      `}</style>
    </>
  );
}
