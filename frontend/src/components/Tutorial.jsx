import { useState } from "react";
import {
  Calendar, LayoutList, BarChart2, Bell,
  RefreshCw, ChevronRight, ChevronLeft, X
} from "lucide-react";

const PASSOS = [
  {
    icon:    Calendar,
    titulo:  "Calendário de Campanhas",
    descricao: "A tela principal exibe todas as campanhas do mês em formato de calendário. Cada dia mostra se uma campanha está iniciando, em curso ou encerrando — com código de cores para leitura rápida.",
    detalhe: [
      "Clique em qualquer dia com campanha para ver os detalhes",
      "Use as setas para navegar entre os meses",
      "O dia atual é destacado em roxo",
    ],
    preview: (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginTop:12 }}>
        {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:9, fontWeight:700, color:"#475569", padding:"3px 0" }}>{d}</div>
        ))}
        {[...Array(5)].map((_,i) => <div key={i} />)}
        {[...Array(7)].map((_,i) => (
          <div key={i} style={{
            background: i===2 ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))" : i===4 ? "#050E1F" : "#030912",
            border: i===2 ? "1.5px solid rgba(99,102,241,0.6)" : i===4 ? "1px solid #0D1F3C" : "1px solid #080F1E",
            borderRadius:6, padding:"6px 4px", minHeight:44,
          }}>
            <div style={{ fontSize:10, fontWeight:700, color: i===2?"#A5B4FC":i===4?"#94A3B8":"#1E3A5F" }}>{i+8}</div>
            {i===4 && <div style={{ marginTop:3, fontSize:8, fontWeight:700, padding:"1px 3px", borderRadius:3, background:"rgba(16,185,129,0.15)", color:"#34D399", border:"1px solid rgba(16,185,129,0.3)", textAlign:"center" }}>INÍCIO</div>}
            {i===2 && <div style={{ marginTop:3, fontSize:8, fontWeight:700, padding:"1px 3px", borderRadius:3, background:"rgba(99,102,241,0.1)", color:"#818CF8", border:"1px solid rgba(99,102,241,0.2)", textAlign:"center" }}>EM CURSO</div>}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon:    LayoutList,
    titulo:  "Página de Campanhas",
    descricao: "Visualize todas as campanhas em formato de lista, com filtro por marca. Acesse os detalhes completos de cada ticket diretamente do Jira — campos como Casa, Jogo, Valor e Responsável.",
    detalhe: [
      "Filtre por marca no menu lateral: 7K, Cassino ou Vera",
      "Clique em qualquer campanha para ver todos os campos",
      "Status e SLA são exibidos em tempo real",
    ],
    preview: (
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:12 }}>
        {[
          { chave:"CP-12", nome:"Cashback Semanal VIP", status:"Em Andamento", cor:"#818CF8" },
          { chave:"CP-9",  nome:"Torneio de Slots",     status:"Encerrado",    cor:"#F87171" },
          { chave:"CP-7",  nome:"Bônus de Boas-vindas", status:"Em Andamento", cor:"#818CF8" },
        ].map(c => (
          <div key={c.chave} style={{ background:"#050E1F", border:"1px solid #0D1F3C", borderRadius:8, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <span style={{ fontSize:10, color:"#475569", fontWeight:600 }}>{c.chave}</span>
              <p style={{ fontSize:12, color:"#CBD5E1", fontWeight:600, marginTop:2 }}>{c.nome}</p>
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:c.cor, background:`${c.cor}18`, padding:"3px 8px", borderRadius:20, border:`1px solid ${c.cor}44` }}>{c.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon:    Bell,
    titulo:  "Notificações de Encerramento",
    descricao: "O sistema monitora automaticamente todas as campanhas ativas e dispara alertas sonoros e visuais quando uma campanha está prestes a encerrar — mesmo que você esteja em outra aba.",
    detalhe: [
      "Aviso amarelo 15 minutos antes do encerramento",
      "Aviso vermelho urgente 5 minutos antes",
      "Sinal sonoro toca mesmo com outra aba ativa",
      "O popup exige confirmação para garantir que foi visto",
    ],
    preview: (
      <div style={{ marginTop:12 }}>
        <div style={{ background:"#050E1F", border:"1.5px solid rgba(251,191,36,0.4)", borderRadius:10, padding:"16px", display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Bell size={16} color="#FBBF24" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:"#FBBF24", marginBottom:4 }}>AVISO DE ENCERRAMENTO</p>
            <p style={{ fontSize:13, fontWeight:800, color:"#F1F5F9", marginBottom:4 }}>Faltam 15 minutos</p>
            <p style={{ fontSize:11, color:"#94A3B8" }}>A campanha <span style={{ color:"#E2E8F0", fontWeight:600 }}>"Cashback VIP"</span> encerra às 18:00.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon:    RefreshCw,
    titulo:  "Sincronização com o Jira",
    descricao: "Todos os dados vêm diretamente do Jira Service Management em tempo real. Use o botão Sincronizar para forçar uma atualização manual, ou aguarde a atualização automática.",
    detalhe: [
      "Dados sincronizados automaticamente ao abrir o dashboard",
      "Novas campanhas inseridas no Jira aparecem destacadas em amarelo",
      "Use Sincronizar para forçar atualização imediata",
    ],
    preview: (
      <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ background:"#050E1F", border:"1px solid #0D1F3C", borderRadius:8, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:11, color:"#64748B" }}>Última sincronização</p>
            <p style={{ fontSize:13, fontWeight:600, color:"#CBD5E1", marginTop:2 }}>Há 2 minutos</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"linear-gradient(135deg,#6366F1,#4F46E5)", padding:"8px 14px", borderRadius:8 }}>
            <RefreshCw size={12} color="#fff" strokeWidth={2.5} />
            <span style={{ fontSize:11, fontWeight:700, color:"#fff" }}>SINCRONIZAR</span>
          </div>
        </div>
        <div style={{ background:"linear-gradient(135deg,#FEF08A,#FDE047)", borderRadius:8, padding:"10px 14px" }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#713F12" }}>NOVA PROMOÇÃO INSERIDA: CP-15</p>
        </div>
      </div>
    ),
  },
  {
    icon:    BarChart2,
    titulo:  "Relatórios",
    descricao: "Acompanhe métricas e indicadores das campanhas ao longo do tempo. Visualize volume por período, status, marca e responsável — tudo gerado a partir dos dados do Jira.",
    detalhe: [
      "Filtre por período, marca ou responsável",
      "Exporte os dados para análise externa",
      "Métricas de SLA e tempo médio de resolução",
    ],
    preview: (
      <div style={{ marginTop:12, display:"flex", gap:8 }}>
        {[
          { label:"Total",      value:"48", color:"#818CF8" },
          { label:"Ativas",     value:"12", color:"#34D399" },
          { label:"Encerradas", value:"36", color:"#F87171" },
          { label:"SLA OK",     value:"91%",color:"#34D399" },
        ].map(m => (
          <div key={m.label} style={{ flex:1, background:"#050E1F", border:"1px solid #0D1F3C", borderRadius:8, padding:"12px 8px", textAlign:"center" }}>
            <p style={{ fontSize:18, fontWeight:800, color:m.color }}>{m.value}</p>
            <p style={{ fontSize:9, color:"#64748B", marginTop:3, fontWeight:600 }}>{m.label}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Tutorial({ onFechar }) {
  const [passo, setPasso] = useState(0);
  const total             = PASSOS.length;
  const atual             = PASSOS[passo];
  const Icone             = atual.icon;
  const ultimo            = passo === total - 1;

  return (
    <>
      {/* Overlay */}
      <div style={{
        position:"fixed", inset:0,
        background:"rgba(0,0,0,0.75)",
        backdropFilter:"blur(6px)",
        zIndex:9990,
        animation:"fadeIn 0.3s ease"
      }} />

      {/* Modal */}
      <div style={{
        position:"fixed", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        zIndex:9991,
        background:"#050E1F",
        border:"1px solid #0D1F3C",
        borderRadius:20,
        width:520,
        maxHeight:"90vh",
        overflowY:"auto",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.08)",
        animation:"slideUp 0.3s ease"
      }}>

        {/* Header */}
        <div style={{ padding:"24px 28px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", gap:6 }}>
            {PASSOS.map((_,i) => (
              <div key={i} onClick={() => setPasso(i)} style={{
                width: i===passo ? 20 : 6, height:6, borderRadius:3,
                background: i===passo ? "#6366F1" : i < passo ? "#4F46E5" : "#0D1F3C",
                cursor:"pointer", transition:"all 0.3s ease"
              }} />
            ))}
          </div>
          <button onClick={onFechar} style={{
            background:"#0A1628", border:"1px solid #0D1F3C", borderRadius:8,
            width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", color:"#475569", transition:"all 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.background="#0D1F3C"; e.currentTarget.style.color="#94A3B8"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#0A1628"; e.currentTarget.style.color="#475569"; }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ padding:"20px 28px 28px" }}>

          {/* Ícone + título */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))",
              border:"1px solid rgba(99,102,241,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
            }}>
              <Icone size={22} color="#818CF8" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, color:"#6366F1", marginBottom:4 }}>
                PASSO {passo + 1} DE {total}
              </p>
              <h2 style={{ fontSize:17, fontWeight:800, color:"#F1F5F9", lineHeight:1.2 }}>
                {atual.titulo}
              </h2>
            </div>
          </div>

          {/* Descrição */}
          <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.7, marginBottom:16 }}>
            {atual.descricao}
          </p>

          {/* Preview */}
          <div style={{ background:"#030912", border:"1px solid #0D1F3C", borderRadius:12, padding:"16px" }}>
            {atual.preview}
          </div>

          {/* Detalhes */}
          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
            {atual.detalhe.map((d, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#6366F1", flexShrink:0, marginTop:5 }} />
                <p style={{ fontSize:12, color:"#64748B", lineHeight:1.5 }}>{d}</p>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            {passo > 0 && (
              <button onClick={() => setPasso(p => p - 1)} style={{
                display:"flex", alignItems:"center", gap:6,
                background:"#0A1628", border:"1px solid #0D1F3C", borderRadius:10,
                padding:"11px 18px", cursor:"pointer", fontSize:12, fontWeight:600, color:"#64748B",
                transition:"all 0.15s"
              }}
                onMouseEnter={e => { e.currentTarget.style.color="#94A3B8"; e.currentTarget.style.borderColor="#1E3A5F"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#64748B"; e.currentTarget.style.borderColor="#0D1F3C"; }}
              >
                <ChevronLeft size={14} strokeWidth={2.5} /> Anterior
              </button>
            )}
            <button onClick={() => ultimo ? onFechar() : setPasso(p => p + 1)} style={{
              flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              background:"linear-gradient(135deg,#6366F1,#4F46E5)", color:"#fff",
              border:"none", borderRadius:10, padding:"11px 18px",
              cursor:"pointer", fontSize:12, fontWeight:700,
              boxShadow:"0 4px 14px rgba(99,102,241,0.4)",
              transition:"opacity 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              {ultimo ? "Começar a usar" : "Próximo"}
              {!ultimo && <ChevronRight size={14} strokeWidth={2.5} />}
            </button>
          </div>

          {/* Pular */}
          {!ultimo && (
            <button onClick={onFechar} style={{
              width:"100%", marginTop:12, background:"none", border:"none",
              cursor:"pointer", fontSize:11, color:"#334155", padding:"4px",
              transition:"color 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.color="#475569"}
              onMouseLeave={e => e.currentTarget.style.color="#334155"}
            >
              Pular tutorial
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translate(-50%,-46%) } to { opacity:1; transform:translate(-50%,-50%) } }
      `}</style>
    </>
  );
}
