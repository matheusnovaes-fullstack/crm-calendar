import { Wrench } from "lucide-react";

export default function ManutencaoScreen({ titulo, mensagem, previsao }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      minHeight:"100vh", background:"#020817", fontFamily:"Inter,sans-serif",
      padding:32, textAlign:"center"
    }}>

      {/* Ícone animado */}
      <div style={{
        width:72, height:72, borderRadius:20,
        background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))",
        border:"1px solid rgba(99,102,241,0.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        marginBottom:28, animation:"balanco 2s ease-in-out infinite"
      }}>
        <Wrench size={32} color="#818CF8" strokeWidth={1.8} />
      </div>

      {/* Barra de progresso infinita */}
      <div style={{ width:280, height:3, background:"#0D1F3C", borderRadius:2, marginBottom:32, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:"45%",
          background:"linear-gradient(90deg,#6366F1,#8B5CF6)",
          borderRadius:2, animation:"slide 1.8s ease-in-out infinite"
        }} />
      </div>

      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
        <div style={{ width:3, height:18, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
        <span style={{ fontSize:13, fontWeight:700, color:"#475569", letterSpacing:1 }}>CRM CALENDAR</span>
      </div>

      <h1 style={{ fontSize:22, fontWeight:800, color:"#F1F5F9", marginBottom:12, maxWidth:400 }}>
        {titulo}
      </h1>

      <p style={{ fontSize:14, color:"#475569", lineHeight:1.7, maxWidth:380, marginBottom: previsao ? 20 : 0 }}>
        {mensagem}
      </p>

      {previsao && (
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)",
          borderRadius:8, padding:"8px 16px", marginTop:8
        }}>
          <span style={{ fontSize:12, color:"#818CF8", fontWeight:600 }}>
            Previsão de retorno: {previsao}
          </span>
        </div>
      )}

      <style>{`
        @keyframes balanco {
          0%,100% { transform: rotate(-8deg); }
          50%      { transform: rotate(8deg);  }
        }
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(320%);  }
        }
      `}</style>
    </div>
  );
}
