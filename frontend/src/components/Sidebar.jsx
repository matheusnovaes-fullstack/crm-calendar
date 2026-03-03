import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, LayoutList, BarChart2, Spade } from "lucide-react";

const MARCAS = [
  { slug: "a7kbetbr",     label: "7K",      color: "#6366F1" },
  { slug: "cassinobetbr", label: "Cassino", color: "#3B82F6" },
  { slug: "verabetbr",    label: "Vera",    color: "#10B981" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path     = location.pathname;

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
    <aside style={{ width:240, background:"#050E1F", borderRight:"1px solid #0D1F3C", display:"flex", flexDirection:"column", flexShrink:0, minHeight:"100vh" }}>

      {/* Logo */}
      <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid #0D1F3C" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(99,102,241,0.4)" }}>
            <Spade size={18} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:"#F1F5F9" }}>CRM Calendar</p>
            <p style={{ fontSize:10, color:"#818CF8", marginTop:1 }}>iGaming · Campanhas</p>
          </div>
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
  );
}
