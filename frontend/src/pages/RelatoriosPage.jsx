import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIssues } from "../services/api";

const SIDEBAR = [
  { icon:"📅", label:"Calendário", path:"/"           },
  { icon:"📋", label:"Campanhas",  path:"/campanhas"  },
  { icon:"📊", label:"Relatórios", path:"/relatorios" },
];

export default function RelatoriosPage() {
  const navigate = useNavigate();
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIssues("CP")
      .then(({ data }) => setIssues(data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const agora = new Date();

  function getStatus(i) {
    if (!i.data_inicio || !i.data_resolucao) return "sem_data";
    const s = new Date(i.data_inicio);
    const e = new Date(i.data_resolucao);
    if (agora < s) return "agendada";
    if (agora >= s && agora <= e) return "ativa";
    return "encerrada";
  }

  const ativas     = issues.filter(i => getStatus(i) === "ativa");
  const encerradas = issues.filter(i => getStatus(i) === "encerrada");
  const agendadas  = issues.filter(i => getStatus(i) === "agendada");

  // Campanhas por mês (data_inicio)
  const porMes = {};
  issues.forEach(i => {
    if (!i.data_inicio) return;
    const d   = new Date(i.data_inicio);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    porMes[key] = (porMes[key] || 0) + 1;
  });
  const mesesOrdenados = Object.entries(porMes).sort(([a],[b]) => a.localeCompare(b));
  const maxMes         = Math.max(...mesesOrdenados.map(([,v]) => v), 1);

  // Campanhas por componente
  const porComp = {};
  issues.forEach(i => {
    const k = i.componente || "Sem componente";
    porComp[k] = (porComp[k] || 0) + 1;
  });
  const compOrdenados = Object.entries(porComp).sort(([,a],[,b]) => b-a);
  const maxComp       = Math.max(...compOrdenados.map(([,v]) => v), 1);

  const formatMes = (key) => {
    const [y, m] = key.split("-");
    return new Date(+y, +m-1).toLocaleDateString("pt-BR", { month:"short", year:"2-digit" });
  };

  const barColors = ["#6366F1","#8B5CF6","#A78BFA","#818CF8","#4F46E5"];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020817", fontFamily:"Inter,sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width:240, background:"#050E1F", borderRight:"1px solid #0D1F3C", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid #0D1F3C" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 4px 12px rgba(99,102,241,0.4)" }}>♠</div>
            <div>
              <p style={{ fontSize:14, fontWeight:800, color:"#F1F5F9" }}>CRM Calendar</p>
              <p style={{ fontSize:10, color:"#6366F1", marginTop:1 }}>iGaming · Campanhas</p>
            </div>
          </div>
        </div>
        <nav style={{ padding:"16px 12px", flex:1 }}>
          <p style={{ fontSize:9, color:"#1E3A5F", fontWeight:700, letterSpacing:1.5, padding:"0 8px 10px" }}>MENU</p>
          {SIDEBAR.map(item => {
            const active = item.path === "/relatorios";
            return (
              <div key={item.label} onClick={() => navigate(item.path)} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                borderRadius:8, marginBottom:2,
                background: active ? "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))" : "transparent",
                color: active ? "#A5B4FC" : "#334155",
                fontWeight: active ? 600 : 400, fontSize:13, cursor:"pointer",
                border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              }}>
                {item.icon} {item.label}
              </div>
            );
          })}
        </nav>
        <div style={{ padding:"16px 20px", borderTop:"1px solid #0D1F3C", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>C</div>
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:"#94A3B8" }}>Time CRM</p>
            <p style={{ fontSize:10, color:"#1E3A5F" }}>Ana Gaming</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <div style={{ width:3, height:20, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
          <h1 style={{ fontSize:20, fontWeight:800, color:"#F1F5F9" }}>Relatórios</h1>
        </div>
        <p style={{ fontSize:12, color:"#334155", paddingLeft:13, marginBottom:24 }}>Visão analítica das campanhas promocionais</p>

        {loading ? (
          <div style={{ textAlign:"center", color:"#1E3A5F", paddingTop:80 }}>⏳ Carregando dados...</div>
        ) : (
          <>
            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
              {[
                { label:"Total de Campanhas", value:issues.length,     color:"#6366F1", icon:"📋" },
                { label:"Ativas agora",        value:ativas.length,     color:"#10B981", icon:"🟢" },
                { label:"Encerradas",          value:encerradas.length, color:"#F87171", icon:"🔴" },
                { label:"Agendadas",           value:agendadas.length,  color:"#A78BFA", icon:"⏳" },
              ].map(k => (
                <div key={k.label} style={{ background:"#050E1F", border:`1px solid ${k.color}22`, borderRadius:12, padding:"18px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <p style={{ fontSize:11, color:"#334155", marginBottom:8 }}>{k.label}</p>
                      <p style={{ fontSize:32, fontWeight:800, color:k.color }}>{k.value}</p>
                    </div>
                    <span style={{ fontSize:22, opacity:0.5 }}>{k.icon}</span>
                  </div>
                  <div style={{ marginTop:12, height:3, background:"#0D1F3C", borderRadius:2 }}>
                    <div style={{ height:3, background:k.color, borderRadius:2, width:`${issues.length > 0 ? (k.value/issues.length)*100 : 0}%`, transition:"width 0.5s" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

              {/* Gráfico por mês */}
              <div style={{ background:"#050E1F", border:"1px solid #0D1F3C", borderRadius:12, padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                  <div style={{ width:3, height:14, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
                  <p style={{ fontSize:12, fontWeight:700, color:"#475569" }}>CAMPANHAS POR MÊS</p>
                </div>
                {mesesOrdenados.length === 0 ? (
                  <p style={{ color:"#1E3A5F", fontSize:12, textAlign:"center", paddingTop:20 }}>Sem dados</p>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {mesesOrdenados.map(([key, count], idx) => (
                      <div key={key}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:11, color:"#475569" }}>{formatMes(key)}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:"#6366F1" }}>{count}</span>
                        </div>
                        <div style={{ height:8, background:"#0A1628", borderRadius:4 }}>
                          <div style={{ height:8, borderRadius:4, width:`${(count/maxMes)*100}%`, background:`linear-gradient(90deg,${barColors[idx%barColors.length]},${barColors[(idx+1)%barColors.length]})`, transition:"width 0.5s" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gráfico por componente */}
              <div style={{ background:"#050E1F", border:"1px solid #0D1F3C", borderRadius:12, padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                  <div style={{ width:3, height:14, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
                  <p style={{ fontSize:12, fontWeight:700, color:"#475569" }}>CAMPANHAS POR COMPONENTE</p>
                </div>
                {compOrdenados.length === 0 ? (
                  <p style={{ color:"#1E3A5F", fontSize:12, textAlign:"center", paddingTop:20 }}>Sem dados</p>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {compOrdenados.map(([comp, count], idx) => (
                      <div key={comp}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:11, color:"#475569" }}>{comp}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:barColors[idx%barColors.length] }}>{count}</span>
                        </div>
                        <div style={{ height:8, background:"#0A1628", borderRadius:4 }}>
                          <div style={{ height:8, borderRadius:4, width:`${(count/maxComp)*100}%`, background:barColors[idx%barColors.length], transition:"width 0.5s" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Últimas encerradas */}
              <div style={{ background:"#050E1F", border:"1px solid #0D1F3C", borderRadius:12, padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                  <div style={{ width:3, height:14, background:"linear-gradient(180deg,#F87171,#EF4444)", borderRadius:2 }} />
                  <p style={{ fontSize:12, fontWeight:700, color:"#475569" }}>ÚLTIMAS ENCERRADAS</p>
                </div>
                {encerradas.length === 0 ? (
                  <p style={{ color:"#1E3A5F", fontSize:12, textAlign:"center", paddingTop:20 }}>Nenhuma encerrada</p>
                ) : encerradas.slice(0,5).map(i => (
                  <div key={i.chave} onClick={() => navigate(`/promo/${i.chave}`)}
                    style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #080F1E", cursor:"pointer" }}
                    onMouseEnter={e => e.currentTarget.style.opacity="0.7"}
                    onMouseLeave={e => e.currentTarget.style.opacity="1"}
                  >
                    <div>
                      <span style={{ fontSize:11, color:"#818CF8", fontWeight:700 }}>{i.chave} </span>
                      <span style={{ fontSize:12, color:"#94A3B8" }}>{(i.resumo||"").slice(0,40)}{i.resumo?.length>40?"...":""}</span>
                    </div>
                    <span style={{ fontSize:10, color:"#F87171", whiteSpace:"nowrap", marginLeft:10 }}>
                      {i.data_resolucao ? new Date(i.data_resolucao).toLocaleDateString("pt-BR") : "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Ativas agora */}
              <div style={{ background:"#050E1F", border:"1px solid #0D1F3C", borderRadius:12, padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                  <div style={{ width:3, height:14, background:"linear-gradient(180deg,#10B981,#059669)", borderRadius:2 }} />
                  <p style={{ fontSize:12, fontWeight:700, color:"#475569" }}>ATIVAS AGORA</p>
                </div>
                {ativas.length === 0 ? (
                  <p style={{ color:"#1E3A5F", fontSize:12, textAlign:"center", paddingTop:20 }}>Nenhuma campanha ativa</p>
                ) : ativas.slice(0,5).map(i => (
                  <div key={i.chave} onClick={() => navigate(`/promo/${i.chave}`)}
                    style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #080F1E", cursor:"pointer" }}
                    onMouseEnter={e => e.currentTarget.style.opacity="0.7"}
                    onMouseLeave={e => e.currentTarget.style.opacity="1"}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", flexShrink:0 }} />
                      <div>
                        <span style={{ fontSize:11, color:"#818CF8", fontWeight:700 }}>{i.chave} </span>
                        <span style={{ fontSize:12, color:"#94A3B8" }}>{(i.resumo||"").slice(0,35)}{i.resumo?.length>35?"...":""}</span>
                      </div>
                    </div>
                    <span style={{ fontSize:10, color:"#10B981", whiteSpace:"nowrap", marginLeft:10 }}>
                      até {i.data_resolucao ? new Date(i.data_resolucao).toLocaleDateString("pt-BR") : "—"}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
