// CalendarPage.jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIssuesCtx, useNotificacoesCtx, useTemaCtx } from "../App";
import Sidebar from "../components/Sidebar";
import NotificacaoPopup from "../components/NotificacaoPopup";
import { RefreshCw, AlertTriangle, HelpCircle, Search, User } from "lucide-react";

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay(); }

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function Tooltip({ campanhas, t }) {
  if (!campanhas.length) return null;
  return (
    <div style={{
      position:"absolute", zIndex:999, bottom:"calc(100% + 8px)", left:"50%",
      transform:"translateX(-50%)",
      background:t.cardHover, border:`1px solid ${t.border}`,
      borderRadius:8, padding:"8px 12px", minWidth:180, maxWidth:240,
      boxShadow:"0 8px 24px rgba(0,0,0,0.3)", pointerEvents:"none",
    }}>
      {campanhas.map(c => (
        <div key={c.chave} style={{ marginBottom:6, paddingBottom:6, borderBottom:`1px solid ${t.border}` }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#818CF8", marginBottom:2 }}>{c.chave}</p>
          <p style={{ fontSize:11, color:t.textSub, lineHeight:1.4 }}>{c.resumo || c.chave}</p>
          <p style={{ fontSize:10, marginTop:2, fontWeight:600, textTransform:"uppercase",
            color: c.statusDinamico==="ativa" ? "#34D399" : c.statusDinamico==="encerrada" ? "#F87171" : "#A78BFA"
          }}>{c.statusDinamico}</p>
        </div>
      ))}
      <div style={{
        position:"absolute", bottom:-5, left:"50%", transform:"translateX(-50%)",
        width:10, height:10, background:t.cardHover,
        border:`1px solid ${t.border}`, borderTop:"none", borderLeft:"none", rotate:"45deg"
      }} />
    </div>
  );
}

export default function CalendarPage({ onAbrirTutorial }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { issues, newPromos, recarregar }                    = useIssuesCtx();
  const { notificacao, confirmar, historico, totalNaoLidas, marcarLidas } = useNotificacoesCtx();
  const { t }                                                = useTemaCtx();

  const hoje = new Date();
  const [ano, setAno] = useState(() => parseInt(searchParams.get("ano")) || hoje.getFullYear());
  const [mes, setMes] = useState(() => parseInt(searchParams.get("mes")) || hoje.getMonth());
  const [busca,      setBusca]      = useState("");
  const [filtroResp, setFiltroResp] = useState("todos");
  const [tooltipDia, setTooltipDia] = useState(null);

  const responsaveis = ["todos", ...Array.from(new Set(issues.map(i => i.responsavel).filter(Boolean))).sort()];

  function navMes(dir) {
    let novoMes = mes + dir, novoAno = ano;
    if (novoMes < 0)  { novoMes = 11; novoAno--; }
    if (novoMes > 11) { novoMes = 0;  novoAno++; }
    setMes(novoMes); setAno(novoAno);
    setSearchParams({ mes: novoMes, ano: novoAno });
  }

  const issuesFiltradas = issues.filter(i => {
    const matchResp  = filtroResp === "todos" || i.responsavel === filtroResp;
    const matchBusca = busca === "" ||
      i.chave?.toLowerCase().includes(busca.toLowerCase()) ||
      (i.resumo||"").toLowerCase().includes(busca.toLowerCase());
    return matchResp && matchBusca;
  });

  function campanhasNoDia(dia) {
    const data = new Date(ano, mes, dia, 12);
    return issuesFiltradas.filter(i => {
      if (!i.data_inicio || !i.data_resolucao) return false;
      const s = new Date(i.data_inicio);  s.setHours(0,0,0,0);
      const e = new Date(i.data_resolucao); e.setHours(23,59,59,999);
      if (e < s) return false;
      return data >= s && data <= e;
    });
  }

  const hojeStr     = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
  const diasNoMes   = getDaysInMonth(ano, mes);
  const primeiroDia = getFirstDay(ano, mes);
  const campsMes    = issuesFiltradas.filter(i => { if (!i.data_inicio) return false; const d = new Date(i.data_inicio); return d.getFullYear()===ano && d.getMonth()===mes; });
  const ativas      = campsMes.filter(i => i.statusDinamico === "ativa").length;
  const encerradas  = campsMes.filter(i => i.statusDinamico === "encerrada").length;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.bg, fontFamily:"Inter,sans-serif", transition:"background 0.2s" }}>
      <Sidebar historico={historico} totalNaoLidas={totalNaoLidas} marcarLidas={marcarLidas} />

      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <div style={{ width:3, height:20, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
              <h1 style={{ fontSize:20, fontWeight:800, color:t.text }}>Calendário de Campanhas</h1>
            </div>
            <p style={{ fontSize:12, color:t.textMuted, paddingLeft:13 }}>Gerencie e acompanhe todas as campanhas promocionais</p>
          </div>

          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ display:"flex", gap:20, fontSize:12 }}>
              {[
                { label:"Total",      value:campsMes.length, color:"#818CF8" },
                { label:"Ativas",     value:ativas,          color:"#34D399" },
                { label:"Encerradas", value:encerradas,      color:"#F87171" },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center" }}>
                  <p style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</p>
                  <p style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{s.label}</p>
                </div>
              ))}
            </div>

            <button onClick={onAbrirTutorial} style={{
              display:"flex", alignItems:"center", gap:6,
              background:t.card, border:`1px solid ${t.border}`,
              borderRadius:9, padding:"9px 14px", cursor:"pointer",
              fontSize:12, fontWeight:600, color:t.textMuted, marginLeft:16, transition:"all 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.color=t.textSub; e.currentTarget.style.borderColor=t.borderHover; }}
              onMouseLeave={e => { e.currentTarget.style.color=t.textMuted; e.currentTarget.style.borderColor=t.border; }}
            >
              <HelpCircle size={13} strokeWidth={2} /> Tutorial
            </button>

            <button onClick={recarregar} style={{
              display:"flex", alignItems:"center", gap:7,
              background:"linear-gradient(135deg,#6366F1,#4F46E5)", color:"#fff",
              border:"none", borderRadius:9, padding:"9px 18px",
              cursor:"pointer", fontSize:12, fontWeight:600,
              boxShadow:"0 4px 14px rgba(99,102,241,0.4)", transition:"opacity 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              <RefreshCw size={13} strokeWidth={2.5} /> SINCRONIZAR
            </button>
          </div>
        </div>

        {/* Busca + filtro responsável */}
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <div style={{ position:"relative", flex:1 }}>
            <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:t.textDeep }} />
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar campanha no calendário..."
              style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:9, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:12, outline:"none", boxSizing:"border-box", colorScheme: t.colorScheme }}
              onFocus={e => e.target.style.borderColor="#6366F1"}
              onBlur={e  => e.target.style.borderColor=t.border}
            />
          </div>

          <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
            <User size={13} style={{ position:"absolute", left:12, color:t.textDeep, pointerEvents:"none" }} />
            <select value={filtroResp} onChange={e => setFiltroResp(e.target.value)} style={{
              padding:"9px 12px 9px 32px", borderRadius:9,
              border:`1px solid ${t.border}`, background:t.input,
              color: filtroResp === "todos" ? t.textDim : t.text,
              fontSize:12, outline:"none", cursor:"pointer", colorScheme: t.colorScheme
            }}>
              <option value="todos">Todos responsáveis</option>
              {responsaveis.filter(r => r !== "todos").map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerta nova promoção */}
        {newPromos.length > 0 && (
          <div style={{ background:"linear-gradient(135deg,#FEF08A,#FDE047)", color:"#713F12", borderRadius:10, padding:"13px 20px", marginBottom:20, fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:10, boxShadow:"0 4px 20px rgba(253,224,71,0.3)", animation:"glow 1.5s infinite" }}>
            <AlertTriangle size={16} strokeWidth={2.5} />
            NOVA PROMOÇÃO INSERIDA: {newPromos.join(", ")}
          </div>
        )}

        {/* Nav mês */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:t.card, borderRadius:12, padding:"14px 20px", marginBottom:16, border:`1px solid ${t.border}` }}>
          <button onClick={() => navMes(-1)} style={{ background:t.cardHover, color:t.textMuted, border:`1px solid ${t.border}`, borderRadius:8, width:34, height:34, cursor:"pointer", fontSize:18, lineHeight:1 }}>‹</button>
          <div style={{ textAlign:"center" }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:t.text }}>{MESES[mes]} {ano}</h2>
            <p style={{ fontSize:10, color:t.textMuted, marginTop:3 }}>{campsMes.length} campanhas iniciando neste mês</p>
          </div>
          <button onClick={() => navMes(1)} style={{ background:t.cardHover, color:t.textMuted, border:`1px solid ${t.border}`, borderRadius:8, width:34, height:34, cursor:"pointer", fontSize:18, lineHeight:1 }}>›</button>
        </div>

        {/* Dias semana */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:6 }}>
          {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d,i) => (
            <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:700, letterSpacing:1, color:i===0||i===6 ? t.textDim : t.textMuted, padding:"5px 0" }}>{d}</div>
          ))}
        </div>

        {/* Grade */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
          {Array.from({ length:primeiroDia }).map((_,i) => <div key={`e${i}`} />)}
          {Array.from({ length:diasNoMes },(_,i) => i+1).map(dia => {
            const campanhas   = campanhasNoDia(dia);
            const total       = campanhas.length;
            const dateStr     = `${ano}-${String(mes+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
            const isHoje      = dateStr === hojeStr;
            const temNova     = campanhas.some(c => newPromos.includes(c.chave));
            const showTip     = tooltipDia === dia;
            const nAtivas     = campanhas.filter(c => c.statusDinamico === "ativa").length;
            const nEncerradas = campanhas.filter(c => c.statusDinamico === "encerrada").length;
            const nAgendadas  = campanhas.filter(c => c.statusDinamico === "agendada").length;

            return (
              <div key={dia} style={{ position:"relative" }}
                onMouseEnter={() => total > 0 && setTooltipDia(dia)}
                onMouseLeave={() => setTooltipDia(null)}
              >
                {showTip && <Tooltip campanhas={campanhas} t={t} />}
                <div onClick={() => total > 0 && navigate(`/day/${dateStr}?mes=${mes}&ano=${ano}`)}
                  style={{
                    background: temNova ? "linear-gradient(135deg,#FEF08A,#FDE047)"
                              : isHoje  ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.15))"
                              : total > 0 ? t.card : t.cardAlt,
                    border: isHoje  ? "1.5px solid rgba(99,102,241,0.6)"
                          : temNova ? "1.5px solid #FBBF24"
                          : total > 0 ? `1px solid ${t.border}` : `1px solid ${t.border}`,
                    borderRadius:10, padding:"10px 8px", minHeight:90,
                    cursor: total > 0 ? "pointer" : "default",
                    transition:"all 0.15s ease",
                    animation: temNova ? "glow 1.5s infinite" : "none",
                  }}
                  onMouseEnter={e => { if (total>0&&!isHoje&&!temNova) { e.currentTarget.style.borderColor="rgba(99,102,241,0.4)"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.background=t.cardHover; }}}
                  onMouseLeave={e => { if (!isHoje&&!temNova) { e.currentTarget.style.borderColor=t.border; e.currentTarget.style.transform="none"; e.currentTarget.style.background=total>0?t.card:t.cardAlt; }}}
                >
                  <div style={{ fontSize:12, fontWeight:700, color:isHoje?"#A5B4FC":temNova?"#713F12":total>0?t.textSub:t.textDeep }}>{dia}</div>

                  {total > 0 && (
                    <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3 }}>
                      {nAtivas > 0 && (
                        <div style={{ fontSize:9, fontWeight:700, padding:"2px 5px", borderRadius:4, textAlign:"center", background:"rgba(99,102,241,0.15)", color:"#818CF8", border:"1px solid rgba(99,102,241,0.25)", display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:"#818CF8", display:"inline-block", animation:"pulseDot 1.5s infinite" }} />
                          {nAtivas > 1 ? `${nAtivas}x ` : ""}EM CURSO
                        </div>
                      )}
                      {nAgendadas > 0 && (
                        <div style={{ fontSize:9, fontWeight:700, padding:"2px 5px", borderRadius:4, textAlign:"center", background:"rgba(16,185,129,0.12)", color:"#34D399", border:"1px solid rgba(16,185,129,0.25)" }}>
                          {nAgendadas > 1 ? `${nAgendadas}x ` : ""}INÍCIO
                        </div>
                      )}
                      {nEncerradas > 0 && (
                        <div style={{ fontSize:9, fontWeight:700, padding:"2px 5px", borderRadius:4, textAlign:"center", background:"rgba(239,68,68,0.12)", color:"#F87171", border:"1px solid rgba(239,68,68,0.25)" }}>
                          {nEncerradas > 1 ? `${nEncerradas}x ` : ""}ENCERRAMENTO
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div style={{ display:"flex", gap:20, marginTop:16, flexWrap:"wrap" }}>
          {[
            { color:"rgba(99,102,241,0.6)", label:"Hoje"              },
            { color:"#818CF8",              label:"Em curso"           },
            { color:"#34D399",              label:"Início de campanha" },
            { color:"#F87171",              label:"Fim de campanha"    },
            { color:"#FDE047",              label:"Nova campanha"      },
          ].map(l => (
            <span key={l.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:t.textMuted }}>
              <div style={{ width:8, height:8, borderRadius:2, background:l.color }} /> {l.label}
            </span>
          ))}
        </div>
      </main>

      <NotificacaoPopup notificacao={notificacao} onConfirmar={confirmar} />

      <style>{`
        @keyframes glow    { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes pulseDot{ 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
