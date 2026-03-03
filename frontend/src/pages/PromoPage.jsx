import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getIssues, getAnexos, anexoProxy } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../components/Sidebar";

export default function PromoPage() {
  const { key }    = useParams();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const [issue,   setIssue]   = useState(null);
  const [anexos,  setAnexos]  = useState([]);
  const [loading, setLoading] = useState(true);

  const mes  = searchParams.get("mes");
  const ano  = searchParams.get("ano");
  const from = searchParams.get("from");
  const voltarUrl = from ? `/day/${from}?mes=${mes}&ano=${ano}` : "/";

  useEffect(() => {
    Promise.all([getIssues("CP"), getAnexos(key).catch(() => ({ data: [] }))])
      .then(([issuesRes, anexosRes]) => {
        setIssue((issuesRes.data?.data || []).find(i => i.chave === key) || null);
        setAnexos(anexosRes.data || []);
      })
      .finally(() => setLoading(false));
  }, [key]);

  if (loading) return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020817", fontFamily:"Inter,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#1E3A5F" }}>⏳ Carregando...</main>
    </div>
  );

  if (!issue) return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020817", fontFamily:"Inter,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#334155" }}>Campanha não encontrada.</main>
    </div>
  );

  const fmt = (d) => d ? new Date(d).toLocaleString("pt-BR") : "—";

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
    { label:"Data Início",        value:fmt(issue.data_inicio)     },
    { label:"Data Resolução",     value:fmt(issue.data_resolucao)  },
    { label:"SLA Tempo",          value:issue.sla_tempo        },
    { label:"SLA Restante",       value:issue.sla_restante     },
    { label:"Descrição Benefício",value:issue.descricao_benef  },
    { label:"Pontos Críticos",    value:issue.pontos_criticos  },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020817", fontFamily:"Inter,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>

          <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:24 }}>
            <button onClick={() => navigate(voltarUrl)} style={{
              background:"#050E1F", color:"#475569", border:"1px solid #0D1F3C",
              borderRadius:9, padding:"8px 14px", cursor:"pointer", fontSize:16, marginTop:4
            }}>←</button>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                <span style={{ background:"rgba(99,102,241,0.15)", color:"#818CF8", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:6, border:"1px solid rgba(99,102,241,0.2)" }}>{issue.chave}</span>
                {issue.casa && <span style={{ background:"rgba(245,158,11,0.1)", color:"#F59E0B", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:6, border:"1px solid rgba(245,158,11,0.2)" }}>🏠 {issue.casa}</span>}
                <StatusBadge inicio={issue.data_inicio} fim={issue.data_resolucao} />
              </div>
              <h1 style={{ fontSize:22, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.4px" }}>{issue.resumo}</h1>
              <p style={{ fontSize:12, color:"#334155", marginTop:6 }}>{issue.request_type} · {issue.catalogo}</p>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            {/* Campos */}
            <div style={{ background:"#050E1F", borderRadius:12, padding:24, border:"1px solid #0D1F3C" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                <div style={{ width:3, height:14, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
                <p style={{ fontSize:10, fontWeight:700, color:"#334155", letterSpacing:1.5 }}>INFORMAÇÕES DO TICKET</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {campos.filter(c => c.value && c.value !== "—").map((c) => (
                  <div key={c.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:"1px solid #080F1E" }}>
                    <span style={{ fontSize:11, color:"#334155", fontWeight:500, flexShrink:0 }}>{c.label}</span>
                    <span style={{ fontSize:12, color:"#94A3B8", textAlign:"right" }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Anexos */}
            <div style={{ background:"#050E1F", borderRadius:12, padding:24, border:"1px solid #0D1F3C" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                <div style={{ width:3, height:14, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
                <p style={{ fontSize:10, fontWeight:700, color:"#334155", letterSpacing:1.5 }}>ANEXOS ({anexos.length})</p>
              </div>
              {anexos.length === 0 ? (
                <div style={{ textAlign:"center", color:"#1E3A5F", paddingTop:40 }}>
                  <p style={{ fontSize:28, marginBottom:8 }}>📎</p>
                  <p style={{ fontSize:13 }}>Nenhum anexo encontrado.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {anexos.map(a => {
                    const isImg = a.mimeType?.startsWith("image/");
                    return (
                      <div key={a.id} style={{ background:"#030912", borderRadius:10, overflow:"hidden", border:"1px solid #0D1F3C" }}>
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
                            <p style={{ fontSize:11, color:"#475569", wordBreak:"break-all" }}>{a.filename}</p>
                            <p style={{ fontSize:10, color:"#1E3A5F", marginTop:2 }}>{(a.size/1024).toFixed(1)} KB</p>
                          </div>
                          <a
                            href={anexoProxy(a.content)}
                            download={a.filename}
                            target="_blank"
                            rel="noreferrer"
                            style={{ background:"linear-gradient(135deg,#6366F1,#4F46E5)", color:"#fff", borderRadius:7, padding:"7px 14px", fontSize:11, textDecoration:"none", fontWeight:600, whiteSpace:"nowrap" }}
                          >
                            ⬇ Baixar
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
