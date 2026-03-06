import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIssuesCtx, useNotificacoesCtx, useTemaCtx } from "../App";
import Sidebar from "../components/Sidebar";
import { LayoutList, CheckCircle, XCircle, Clock, SlidersHorizontal, Download, X, FileText, FileJson, ChevronDown, ChevronUp, Tag, Trophy } from "lucide-react";

const barColors = ["#6366F1","#8B5CF6","#A78BFA","#818CF8","#4F46E5"];

const CAMPOS_DISPONIVEIS = [
  { key:"chave",          label:"Chave / ID"              },
  { key:"resumo",         label:"Nome da campanha"        },
  { key:"status",         label:"Status"                  },
  { key:"casa",           label:"Marca / Casa"            },
  { key:"data_inicio",    label:"Data início"             },
  { key:"data_resolucao", label:"Data encerramento"       },
  { key:"responsavel",    label:"Responsável"             },
  { key:"prioridade",     label:"Prioridade"              },
  { key:"componente",     label:"Componente"              },
  { key:"catalogo",       label:"Catálogo"                },
  { key:"request_type",   label:"Request Type"            },
  { key:"segmento",       label:"Segmento / Público"      }, // ✅
  { key:"tipoPremio",     label:"Tipo de Prêmio"          }, // ✅
  { key:"canalEnvio",     label:"Canal de Envio"          }, // ✅ NOVO
  { key:"criterioEleg",   label:"Critério Elegibilidade"  }, // ✅ NOVO
  { key:"linkCampanha",   label:"Link da Campanha"        }, // ✅ NOVO
  { key:"valor_ingresso", label:"Valor Ingresso"          },
];


function getStatusLabel(i) {
  const s = i.statusDinamico;
  if (s === "ativa")     return "Ativa";
  if (s === "agendada")  return "Agendada";
  if (s === "encerrada") return "Encerrada";
  return "Sem data";
}

function exportarCSV(dados, campos) {
  const header = campos.map(c => c.label).join(";");
  const rows   = dados.map(i => campos.map(c => { const v = c.key==="status" ? getStatusLabel(i) : (i[c.key]||""); return '"'+String(v).replace(/"/g,'""')+'"'; }).join(";"));
  const blob   = new Blob(["\uFEFF" + [header,...rows].join("\n")], { type:"text/csv;charset=utf-8;" });
  const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:"campanhas_"+new Date().toISOString().slice(0,10)+".csv" });
  a.click(); URL.revokeObjectURL(a.href);
}

function exportarJSON(dados, campos) {
  const resultado = dados.map(i => Object.fromEntries(campos.map(c => [c.label, c.key==="status" ? getStatusLabel(i) : (i[c.key]||"")])));
  const blob = new Blob([JSON.stringify(resultado,null,2)], { type:"application/json" });
  const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:"campanhas_"+new Date().toISOString().slice(0,10)+".json" });
  a.click(); URL.revokeObjectURL(a.href);
}

function ModalExport({ dados, onFechar, t }) {
  const [selecionados, setSelecionados] = useState(
    new Set(["chave","resumo","status","casa","data_inicio","data_resolucao","responsavel","segmento","tipoPremio"])
  );
  function toggle(key) { setSelecionados(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; }); }
  const camposSelecionados = CAMPOS_DISPONIVEIS.filter(c => selecionados.has(c.key));
  const podeBaixar = camposSelecionados.length > 0;

  return (
    <>
      <div onClick={onFechar} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", zIndex:9998 }} />
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:9999, background:t.card, border:`1px solid ${t.border}`, borderRadius:16, padding:"28px 32px", width:480, boxShadow:"0 24px 60px rgba(0,0,0,0.4)", animation:"slideUp 0.2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:t.text }}>Exportar Campanhas</p>
            <p style={{ fontSize:11, color:t.textDim, marginTop:3 }}>{dados.length} campanha(s) no filtro atual</p>
          </div>
          <button onClick={onFechar} style={{ background:"transparent", border:"none", cursor:"pointer", color:t.textMuted }}><X size={16} strokeWidth={2} /></button>
        </div>
        <p style={{ fontSize:10, fontWeight:700, color:t.textMuted, letterSpacing:1, marginBottom:12 }}>SELECIONAR CAMPOS</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
          {CAMPOS_DISPONIVEIS.map(c => {
            const ativo = selecionados.has(c.key);
            return (
              <div key={c.key} onClick={() => toggle(c.key)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8, cursor:"pointer", background: ativo ? "rgba(99,102,241,0.12)" : t.cardAlt, border: ativo ? "1px solid rgba(99,102,241,0.35)" : `1px solid ${t.border}`, transition:"all 0.12s" }}>
                <div style={{ width:14, height:14, borderRadius:4, flexShrink:0, background: ativo ? "linear-gradient(135deg,#6366F1,#4F46E5)" : "transparent", border: ativo ? "1.5px solid #6366F1" : `1.5px solid ${t.textDeep}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {ativo && <span style={{ color:"#fff", fontSize:9, fontWeight:900 }}>✓</span>}
                </div>
                <span style={{ fontSize:11, color: ativo ? "#A5B4FC" : t.textMuted, fontWeight: ativo ? 600 : 400 }}>{c.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button disabled={!podeBaixar} onClick={() => { exportarCSV(dados, camposSelecionados); onFechar(); }} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px", borderRadius:10, cursor: podeBaixar?"pointer":"not-allowed", background: podeBaixar?"linear-gradient(135deg,#6366F1,#4F46E5)":t.cardHover, color: podeBaixar?"#fff":t.textDim, border:"none", fontSize:12, fontWeight:700, boxShadow: podeBaixar?"0 4px 14px rgba(99,102,241,0.4)":"none", transition:"opacity 0.15s" }} onMouseEnter={e => { if(podeBaixar) e.currentTarget.style.opacity="0.85"; }} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
            <FileText size={14} strokeWidth={2} /> Exportar CSV
          </button>
          <button disabled={!podeBaixar} onClick={() => { exportarJSON(dados, camposSelecionados); onFechar(); }} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px", borderRadius:10, cursor: podeBaixar?"pointer":"not-allowed", background:t.cardHover, color: podeBaixar?"#818CF8":t.textDim, border: podeBaixar?`1px solid rgba(99,102,241,0.3)`:`1px solid ${t.border}`, fontSize:12, fontWeight:700, transition:"all 0.15s" }} onMouseEnter={e => { if(podeBaixar){ e.currentTarget.style.borderColor="rgba(99,102,241,0.6)"; e.currentTarget.style.color="#A5B4FC"; }}} onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(99,102,241,0.3)"; e.currentTarget.style.color="#818CF8"; }}>
            <FileJson size={14} strokeWidth={2} /> Exportar JSON
          </button>
        </div>
      </div>
    </>
  );
}

function FiltroData({ label, value, onChange, onClear, t }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1 }}>
      <label style={{ fontSize:10, fontWeight:700, color:t.textMuted, letterSpacing:0.8 }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input type="datetime-local" value={value} onChange={e => onChange(e.target.value)}
          style={{ width:"100%", padding:"9px 34px 9px 12px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputAlt, color: value ? t.text : t.textDim, fontSize:12, outline:"none", boxSizing:"border-box", colorScheme: t.colorScheme }}
          onFocus={e => e.target.style.borderColor="#6366F1"}
          onBlur={e  => e.target.style.borderColor=t.border}
        />
        {value && <button onClick={onClear} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", color:t.textMuted, padding:0 }}><X size={13} strokeWidth={2} /></button>}
      </div>
    </div>
  );
}

// 🔥 Componente de gráfico de barras reutilizável
function GraficoBarras({ titulo, dados, maxVal, corInicial, corFinal, icone: Icone, t }) {
  return (
    <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <div style={{ width:3, height:14, background:`linear-gradient(180deg,${corInicial},${corFinal})`, borderRadius:2 }} />
        <p style={{ fontSize:12, fontWeight:700, color:t.textMuted, display:"flex", alignItems:"center", gap:6 }}>
          {Icone && <Icone size={12} strokeWidth={2} />} {titulo}
        </p>
      </div>
      {dados.length === 0
        ? <p style={{ color:t.textDeep, fontSize:12, textAlign:"center", paddingTop:20 }}>Sem dados</p>
        : dados.map(([label, count], idx) => (
          <div key={label} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, color:t.textMuted, maxWidth:"75%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{label}</span>
              <span style={{ fontSize:11, fontWeight:700, color:corInicial }}>{count}</span>
            </div>
            <div style={{ height:8, background:t.cardHover, borderRadius:4 }}>
              <div style={{ height:8, borderRadius:4, width:((count/maxVal)*100)+"%", background:`linear-gradient(90deg,${corInicial},${corFinal})`, transition:"width 0.5s" }} />
            </div>
          </div>
        ))
      }
    </div>
  );
}

// 🔥 Lista expansível
function ListaExpansivel({ titulo, items, corBarra, corTexto, renderItem, t }) {
  const [expandido, setExpandido] = useState(false);
  const visiveis = expandido ? items : items.slice(0, 5);

  return (
    <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <div style={{ width:3, height:14, background:corBarra, borderRadius:2 }} />
        <p style={{ fontSize:12, fontWeight:700, color:t.textMuted }}>{titulo}</p>
        <span style={{ marginLeft:"auto", fontSize:11, color:corTexto, fontWeight:600 }}>{items.length} total</span>
      </div>
      {items.length === 0
        ? <p style={{ color:t.textDeep, fontSize:12, textAlign:"center", paddingTop:20 }}>Nenhuma campanha</p>
        : <>
            {visiveis.map(renderItem)}
            {items.length > 5 && (
              <button onClick={() => setExpandido(v => !v)} style={{
                width:"100%", marginTop:10, padding:"8px", borderRadius:8, cursor:"pointer",
                background:"transparent", border:`1px solid ${t.border}`,
                color:t.textMuted, fontSize:11, fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                transition:"all 0.15s"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=corTexto; e.currentTarget.style.color=corTexto; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textMuted; }}
              >
                {expandido
                  ? <><ChevronUp size={13} strokeWidth={2} /> Ver menos</>
                  : <><ChevronDown size={13} strokeWidth={2} /> Ver mais {items.length - 5} campanhas</>
                }
              </button>
            )}
          </>
      }
    </div>
  );
}

export default function RelatoriosPage() {
  const navigate = useNavigate();
  const { issues }                                = useIssuesCtx();
  const { historico, totalNaoLidas, marcarLidas } = useNotificacoesCtx();
  const { t }                                     = useTemaCtx();

  const [filtroAberto, setFiltroAberto] = useState(false);
  const [modalExport,  setModalExport]  = useState(false);
  const [dataInicio,   setDataInicio]   = useState("");
  const [dataFim,      setDataFim]      = useState("");

  const temFiltroData = dataInicio || dataFim;

  const issuesFiltradas = issues.filter(i => {
    let ok = true;
    if (dataInicio) { const di = new Date(dataInicio); const fe = i.data_resolucao ? new Date(i.data_resolucao) : null; if (!fe || fe < di) ok = false; }
    if (dataFim && ok) { const df = new Date(dataFim); const fs = i.data_inicio ? new Date(i.data_inicio) : null; if (!fs || fs > df) ok = false; }
    return ok;
  });

  const ativas     = issuesFiltradas.filter(i => i.statusDinamico === "ativa");
  const encerradas = issuesFiltradas.filter(i => i.statusDinamico === "encerrada");
  const agendadas  = issuesFiltradas.filter(i => i.statusDinamico === "agendada");

  // Por mês
  const porMes = {};
  issuesFiltradas.forEach(i => { if (!i.data_inicio) return; const d = new Date(i.data_inicio); const key = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); porMes[key] = (porMes[key]||0)+1; });
  const mesesOrdenados = Object.entries(porMes).sort(([a],[b]) => a.localeCompare(b));
  const maxMes = Math.max(...mesesOrdenados.map(([,v]) => v), 1);

  // Por componente
  const porComp = {};
  issuesFiltradas.forEach(i => { const k = i.componente||"Sem componente"; porComp[k] = (porComp[k]||0)+1; });
  const compOrdenados = Object.entries(porComp).sort(([,a],[,b]) => b-a);
  const maxComp = Math.max(...compOrdenados.map(([,v]) => v), 1);

  // 🔥 Por segmento
  const porSegmento = {};
  issuesFiltradas.forEach(i => { const k = i.segmento && i.segmento !== "—" ? i.segmento : "Não informado"; porSegmento[k] = (porSegmento[k]||0)+1; });
  const segOrdenados = Object.entries(porSegmento).sort(([,a],[,b]) => b-a);
  const maxSeg = Math.max(...segOrdenados.map(([,v]) => v), 1);

  // 🔥 Por tipo de prêmio
  const porPremio = {};
  issuesFiltradas.forEach(i => { const k = i.tipoPremio && i.tipoPremio !== "—" ? i.tipoPremio : "Não informado"; porPremio[k] = (porPremio[k]||0)+1; });
  const premioOrdenados = Object.entries(porPremio).sort(([,a],[,b]) => b-a);
  const maxPremio = Math.max(...premioOrdenados.map(([,v]) => v), 1);

  const formatMes = key => { const [y,m] = key.split("-"); return new Date(+y,+m-1).toLocaleDateString("pt-BR",{month:"short",year:"2-digit"}); };

  const kpis = [
    { label:"Total no período", value:issuesFiltradas.length, color:"#6366F1", Icon:LayoutList  },
    { label:"Ativas agora",     value:ativas.length,          color:"#10B981", Icon:CheckCircle },
    { label:"Encerradas",       value:encerradas.length,      color:"#F87171", Icon:XCircle     },
    { label:"Agendadas",        value:agendadas.length,       color:"#A78BFA", Icon:Clock       },
  ];

  // Render de item de lista
  const renderEncerrada = i => (
    <div key={i.chave} onClick={() => navigate("/promo/"+i.chave)}
      style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${t.border}`, cursor:"pointer" }}
      onMouseEnter={e => e.currentTarget.style.opacity="0.7"}
      onMouseLeave={e => e.currentTarget.style.opacity="1"}
    >
      <div>
        <span style={{ fontSize:11, color:"#818CF8", fontWeight:700 }}>{i.chave} </span>
        <span style={{ fontSize:12, color:t.textSub }}>{(i.resumo||"").slice(0,40)}{(i.resumo||"").length>40?"...":""}</span>
      </div>
      <span style={{ fontSize:10, color:"#F87171", whiteSpace:"nowrap", marginLeft:10 }}>{i.data_resolucao ? new Date(i.data_resolucao).toLocaleDateString("pt-BR") : "—"}</span>
    </div>
  );

  const renderAtiva = i => (
    <div key={i.chave} onClick={() => navigate("/promo/"+i.chave)}
      style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${t.border}`, cursor:"pointer" }}
      onMouseEnter={e => e.currentTarget.style.opacity="0.7"}
      onMouseLeave={e => e.currentTarget.style.opacity="1"}
    >
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", flexShrink:0 }} />
        <div>
          <span style={{ fontSize:11, color:"#818CF8", fontWeight:700 }}>{i.chave} </span>
          <span style={{ fontSize:12, color:t.textSub }}>{(i.resumo||"").slice(0,35)}{(i.resumo||"").length>35?"...":""}</span>
        </div>
      </div>
      <span style={{ fontSize:10, color:"#10B981", whiteSpace:"nowrap", marginLeft:10 }}>até {i.data_resolucao ? new Date(i.data_resolucao).toLocaleDateString("pt-BR") : "—"}</span>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.bg, fontFamily:"Inter,sans-serif", transition:"background 0.2s" }}>
      <Sidebar historico={historico} totalNaoLidas={totalNaoLidas} marcarLidas={marcarLidas} />

      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:3, height:20, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
            <h1 style={{ fontSize:20, fontWeight:800, color:t.text }}>Relatórios</h1>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setFiltroAberto(v => !v)} style={{ display:"flex", alignItems:"center", gap:6, background: filtroAberto||temFiltroData ? "rgba(99,102,241,0.15)" : t.card, border:`1px solid ${filtroAberto||temFiltroData ? "rgba(99,102,241,0.4)" : t.border}`, borderRadius:9, padding:"9px 14px", cursor:"pointer", fontSize:12, fontWeight:600, color: filtroAberto||temFiltroData ? "#A5B4FC" : t.textMuted, transition:"all 0.15s", position:"relative" }}>
              <SlidersHorizontal size={13} strokeWidth={2} /> Filtrar por data
              {temFiltroData && <span style={{ width:7, height:7, borderRadius:"50%", background:"#6366F1", position:"absolute", top:6, right:6 }} />}
            </button>
            <button onClick={() => setModalExport(true)} style={{ display:"flex", alignItems:"center", gap:7, background:"linear-gradient(135deg,#6366F1,#4F46E5)", color:"#fff", border:"none", borderRadius:9, padding:"9px 18px", cursor:"pointer", fontSize:12, fontWeight:600, boxShadow:"0 4px 14px rgba(99,102,241,0.4)", transition:"opacity 0.15s" }} onMouseEnter={e => e.currentTarget.style.opacity="0.85"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
              <Download size={13} strokeWidth={2.5} /> EXPORTAR
            </button>
          </div>
        </div>

        <p style={{ fontSize:12, color:t.textDim, paddingLeft:13, marginBottom:20 }}>
          {temFiltroData ? `${issuesFiltradas.length} campanha(s) no período filtrado` : "Visão analítica das campanhas promocionais"}
        </p>

        {filtroAberto && (
          <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 24px", marginBottom:20, animation:"fadeIn 0.15s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:t.textMuted, letterSpacing:1 }}>FILTRO DE PERÍODO</p>
              {temFiltroData && (
                <button onClick={() => { setDataInicio(""); setDataFim(""); }} style={{ background:"transparent", border:`1px solid ${t.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:10, fontWeight:600, color:t.textMuted, transition:"all 0.15s" }} onMouseEnter={e => { e.currentTarget.style.borderColor="#EF4444"; e.currentTarget.style.color="#F87171"; }} onMouseLeave={e => { e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textMuted; }}>Limpar</button>
              )}
            </div>
            <div style={{ display:"flex", gap:16, alignItems:"flex-end" }}>
              <FiltroData label="INÍCIO A PARTIR DE" value={dataInicio} onChange={setDataInicio} onClear={() => setDataInicio("")} t={t} />
              <FiltroData label="ENCERRAMENTO ATÉ"   value={dataFim}    onChange={setDataFim}    onClear={() => setDataFim("")}    t={t} />
              <div style={{ paddingBottom:1 }}>
                <p style={{ fontSize:10, color:t.textDim, marginBottom:5 }}>RESULTADO</p>
                <p style={{ fontSize:20, fontWeight:800, color:"#6366F1" }}>{issuesFiltradas.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background:t.card, border:`1px solid ${k.color}22`, borderRadius:12, padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <p style={{ fontSize:11, color:t.textDim, marginBottom:8 }}>{k.label}</p>
                  <p style={{ fontSize:32, fontWeight:800, color:k.color }}>{k.value}</p>
                </div>
                <k.Icon size={22} color={k.color} strokeWidth={1.5} style={{ opacity:0.5 }} />
              </div>
              <div style={{ marginTop:12, height:3, background:t.border, borderRadius:2 }}>
                <div style={{ height:3, background:k.color, borderRadius:2, width:(issuesFiltradas.length>0?(k.value/issuesFiltradas.length)*100:0)+"%", transition:"width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Linha 1 — Por mês + Por componente */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <GraficoBarras titulo="CAMPANHAS POR MÊS"       dados={mesesOrdenados.map(([k,v]) => [formatMes(k), v])} maxVal={maxMes}  corInicial="#6366F1" corFinal="#8B5CF6" t={t} />
          <GraficoBarras titulo="CAMPANHAS POR COMPONENTE" dados={compOrdenados}   maxVal={maxComp} corInicial="#818CF8" corFinal="#6366F1" t={t} />
        </div>

        {/* 🔥 Linha 2 — Por segmento + Por tipo de prêmio */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <GraficoBarras titulo="POR SEGMENTO / PÚBLICO" dados={segOrdenados}    maxVal={maxSeg}    corInicial="#A78BFA" corFinal="#8B5CF6" icone={Tag}    t={t} />
          <GraficoBarras titulo="POR TIPO DE PRÊMIO"     dados={premioOrdenados} maxVal={maxPremio} corInicial="#34D399" corFinal="#059669" icone={Trophy} t={t} />
        </div>

        {/* Linha 3 — Listas expansíveis */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <ListaExpansivel
            titulo="ÚLTIMAS ENCERRADAS"
            items={encerradas}
            corBarra="linear-gradient(180deg,#F87171,#EF4444)"
            corTexto="#F87171"
            renderItem={renderEncerrada}
            t={t}
          />
          <ListaExpansivel
            titulo="ATIVAS AGORA"
            items={ativas}
            corBarra="linear-gradient(180deg,#10B981,#059669)"
            corTexto="#10B981"
            renderItem={renderAtiva}
            t={t}
          />
        </div>
      </main>

      {modalExport && <ModalExport dados={issuesFiltradas} onFechar={() => setModalExport(false)} t={t} />}

      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
      `}</style>
    </div>
  );
}
