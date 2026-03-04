import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getIssues, getAnexos, anexoProxy } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../components/Sidebar";
import { useNotificacoesCtx, useTemaCtx } from "../App";
import { ArrowLeft, Home, Paperclip, Download } from "lucide-react";

function LoadingBar({ t }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setTimeout(() => setWidth(30),   50);
    setTimeout(() => setWidth(60),  400);
    setTimeout(() => setWidth(85),  900);
    setTimeout(() => setWidth(95), 1500);
  }, []);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.bg, fontFamily:"Inter,sans-serif", transition:"background 0.2s" }}>
      <div style={{ position:"fixed", top:0, left:0, right:0, height:2, zIndex:9999 }}>
        <div style={{
          height:"100%",
          background:"linear-gradient(90deg,#6366f1,#8b5cf6)",
          boxShadow:"0 0 10px #6366f1",
          borderRadius:"0 2px 2px 0",
          transition:"width 0.6s cubic-bezier(.4,0,.2,1)",
          width:`${width}%`,
        }} />
      </div>

      <Sidebar />

      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
        <div style={{ width:"100%", maxWidth:920, padding:"0 32px", boxSizing:"border-box" }}>
          <div style={{ display:"flex", gap:14, marginBottom:24 }}>
            <div style={{ width:40, height:36, borderRadius:9, background:t.card, border:`1px solid ${t.border}` }} />
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                {[70, 90, 80].map((w, i) => (
                  <div key={i} style={{ width:w, height:22, borderRadius:6, background:t.card, animation:"shimmer 1.5s infinite" }} />
                ))}
              </div>
              <div style={{ width:"60%", height:28, borderRadius:8, background:t.card, marginBottom:8, animation:"shimmer 1.5s infinite 0.15s" }} />
              <div style={{ width:"35%", height:14, borderRadius:6, background:t.card, animation:"shimmer 1.5s infinite 0.3s" }} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[0, 1].map(i => (
              <div key={i} style={{ background:t.card, borderRadius:12, padding:24, border:`1px solid ${t.border}` }}>
                <div style={{ width:160, height:12, borderRadius:4, background:t.cardHover, marginBottom:20, animation:"shimmer 1.5s infinite" }} />
                {Array.from({ length:6 }).map((_,j) => (
                  <div key={j} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${t.border}` }}>
                    <div style={{ width:`${30+j*5}%`, height:11, borderRadius:4, background:t.cardHover, animation:`shimmer 1.5s infinite ${j*0.08}s` }} />
                    <div style={{ width:"25%",         height:11, borderRadius:4, background:t.cardHover, animation:`shimmer 1.5s infinite ${j*0.1}s`  }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`@keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.9} }`}</style>
    </div>
  );
}

export default function PromoPage() {
  const { key }        = useParams();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { t }          = useTemaCtx();
  const { historico, totalNaoLidas, marcarLidas } = useNotificacoesCtx();

  const [issue,   setIssue]   = useState(null);
  const [anexos,  setAnexos]  = useState([]);
  const [loading, setLoading] = useState(true);

  const mes  = searchParams.get("mes");
  const ano  = searchParams.get("ano");
  const from = searchParams.get("from");
  const voltarUrl = from ? `/day/${from}?mes=${mes}&ano=${ano}` : "/";

  useEffect(() => {
    Promise.all([getIssues("CP"), getAnexos(key).catch(() => ({ data:[] }))])
      .then(([issuesRes, anexosRes]) => {
        setIssue((issuesRes.data?.data || []).find(i => i.chave === key) || null);
        setAnexos(anexosRes.data || []);
      })
      .finally(() => setLoading(false));
  }, [key]);

  if (loading) return <LoadingBar t={t} />;

  if (!issue) return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.bg, fontFamily:"Inter,sans-serif", transition:"background 0.2s" }}>
      <Sidebar historico={historico} totalNaoLidas={totalNaoLidas} marcarLidas={marcarLidas} />
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:t.textDeep }}>
        Campanha não encontrada.
      </main>
    </div>
  );

  const fmt = d => d ? new Date(d).toLocaleString("pt-BR") : "—";

  const campos = [
    { label:"Chave",              value:issue.chave            },
    { label:"Nome da Promoção",   value:issue.nome_promocao    },
    { label:"Request Type",       value:issue.request_type     },
    { label:"Catálogo",           value:issue.catalogo         },
    { label:"Componente",         value:issue.componente       },
    { label:"Prioridade",         value:issue.prioridade       },
    { label:"Casa",               value:issue.casa             },
    { label:"Jogo",               value:issue.jogo             },
    { label:"Segmento / Público", value:issue.segmento         },
    { label:"ID Cliente VIP",     value:issue.id_cliente_vip   },
    { label:"Aplicação",          value:issue.aplicacao        },
    { label:"Valor Ingresso",     value:issue.valor_ingresso   },
    { label:"Valor R$",           value:issue.valor_reais      },
    { label:"Relator",            value:issue.relator          },
    { label:"Responsável",        value:issue.responsavel      },
    { label:"Resp. Campanha",     value:issue.responsavel_camp },
    { label:"Criado em",          value:fmt(issue.criado)      },
    { label:"Data Início",        value:fmt(issue.data_inicio)    },
    { label:"Data Resolução",     value:fmt(issue.data_resolucao) },
    { label:"SLA Tempo",          value:issue.sla_tempo        },
    { label:"SLA Restante",       value:issue.sla_restante     },
    { label:"Descrição Benefício",value:issue.descricao_benef  },
    { label:"Pontos Críticos",    value:issue.pontos_criticos  },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.bg, fontFamily:"Inter,sans-serif", transition:"background 0.2s" }}>
      <Sidebar historico={historico} totalNaoLidas={totalNaoLidas} marcarLidas={marcarLidas} />

      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>

          <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:24 }}>
            <button onClick={() => navigate(voltarUrl)} style={{
              background:t.card, color:t.textMuted, border:`1px solid ${t.border}`,
              borderRadius:9, padding:"8px 14px", cursor:"pointer",
              display:"flex", alignItems:"center", marginTop:4,
              transition:"all 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#6366F1"; e.currentTarget.style.color="#A5B4FC"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=t.border;  e.currentTarget.style.color=t.textMuted; }}
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>

            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                <span style={{ background:"rgba(99,102,241,0.15)", color:"#818CF8", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:6, border:"1px solid rgba(99,102,241,0.2)" }}>{issue.chave}</span>
                {issue.casa && (
                  <span style={{ background:"rgba(245,158,11,0.1)", color:"#F59E0B", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:6, border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", gap:4 }}>
                    <Home size={11} strokeWidth={2} /> {issue.casa}
                  </span>
                )}
                <StatusBadge inicio={issue.data_inicio} fim={issue.data_resolucao} />
              </div>
              <h1 style={{ fontSize:22, fontWeight:800, color:t.text, letterSpacing:"-0.4px" }}>{issue.resumo}</h1>
              <p style={{ fontSize:12, color:t.textMuted, marginTop:6 }}>{issue.request_type} · {issue.catalogo}</p>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            {/* Campos */}
            <div style={{ background:t.card, borderRadius:12, padding:24, border:`1px solid ${t.border}`, transition:"background 0.2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                <div style={{ width:3, height:14, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
                <p style={{ fontSize:10, fontWeight:700, color:t.textMuted, letterSpacing:1.5 }}>INFORMAÇÕES DO TICKET</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {campos.filter(c => c.value && c.value !== "—").map(c => (
                  <div key={c.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:`1px solid ${t.border}` }}>
                    <span style={{ fontSize:11, color:t.textMuted, fontWeight:500, flexShrink:0 }}>{c.label}</span>
                    <span style={{ fontSize:12, color:t.textSub, textAlign:"right" }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Anexos */}
            <div style={{ background:t.card, borderRadius:12, padding:24, border:`1px solid ${t.border}`, transition:"background 0.2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                <div style={{ width:3, height:14, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
                <p style={{ fontSize:10, fontWeight:700, color:t.textMuted, letterSpacing:1.5 }}>ANEXOS ({anexos.length})</p>
              </div>
              {anexos.length === 0 ? (
                <div style={{ textAlign:"center", color:t.textDeep, paddingTop:40 }}>
                  <Paperclip size={28} strokeWidth={1.5} style={{ margin:"0 auto 10px", display:"block", opacity:0.4 }} />
                  <p style={{ fontSize:13 }}>Nenhum anexo encontrado.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {anexos.map(a => {
                    const isImg = a.mimeType?.startsWith("image/");
                    return (
                      <div key={a.id} style={{ background:t.cardAlt, borderRadius:10, overflow:"hidden", border:`1px solid ${t.border}` }}>
                        {isImg && (
                          <img
                            src={anexoProxy(a.content)}
                            alt={a.filename}
                            style={{ width:"100%", maxHeight:160, objectFit:"cover" }}
                            onError={e => e.target.style.display="none"}
                          />
                        )}
                        <div style={{ padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                          <div>
                            <p style={{ fontSize:11, color:t.textMuted, wordBreak:"break-all" }}>{a.filename}</p>
                            <p style={{ fontSize:10, color:t.textDeep, marginTop:2 }}>{(a.size/1024).toFixed(1)} KB</p>
                          </div>
                          <a
                            href={anexoProxy(a.content)}
                            download={a.filename}
                            target="_blank"
                            rel="noreferrer"
                            style={{ background:"linear-gradient(135deg,#6366F1,#4F46E5)", color:"#fff", borderRadius:7, padding:"7px 14px", fontSize:11, textDecoration:"none", fontWeight:600, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}
                          >
                            <Download size={11} strokeWidth={2.5} /> Baixar
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
