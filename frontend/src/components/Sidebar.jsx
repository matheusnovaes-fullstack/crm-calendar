import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, LayoutList, BarChart2, Spade, Bell, X, PlayCircle, StopCircle, Clock } from "lucide-react";

const MARCAS = [
  { slug: "a7kbetbr",     label: "7K",      color: "#6366F1" },
  { slug: "cassinobetbr", label: "Cassino", color: "#3B82F6" },
  { slug: "verabetbr",    label: "Vera",    color: "#10B981" },
];

function IconeTipo({ tipo }) {
  if (tipo === "inicio")     return <PlayCircle  size={13} color="#34D399" strokeWidth={2} />;
  if (tipo === "encerrada")  return <StopCircle  size={13} color="#F87171" strokeWidth={2} />;
  return                            <Clock       size={13} color="#FBBF24" strokeWidth={2} />;
}

function labelTipo(n) {
  if (n.tipo === "inicio")    return "Campanha iniciada";
  if (n.tipo === "encerrada") return "Campanha encerrada";
  return `Encerra em ${n.minutos} min`;
}

export default function Sidebar({ historico = [], totalNaoLidas = 0, marcarLidas = () => {} }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;
  const [sinoAberto, setSinoAberto] = useState(false);

  function toggleSino() {
    setSinoAberto(v => {
      if (!v) marcarLidas();
      return !v;
    });
  }

  const navItem = (itemPath, Icon, label) => {
    const active = path === itemPath || (itemPath !== "/" && path.startsWith(itemPath));
    return (
      <div onClick={() => navigate(itemPath)} style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"10px 12px", borderRadius:8, marginBottom:2,
        background: active ? "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))" : "transparent",
        color: active ? "#A5B4FC" : "#64748B",
        fontWeight: active ? 600 : 400, fontSize:13, cursor:"pointer",
        border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
        transition:"all 0.15s"
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background="#0A1628"; e.currentTarget.style.color="#94A3B8"; }}}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#64748B"; }}}
      >
        <Icon size={15} strokeWidth={1.8} /> {label}
      </div>
    );
  };

  return (
    <>
      <aside style={{ width:240, background:"#050E1F", borderRight:"1px solid #0D1F3C", display:"flex", flexDirection:"column", flexShrink:0, minHeight:"100vh", position:"relative", zIndex:100 }}>

        {/* Logo */}
        <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid #0D1F3C" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(99,102,241,0.4)" }}>
                <Spade size={18} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:"#F1F5F9" }}>CRM Calendar</p>
                <p style={{ fontSize:10, color:"#818CF8", marginTop:1 }}>iGaming · Campanhas</p>
              </div>
            </div>

            {/* Sininho */}
            <button onClick={toggleSino} style={{
              position:"relative", background:"transparent", border:"none",
              cursor:"pointer", padding:4, borderRadius:8,
              color: sinoAberto ? "#A5B4FC" : "#475569",
              transition:"color 0.15s"
            }}>
              <Bell size={16} strokeWidth={1.8} />
              {totalNaoLidas > 0 && (
                <span style={{
                  position:"absolute", top:0, right:0,
                  width:8, height:8, borderRadius:"50%",
                  background:"#EF4444",
                  boxShadow:"0 0 6px rgba(239,68,68,0.8)",
                  border:"1.5px solid #050E1F",
                  animation:"pulseDot 1.5s infinite"
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Nav principal */}
        <nav style={{ padding:"16px 12px" }}>
          <p style={{ fontSize:9, color:"#334155", fontWeight:700, letterSpacing:1.5, padding:"0 8px 10px" }}>MENU</p>
          {navItem("/",           Calendar,    "Calendário")}
          {navItem("/campanhas",  LayoutList,  "Campanhas" )}
          {navItem("/relatorios", BarChart2,   "Relatórios")}
        </nav>

        {/* Filtro por marca */}
        <div style={{ padding:"0 12px" }}>
          <p style={{ fontSize:9, color:"#334155", fontWeight:700, letterSpacing:1.5, padding:"0 8px 12px" }}>FILTRAR POR MARCA</p>
          {MARCAS.map(m => {
            const active = path === `/campanhas/${m.slug}`;
            return (
              <div key={m.slug} onClick={() => navigate(`/campanhas/${m.slug}`)}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"9px 12px", borderRadius:8, marginBottom:3, cursor:"pointer",
                  background: active ? `${m.color}18` : "transparent",
                  border: active ? `1px solid ${m.color}44` : "1px solid transparent",
                  transition:"all 0.15s"
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background="#0A1628"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background="transparent"; }}
              >
                <div style={{ width:7, height:7, borderRadius:"50%", background:m.color, flexShrink:0 }} />
                <span style={{ fontSize:12, color: active ? m.color : "#64748B", fontWeight: active ? 600 : 400 }}>{m.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ flex:1 }} />

        {/* User */}
        <div style={{ padding:"16px 20px", borderTop:"1px solid #0D1F3C", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>C</div>
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:"#CBD5E1" }}>Time CRM</p>
            <p style={{ fontSize:10, color:"#475569" }}>Ana Gaming</p>
          </div>
        </div>
      </aside>

      {/* Painel de notificações */}
      {sinoAberto && (
        <>
          <div onClick={() => setSinoAberto(false)} style={{ position:"fixed", inset:0, zIndex:98 }} />
          <div style={{
            position:"fixed", top:0, left:240, height:"100vh",
            width:320, background:"#050E1F",
            borderRight:"1px solid #0D1F3C",
            zIndex:99, display:"flex", flexDirection:"column",
            boxShadow:"4px 0 24px rgba(0,0,0,0.4)",
            animation:"slideInLeft 0.2s ease"
          }}>
            {/* Header painel */}
            <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid #0D1F3C", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:"#F1F5F9" }}>Notificações</p>
                <p style={{ fontSize:10, color:"#334155", marginTop:2 }}>{historico.length} registro(s)</p>
              </div>
              <button onClick={() => setSinoAberto(false)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"#475569" }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Lista */}
            <div style={{ flex:1, overflowY:"auto", padding:"12px 0" }}>
              {historico.length === 0 ? (
                <div style={{ textAlign:"center", color:"#1E3A5F", paddingTop:60 }}>
                  <Bell size={28} strokeWidth={1.2} style={{ margin:"0 auto 12px", display:"block", opacity:0.3 }} />
                  <p style={{ fontSize:12 }}>Nenhuma notificação ainda</p>
                </div>
              ) : historico.map((n, i) => (
                <div key={n.id} style={{
                  padding:"12px 20px",
                  borderBottom:"1px solid #080F1E",
                  background: n.lida ? "transparent" : "rgba(99,102,241,0.04)",
                  transition:"background 0.15s"
                }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ marginTop:1 }}><IconeTipo tipo={n.tipo} /></div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:
                          n.tipo === "inicio" ? "#34D399" :
                          n.tipo === "encerrada" ? "#F87171" : "#FBBF24"
                        }}>{labelTipo(n)}</span>
                        <span style={{ fontSize:9, color:"#1E3A5F" }}>
                          {new Date(n.ts).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}
                        </span>
                      </div>
                      <p style={{ fontSize:11, color:"#64748B", fontWeight:600, marginBottom:2 }}>{n.chave}</p>
                      <p style={{ fontSize:11, color:"#334155", lineHeight:1.4 }}>
                        {(n.resumo||"").slice(0, 55)}{n.resumo?.length > 55 ? "..." : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulseDot {
          0%,100% { transform: scale(1); opacity:1; }
          50%      { transform: scale(1.4); opacity:0.7; }
        }
        @keyframes slideInLeft {
          from { opacity:0; transform: translateX(-12px); }
          to   { opacity:1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
