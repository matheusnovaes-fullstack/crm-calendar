import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getIssues } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../components/Sidebar";

export default function DayPage() {
  const { date }  = useParams();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca,   setBusca]   = useState("");

  // Preserva mes/ano para voltar corretamente
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");
  const voltarUrl = mes && ano ? `/?mes=${mes}&ano=${ano}` : "/";

  useEffect(() => {
    getIssues("CP")
      .then(({ data }) => setIssues(data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const campanhasDoDia = issues.filter(i => {
    if (!i.data_inicio || !i.data_resolucao) return false;
    const data = new Date(date + "T12:00:00");
    const s = new Date(i.data_inicio); s.setHours(0,0,0,0);
    const e = new Date(i.data_resolucao); e.setHours(23,59,59,999);
    return data >= s && data <= e;
  });

  const filtradas = campanhasDoDia.filter(i =>
    busca === "" ||
    i.chave.toLowerCase().includes(busca.toLowerCase()) ||
    (i.resumo||"").toLowerCase().includes(busca.toLowerCase()) ||
    (i.casa||"").toLowerCase().includes(busca.toLowerCase())
  );

  const formatDate = (d) => new Date(d+"T12:00:00").toLocaleDateString("pt-BR", {
    weekday:"long", day:"2-digit", month:"long", year:"numeric"
  });

  const ativas     = campanhasDoDia.filter(i => i.data_resolucao && new Date() <= new Date(i.data_resolucao)).length;
  const encerradas = campanhasDoDia.length - ativas;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020817", fontFamily:"Inter,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>

          <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:24 }}>
            <button onClick={() => navigate(voltarUrl)} style={{
              background:"#050E1F", color:"#475569", border:"1px solid #0D1F3C",
              borderRadius:9, padding:"8px 14px", cursor:"pointer", fontSize:16, marginTop:2
            }}>←</button>
            <div>
              <h1 style={{ fontSize:18, fontWeight:800, color:"#F1F5F9", textTransform:"capitalize" }}>{formatDate(date)}</h1>
              <p style={{ color:"#334155", fontSize:12, marginTop:4 }}>
                {loading ? "Carregando..." : `${campanhasDoDia.length} campanha(s) · ${ativas} ativa(s) · ${encerradas} encerrada(s)`}
              </p>
            </div>
          </div>

          {!loading && campanhasDoDia.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
              {[
                { label:"Total no dia", value:campanhasDoDia.length, color:"#6366F1", bg:"rgba(99,102,241,0.1)", border:"rgba(99,102,241,0.2)" },
                { label:"Ativas",       value:ativas,                color:"#10B981", bg:"rgba(16,185,129,0.1)", border:"rgba(16,185,129,0.2)" },
                { label:"Encerradas",   value:encerradas,            color:"#F87171", bg:"rgba(239,68,68,0.1)",  border:"rgba(239,68,68,0.2)"  },
              ].map(k => (
                <div key={k.label} style={{ background:k.bg, border:`1px solid ${k.border}`, borderRadius:10, padding:"14px 16px" }}>
                  <p style={{ fontSize:11, color:"#475569", marginBottom:4 }}>{k.label}</p>
                  <p style={{ fontSize:26, fontWeight:800, color:k.color }}>{k.value}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ position:"relative", marginBottom:16 }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#1E3A5F" }}>🔍</span>
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por ID, nome ou marca..."
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
            <div key={issue.chave}
              onClick={() => navigate(`/promo/${issue.chave}?mes=${mes}&ano=${ano}&from=${date}`)}
              style={{ background:"#050E1F", borderRadius:12, padding:"18px 20px", marginBottom:10, cursor:"pointer", border:"1px solid #0D1F3C", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.border="1px solid rgba(99,102,241,0.4)"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.background="#0A1628"; }}
              onMouseLeave={e => { e.currentTarget.style.border="1px solid #0D1F3C"; e.currentTarget.style.transform="none"; e.currentTarget.style.background="#050E1F"; }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, flexWrap:"wrap" }}>
                    <span style={{ background:"rgba(99,102,241,0.15)", color:"#818CF8", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5, border:"1px solid rgba(99,102,241,0.2)" }}>{issue.chave}</span>
                    {issue.casa && <span style={{ fontSize:11, color:"#F59E0B", background:"rgba(245,158,11,0.1)", padding:"2px 8px", borderRadius:5, border:"1px solid rgba(245,158,11,0.2)" }}>🏠 {issue.casa}</span>}
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:"#F1F5F9", marginBottom:7 }}>{issue.resumo}</h3>
                  <div style={{ display:"flex", gap:16, fontSize:11, color:"#334155", flexWrap:"wrap" }}>
                    <span>👤 {issue.responsavel || "—"}</span>
                    <span>⚡ {issue.prioridade  || "—"}</span>
                    <span>📁 {issue.catalogo    || "—"}</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                  <StatusBadge inicio={issue.data_inicio} fim={issue.data_resolucao} />
                  <span style={{ fontSize:10, color:"#1E3A5F" }}>Ver detalhes →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
