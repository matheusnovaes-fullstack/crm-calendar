// CampanhasPage.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useIssuesCtx, useNotificacoesCtx, useTemaCtx } from "../App";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../components/Sidebar";
import { Search, CalendarDays, Flag, User, Home, SlidersHorizontal, X, Tag, Trophy } from "lucide-react";

const MARCAS_MAP = {
  "a7kbetbr":     { label:"7K",      color:"#09ff00" },
  "cassinobetbr": { label:"Cassino", color:"#1059b9" },
  "verabetbr":    { label:"Vera",    color:"#66ff00" },
};

function FiltroData({ label, value, onChange, onClear, t }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1 }}>
      <label style={{ fontSize:10, fontWeight:700, color:t.textMuted, letterSpacing:0.8 }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input type="datetime-local" value={value} onChange={e => onChange(e.target.value)}
          style={{
            width:"100%", padding:"9px 34px 9px 12px", borderRadius:8,
            border:`1px solid ${t.border}`, background:t.inputAlt,
            color: value ? t.text : t.textDim, fontSize:12,
            outline:"none", boxSizing:"border-box", colorScheme: t.colorScheme
          }}
          onFocus={e => e.target.style.borderColor="#6366F1"}
          onBlur={e  => e.target.style.borderColor=t.border}
        />
        {value && (
          <button onClick={onClear} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", color:t.textMuted, display:"flex", alignItems:"center", padding:0 }}>
            <X size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function CampanhasPage() {
  const navigate  = useNavigate();
  const { marca } = useParams();

  const { issues }                                        = useIssuesCtx();
  const { historico, totalNaoLidas, marcarLidas }         = useNotificacoesCtx();
  const { t }                                             = useTemaCtx();

  const [busca,        setBusca]        = useState("");
  const [filtro,       setFiltro]       = useState("todos");
  const [filtroResp,   setFiltroResp]   = useState("todos");
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [dataInicio,   setDataInicio]   = useState("");
  const [dataFim,      setDataFim]      = useState("");

  const responsaveis = ["todos", ...Array.from(new Set(issues.map(i => i.responsavel).filter(Boolean))).sort()];

  const issuesPorMarca = marca
    ? issues.filter(i => (i.casa||"").toLowerCase().replace(/\s/g,"") === marca || (i.casa2||"").toLowerCase().replace(/\s/g,"") === marca)
    : issues;

  const temFiltroData  = dataInicio || dataFim;
  const temFiltroAtivo = temFiltroData || filtroResp !== "todos";

  function limparFiltros() {
    setDataInicio(""); setDataFim("");
    setFiltro("todos"); setBusca(""); setFiltroResp("todos");
  }

  const filtradas = issuesPorMarca.filter(i => {
    const matchFiltro = filtro === "todos" || (i.statusDinamico||"sem_data") === filtro;
    const matchBusca  = busca === "" ||
      i.chave.toLowerCase().includes(busca.toLowerCase()) ||
      (i.resumo||"").toLowerCase().includes(busca.toLowerCase()) ||
      (i.casa||"").toLowerCase().includes(busca.toLowerCase());
    const matchResp   = filtroResp === "todos" || i.responsavel === filtroResp;
    let matchData = true;
    if (dataInicio) { const di = new Date(dataInicio); const fe = i.data_resolucao ? new Date(i.data_resolucao) : null; if (!fe || fe < di) matchData = false; }
    if (dataFim && matchData) { const df = new Date(dataFim); const fs = i.data_inicio ? new Date(i.data_inicio) : null; if (!fs || fs > df) matchData = false; }
    return matchFiltro && matchBusca && matchResp && matchData;
  });

  const counts = {
    todos:     issuesPorMarca.length,
    ativa:     issuesPorMarca.filter(i => i.statusDinamico === "ativa").length,
    encerrada: issuesPorMarca.filter(i => i.statusDinamico === "encerrada").length,
    agendada:  issuesPorMarca.filter(i => i.statusDinamico === "agendada").length,
  };

  const marcaInfo = marca ? MARCAS_MAP[marca] : null;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.bg, fontFamily:"Inter,sans-serif", transition:"background 0.2s" }}>
      <Sidebar historico={historico} totalNaoLidas={totalNaoLidas} marcarLidas={marcarLidas} />

      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:3, height:20, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
            <h1 style={{ fontSize:20, fontWeight:800, color:t.text }}>
              {marcaInfo ? (
                <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:marcaInfo.color, display:"inline-block" }} />
                  Campanhas — {marcaInfo.label}
                </span>
              ) : "Campanhas Promocionais"}
            </h1>
          </div>

          <button onClick={() => setFiltroAberto(v => !v)} style={{
            display:"flex", alignItems:"center", gap:6,
            background: filtroAberto || temFiltroAtivo ? "rgba(99,102,241,0.15)" : t.card,
            border:`1px solid ${filtroAberto || temFiltroAtivo ? "rgba(99,102,241,0.4)" : t.border}`,
            borderRadius:9, padding:"9px 14px", cursor:"pointer", fontSize:12, fontWeight:600,
            color: filtroAberto || temFiltroAtivo ? "#A5B4FC" : t.textMuted,
            transition:"all 0.15s", position:"relative"
          }}>
            <SlidersHorizontal size={13} strokeWidth={2} />
            Filtrar
            {temFiltroAtivo && <span style={{ width:7, height:7, borderRadius:"50%", background:"#6366F1", position:"absolute", top:6, right:6 }} />}
          </button>
        </div>

        <p style={{ fontSize:12, color:t.textDim, paddingLeft:13, marginBottom:20 }}>
          {marcaInfo ? `Filtrando por marca: ${marcaInfo.label}` : "Lista completa de todas as campanhas do projeto CP"}
        </p>

        {/* Painel filtros */}
        {filtroAberto && (
          <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 24px", marginBottom:20, animation:"fadeIn 0.15s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:t.textMuted, letterSpacing:1 }}>FILTROS</p>
              {temFiltroAtivo && (
                <button onClick={limparFiltros} style={{ background:"transparent", border:`1px solid ${t.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:10, fontWeight:600, color:t.textMuted, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#EF4444"; e.currentTarget.style.color="#F87171"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textMuted; }}
                >Limpar tudo</button>
              )}
            </div>
            <div style={{ display:"flex", gap:16, alignItems:"flex-end", marginBottom:16 }}>
              <FiltroData label="INÍCIO A PARTIR DE" value={dataInicio} onChange={setDataInicio} onClear={() => setDataInicio("")} t={t} />
              <FiltroData label="ENCERRAMENTO ATÉ"   value={dataFim}    onChange={setDataFim}    onClear={() => setDataFim("")}    t={t} />
              <div style={{ paddingBottom:1 }}>
                <p style={{ fontSize:10, color:t.textDim, marginBottom:5 }}>RESULTADO</p>
                <p style={{ fontSize:20, fontWeight:800, color:"#6366F1" }}>{filtradas.length}</p>
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:t.textMuted, letterSpacing:0.8, display:"block", marginBottom:6 }}>RESPONSÁVEL</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {responsaveis.map(r => (
                  <button key={r} onClick={() => setFiltroResp(r)} style={{
                    padding:"5px 12px", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                    background: filtroResp === r ? "rgba(99,102,241,0.2)" : "transparent",
                    border:`1px solid ${filtroResp === r ? "rgba(99,102,241,0.5)" : t.border}`,
                    color: filtroResp === r ? "#A5B4FC" : t.textMuted
                  }}>
                    {r === "todos" ? "Todos" : r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KPI cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          {[
            { key:"todos",     label:"Total",      color:"#6366F1" },
            { key:"ativa",     label:"Ativas",     color:"#10B981" },
            { key:"encerrada", label:"Encerradas", color:"#F87171" },
            { key:"agendada",  label:"Agendadas",  color:"#A78BFA" },
          ].map(tab => (
            <div key={tab.key} onClick={() => setFiltro(tab.key)} style={{
              background: filtro===tab.key ? `${tab.color}18` : t.card,
              border:`1px solid ${filtro===tab.key ? tab.color+"44" : t.border}`,
              borderRadius:10, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s"
            }}>
              <p style={{ fontSize:11, color:t.textMuted, marginBottom:4 }}>{tab.label}</p>
              <p style={{ fontSize:28, fontWeight:800, color:filtro===tab.key ? tab.color : t.textDim }}>{counts[tab.key]}</p>
            </div>
          ))}
        </div>

        {/* Busca */}
        <div style={{ position:"relative", marginBottom:16 }}>
          <Search size={14} strokeWidth={2} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:t.textDeep }} />
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por chave, nome ou marca..."
            style={{ width:"100%", padding:"11px 16px 11px 40px", borderRadius:10, border:`1px solid ${t.border}`, background:t.card, color:t.text, fontSize:13, outline:"none", boxSizing:"border-box", colorScheme: t.colorScheme }}
            onFocus={e => e.target.style.borderColor="#6366F1"}
            onBlur={e  => e.target.style.borderColor=t.border}
          />
        </div>

        {temFiltroAtivo && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <span style={{ fontSize:11, color:"#6366F1", fontWeight:600 }}>{filtradas.length} campanha(s) encontrada(s) com filtros ativos</span>
            <button onClick={limparFiltros} style={{ display:"flex", alignItems:"center", gap:4, background:"transparent", border:"none", cursor:"pointer", fontSize:10, color:t.textMuted }}>
              <X size={11} strokeWidth={2} /> limpar
            </button>
          </div>
        )}

        {filtradas.length === 0 ? (
          <div style={{ textAlign:"center", color:t.textDeep, paddingTop:60 }}>Nenhuma campanha encontrada.</div>
        ) : filtradas.map(issue => (
          <div key={issue.chave} onClick={() => navigate(`/promo/${issue.chave}`)}
            style={{ background:t.card, borderRadius:12, padding:"18px 20px", marginBottom:10, cursor:"pointer", border:`1px solid ${t.border}`, transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(99,102,241,0.4)"; e.currentTarget.style.background=t.cardHover; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=t.border; e.currentTarget.style.background=t.card; e.currentTarget.style.transform="none"; }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, flexWrap:"wrap" }}>
                  <span style={{ background:"rgba(99,102,241,0.15)", color:"#818CF8", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5, border:"1px solid rgba(99,102,241,0.2)" }}>{issue.chave}</span>
                  {issue.casa && (
                    <span style={{ fontSize:11, color:"#F59E0B", background:"rgba(245,158,11,0.1)", padding:"2px 8px", borderRadius:5, border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", gap:4 }}>
                      <Home size={10} strokeWidth={2} /> {issue.casa}
                    </span>
                  )}
                  {/* 🔥 NOVO — Segmento */}
                  {issue.segmento && issue.segmento !== "—" && (
                    <span style={{ fontSize:11, color:"#A78BFA", background:"rgba(167,139,250,0.1)", padding:"2px 8px", borderRadius:5, border:"1px solid rgba(167,139,250,0.2)", display:"flex", alignItems:"center", gap:4 }}>
                      <Tag size={10} strokeWidth={2} /> {issue.segmento}
                    </span>
                  )}
                  {/* 🔥 NOVO — Tipo de Prêmio */}
                  {issue.tipoPremio && issue.tipoPremio !== "—" && (
                    <span style={{ fontSize:11, color:"#34D399", background:"rgba(52,211,153,0.1)", padding:"2px 8px", borderRadius:5, border:"1px solid rgba(52,211,153,0.2)", display:"flex", alignItems:"center", gap:4 }}>
                      <Trophy size={10} strokeWidth={2} /> {issue.tipoPremio}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize:14, fontWeight:700, color:t.text, marginBottom:7 }}>{issue.resumo}</h3>
                <div style={{ display:"flex", gap:16, fontSize:11, color:t.textDim, flexWrap:"wrap" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><CalendarDays size={11} strokeWidth={2} />{issue.data_inicio ? new Date(issue.data_inicio).toLocaleDateString("pt-BR") : "—"}</span>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><Flag size={11} strokeWidth={2} />{issue.data_resolucao ? new Date(issue.data_resolucao).toLocaleDateString("pt-BR") : "—"}</span>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><User size={11} strokeWidth={2} />{issue.responsavel || "—"}</span>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                <StatusBadge inicio={issue.data_inicio} fim={issue.data_resolucao} />
                <span style={{ fontSize:10, color:t.textDeep }}>Ver detalhes →</span>
              </div>
            </div>
          </div>
        ))}
      </main>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
