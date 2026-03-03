import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getIssues } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../components/Sidebar";

const MARCAS_MAP = {
  "a7kbetbr":     { label:"7K",    color:"#09ff00" },
  "cassinobetbr": { label:"Cassino", color:"#1059b9" },
  "verabetbr":    { label:"Vera",    color:"#66ff00" },
};

export default function CampanhasPage() {
  const navigate         = useNavigate();
  const { marca }        = useParams();
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca,   setBusca]   = useState("");
  const [filtro,  setFiltro]  = useState("todos");

  useEffect(() => {
    getIssues("CP")
      .then(({ data }) => setIssues(data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  getIssues("CP")
    .then(({ data }) => {
      const lista = data?.data || [];
      // DEBUG - remover depois
      console.log("Casas encontradas:", lista.map(i => ({ chave: i.chave, casa: i.casa, casa2: i.casa2 })));
      setIssues(lista);
    })
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

  // Filtra por marca se vier da sidebar
  const issuesPorMarca = marca
    ? issues.filter(i => (i.casa||"").toLowerCase().replace(/\s/g,"") === marca || (i.casa2||"").toLowerCase().replace(/\s/g,"") === marca)
    : issues;

  const filtradas = issuesPorMarca.filter(i => {
    const matchFiltro = filtro === "todos" || getStatus(i) === filtro;
    const matchBusca  = busca === "" ||
      i.chave.toLowerCase().includes(busca.toLowerCase()) ||
      (i.resumo||"").toLowerCase().includes(busca.toLowerCase()) ||
      (i.casa||"").toLowerCase().includes(busca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  const counts = {
    todos:     issuesPorMarca.length,
    ativa:     issuesPorMarca.filter(i => getStatus(i)==="ativa").length,
    encerrada: issuesPorMarca.filter(i => getStatus(i)==="encerrada").length,
    agendada:  issuesPorMarca.filter(i => getStatus(i)==="agendada").length,
  };

  const marcaInfo = marca ? MARCAS_MAP[marca] : null;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020817", fontFamily:"Inter,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <div style={{ width:3, height:20, background:"linear-gradient(180deg,#6366F1,#8B5CF6)", borderRadius:2 }} />
          <h1 style={{ fontSize:20, fontWeight:800, color:"#F1F5F9" }}>
            {marcaInfo ? (
              <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:10, height:10, borderRadius:"50%", background:marcaInfo.color, display:"inline-block" }} />
                Campanhas — {marcaInfo.label}
              </span>
            ) : "Campanhas Promocionais"}
          </h1>
        </div>
        <p style={{ fontSize:12, color:"#334155", paddingLeft:13, marginBottom:24 }}>
          {marcaInfo ? `Filtrando por marca: ${marcaInfo.label}` : "Lista completa de todas as campanhas do projeto CP"}
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { key:"todos",     label:"Total",      color:"#6366F1" },
            { key:"ativa",     label:"Ativas",     color:"#10B981" },
            { key:"encerrada", label:"Encerradas", color:"#F87171" },
            { key:"agendada",  label:"Agendadas",  color:"#A78BFA" },
          ].map(t => (
            <div key={t.key} onClick={() => setFiltro(t.key)} style={{
              background: filtro===t.key ? `${t.color}18` : "#050E1F",
              border:`1px solid ${filtro===t.key ? t.color+"44" : "#0D1F3C"}`,
              borderRadius:10, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s"
            }}>
              <p style={{ fontSize:11, color:"#475569", marginBottom:4 }}>{t.label}</p>
              <p style={{ fontSize:28, fontWeight:800, color:filtro===t.key ? t.color : "#334155" }}>{counts[t.key]}</p>
            </div>
          ))}
        </div>

        <div style={{ position:"relative", marginBottom:16 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#1E3A5F" }}>🔍</span>
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por chave, nome ou marca..."
            style={{ width:"100%", padding:"11px 16px 11px 40px", borderRadius:10, border:"1px solid #0D1F3C", background:"#050E1F", color:"#F1F5F9", fontSize:13, outline:"none", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="#6366F1"}
            onBlur={e  => e.target.style.borderColor="#0D1F3C"}
          />
        </div>

        {loading ? (
          <div style={{ textAlign:"center", color:"#1E3A5F", paddingTop:60 }}>⏳ Carregando...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign:"center", color:"#1E3A5F", paddingTop:60 }}>Nenhuma campanha encontrada.</div>
        ) : filtradas.map(issue => (
          <div key={issue.chave} onClick={() => navigate(`/promo/${issue.chave}`)}
            style={{ background:"#050E1F", borderRadius:12, padding:"18px 20px", marginBottom:10, cursor:"pointer", border:"1px solid #0D1F3C", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.border="1px solid rgba(99,102,241,0.4)"; e.currentTarget.style.background="#0A1628"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.border="1px solid #0D1F3C"; e.currentTarget.style.background="#050E1F"; e.currentTarget.style.transform="none"; }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, flexWrap:"wrap" }}>
                  <span style={{ background:"rgba(99,102,241,0.15)", color:"#818CF8", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5, border:"1px solid rgba(99,102,241,0.2)" }}>{issue.chave}</span>
                  {issue.casa && <span style={{ fontSize:11, color:"#F59E0B", background:"rgba(245,158,11,0.1)", padding:"2px 8px", borderRadius:5 }}>🏠 {issue.casa}</span>}
                </div>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#F1F5F9", marginBottom:7 }}>{issue.resumo}</h3>
                <div style={{ display:"flex", gap:16, fontSize:11, color:"#334155", flexWrap:"wrap" }}>
                  <span>📅 {issue.data_inicio ? new Date(issue.data_inicio).toLocaleDateString("pt-BR") : "—"}</span>
                  <span>🏁 {issue.data_resolucao ? new Date(issue.data_resolucao).toLocaleDateString("pt-BR") : "—"}</span>
                  <span>👤 {issue.responsavel || "—"}</span>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                <StatusBadge inicio={issue.data_inicio} fim={issue.data_resolucao} />
                <span style={{ fontSize:10, color:"#1E3A5F" }}>Ver detalhes →</span>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
