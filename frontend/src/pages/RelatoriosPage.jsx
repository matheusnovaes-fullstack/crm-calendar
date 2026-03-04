import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIssues } from "../services/api";
import Sidebar from "../components/Sidebar";
import { LayoutList, CheckCircle, XCircle, Clock, Loader, SlidersHorizontal, Download, X, FileText, FileJson } from "lucide-react";

const barColors = ["#6366F1","#8B5CF6","#A78BFA","#818CF8","#4F46E5"];

// ─── Exportação ──────────────────────────────────────────────────────────────

const CAMPOS_DISPONIVEIS = [
  { key:"chave",           label:"Chave / ID"       },
  { key:"resumo",          label:"Nome da campanha" },
  { key:"status",          label:"Status"           },
  { key:"casa",            label:"Marca / Casa"     },
  { key:"data_inicio",     label:"Data início"      },
  { key:"data_resolucao",  label:"Data encerramento"},
  { key:"responsavel",     label:"Responsável"      },
  { key:"prioridade",      label:"Prioridade"       },
  { key:"componente",      label:"Componente"       },
  { key:"catalogo",        label:"Catálogo"         },
  { key:"request_type",    label:"Request Type"     },
  { key:"segmento",        label:"Segmento"         },
  { key:"valor_reais",     label:"Valor R$"         },
];

function getStatusLabel(i) {
  const agora = new Date();
  if (!i.data_inicio || !i.data_resolucao) return "Sem data";
  const s = new Date(i.data_inicio), e = new Date(i.data_resolucao);
  if (agora < s) return "Agendada";
  if (agora >= s && agora <= e) return "Ativa";
  return "Encerrada";
}

function exportarCSV(dados, campos) {
  const header = campos.map(c => c.label).join(";");
  const rows   = dados.map(i =>
    campos.map(c => {
      const v = c.key === "status" ? getStatusLabel(i) : (i[c.key] || "");
      return `"${String(v).replace(/"/g,'""')}"`;
    }).join(";")
  );
  const csv  = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `campanhas_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportarJSON(dados, campos) {
  const resultado = dados.map(i =>
    Object.fromEntries(campos.map(c => [c.label, c.key === "status" ? getStatusLabel(i) : (i[c.key] || "")]))
  );
  const blob = new Blob([JSON.stringify(resultado, null, 2)], { type:"application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `campanhas_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Modal de exportação ──────────────────────────────────────────────────────

function ModalExport({ dados, onFechar }) {
  const [selecionados, setSelecionados] = useState(
    new Set(["chave","resumo","status","casa","data_inicio","data_resolucao","responsavel"])
  );

  function toggle(key) {
    setSelecionados(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const camposSelecionados = CAMPOS_DISPONIVEIS.filter(c => selecionados.has(c.key));

  return (
    <>
      <div onClick={onFechar} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", zIndex:9998 }} />
      <div style={{
        position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        zIndex:9999, background:"#050E1F", border:"1px solid #0D1F3C",
        borderRadius:16, padding:"28px 32px", width:480,
        boxShadow:"0 24px 60px rgba(0,0,0,0.6)",
        animation:"slideUp 0.2s ease"
      }}>
        {/* Header modal */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:"#F1F5F9" }}>Exportar Campanhas</p>
            <p style={{ fontSize:11, color:"#334155", marginTop:3 }}>{dados.length} campanha(s) no filtro atual</p>
          </div>
          <button onClick={onFechar} style={{ background:"transparent", border:"none", cursor:"pointer", color:"#475569" }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Seleção de campos */}
        <p style={{ fontSize:10, fontWeight:700, color:"#475569", letterSpacing:1, marginBottom:12 }}>SELECIONAR CAMPOS</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
          {CAMPOS_DISPONIVEIS.map(c => {
            const ativo = selecionados.has(c.key);
            return (
              <div key={c.key} onClick={() => toggle(c.key)} style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"8px 12px", borderRadius:8, cursor:"pointer",
                background: ativo ? "rgba(99,102,241,0.12)" : "#030912",
                border: `1px solid ${ativo ? "rgba(99,102,241,0.35)" : "#0D1F3C"}`,
                transition:"all 0.12s"
              }}>
                <div style={{
                  width:14, height:14, borderRadius:4, flexShrink:0,
                  background: ativo ? "linear-gradient(135deg,#6366F1,#4F46E5)" : "transparent",
                  border: `1.5px solid ${ativo ? "#6366F1" : "#1E3A5F"}`,
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  {ativo && <span style={{ color:"#fff", fontSize:9, fontWeight:900 }}>✓</span>}
                </div>
                <span style={{ fontSize:11, color: ativo ? "#A5B4FC" : "#475569", fontWeight: ativo ? 600 : 400 }}>{c.label}</span>
              </div>
            );
          })}
        </div>

        {/* Botões de exportação */}
        <div style={{ display:"flex", gap:10 }}>
          <button
            disabled={camposSelecionados.length === 0}
            onClick={() => { exportarCSV(dados, camposSelecionados); onFechar(); }}
            style={{
              flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              padding:"11px", borderRadius:10, cursor: camposSelecionados.length === 0 ? "not-allowed" : "pointer",
              background: camposSelecionados.length === 0 ? "#0A1628" : "linear-gradient(135deg,#6366F1,#4F46E5)",
              color: camposSelecionados.length === 0 ? "#334155" : "#fff",
              border:"none", fontSize:12, fontWeight:700,
              boxShadow: camposSelecionados.length > 0 ? "0 4px 14px rgba(99,102,241,0.4)" : "none",
              transition:"opacity 0.15s"
            }}
            onMouseEnter={e => { if (camposSelecionados.length > 0) e.currentTarget.style.opacity="0.85"; }}
            onMouseLeave={e => e.currentTarget.style.opacity="1"}
          >
            <FileText size={14} strokeWidth={2} /> Exportar CSV
          </button>
          <button
            disabled={camposSelecionados.length === 0}
            onClick={() => { exportarJSON(dados, camposSelecionados); onFechar(); }}
            style={{
              flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              padding:"11px", borderRadius:10, cursor: camposSelecionados.length === 0 ? "not-allowed" : "pointer",
              background: camposSelecionados.length === 0 ? "#0A1628" : "#0A1628",
              color: camposSelecionados.length === 0 ? "#334155" : "#818CF8",
              border:`1px solid ${camposSelecionados.length === 0 ? "#0D1F3C" : "rgba(99,102,241,0.3)"}`,
              fontSize:12, fontWeight:700,
              transition:"all 0.15s"
            }}
            onMouseEnter={e => { if (camposSelecionados.length > 0) { e.currentTarget.style.borderColor="rgba(99,102,241,0.6)"; e.currentTarget.style.color="#A5B4FC"; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(99,102,241,0.3)"; e.currentTarget.style.color="#818CF8"; }}
          >
            <FileJson size={14} strokeWidth={2} /> Exportar JSON
          </button>
        </div>

        <style>{`@keyframes slideUp { from { opacity:0; transform:translate(-50%,-46%); } to { opacity:1; transform:translate(-50%,-50%); } }`}</style>
      </div>
    </>
  );
}

// ─── Componente de filtro de data ─────────────────────────────────────────────

function FiltroData({ label, value, onChange, onClear }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1 }}>
      <label style={{ fontSize:10, fontWeight:700, color:"#475569", letterSpacing:0.8 }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input
          type="datetime-local"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width:"100%", padding:"9px 34px 9px 12px", borderRadius:8,
            border:"1px solid #0D1F3C", background:"#030912",
            color: value ? "#F1F5F9" : "#334155", fontSize:12,
            outline:"none", boxSizing:"border-box", colorScheme:"dark"
          }}
          onFocus={e => e.target.style.borderColor="#6366F1"}
          onBlur={e  => e.target.style.borderColor="#0D1F3C"}
        />
        {value && (
          <button onClick={onClear} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", color:"#475569", padding:0 }}>
            <X size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const navigate = useNavigate();
  const [issues,        setIssues]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filtroAberto,  setFiltroAberto]  = useState(false);
  const [modalExport,   setModalExport]   = useState(false);
  const [dataInicio,    setDataInicio]    = useState("");
  const [dataFim,       setDataFim]       = useState("");

  useEffect(() => {
    getIssues("CP")
      .then(({ data }) => setIssues(data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const agora = new Date();
  function getStatus(i) {
    if (!i.data_inicio || !i.data_resolucao) return "sem_data";
    const s = new Date(i.data_inicio), e = new Date(i.data_resolucao);
    if (agora < s) return "agendada";
    if (agora >= s && agora <= e) return "ativa";
    return "encerrada";
  }

  const temFiltroData = dataInicio || dataFim;

  // Aplica filtro de data a todos os dados
  const issuesFiltradas = issues.filter(i => {
    let ok = true;
    if (dataInicio) {
      const di = new Date(dataInicio);
      const fe = i.data_resolucao ? new Date(i.data_resolucao) : null;
      if (!fe || fe < di) ok = false;
    }
    if (dataFim && ok) {
      const df = new Date(dataFim);
      const fs = i.data_inicio ? new Date(i.data_inicio) : null;
      if (!fs || fs > df) ok = false;
    }
    return ok;
  });

  const ativas     = issuesFiltradas.filter(i => getStatus(i) === "ativa");
  const encerradas = issuesFiltradas.filter(i => getStatus(i) === "encerrada");
  const agendadas  = issuesFiltradas.filter(i => getStatus(i) === "agendada");

  const porMes = {};
  issuesFiltradas.forEach(i => {
    if (!i.data_inicio) return;
    const d   = new Date(i.data_inicio);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    porMes[key] = (porMes[key] || 0) + 1;
  });
  const mesesOrdenados = Object.entries(porMes).sort(([a],[b]) => a.localeCompare(b));
  const maxMes         = Math.max(...mesesOrdenados.map(([,v]) => v), 1);

  const porComp = {};
  issuesFiltradas.forEach(i => {
    const k = i.componente || "Sem componente";
    porComp[k] = (porComp[k] || 0) + 1;
  });
  const compOrdenados = Object.entries(porComp).sort(([,a],[,b]) => b-a);
  const maxComp       = Math.max(...compOrdenados.map(([,v]) => v), 1);

  const formatMes = (key) => {
    const [y, m] = key.split("-");
    return new Date(+y, +m-1).toLocaleDateString("pt-BR", { month:"short", year:"2-digit" });
  };

  const kpis = [
    { label:"Total no período", value:issuesFiltradas.length, color:"#6366F1", Icon:LayoutList  },
    { label:"Ativas agora",      value:ativas.length,          color:"#10B981", Icon:CheckCircle },
    { label:"Encerradas",        value:encerradas.length,      color:"#F87171", Icon:XCircle     },
    { label:"Agendadas",         value:agendadas.length,       color:"#A78BFA", Icon:Clock       },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020817", fontFamily:"Inter,sans-serif" }}>
      <Sidebar />

      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:3, height:20, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
            <h1 style={{ fontSize:20, fontWeight:800, color:"#F1F5F9" }}>Relatórios</h1>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            {/* Filtro de data */}
            <button onClick={() => setFiltroAberto(v => !v)} style={{
              display:"flex", alignItems:"center", gap:6,
