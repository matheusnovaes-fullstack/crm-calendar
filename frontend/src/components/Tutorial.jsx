import { useState } from "react";
import { useTemaCtx } from "../App";
import {
  Calendar, LayoutList, BarChart2, Bell,
  RefreshCw, ChevronRight, ChevronLeft, X,
  SlidersHorizontal, Tag, Trophy, Home, ArrowUpDown, ChevronDown
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
      "Passe o mouse sobre um dia para ver um tooltip com chave, segmento e tipo de prêmio",
    ],
    preview: (t) => (
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
        {/* Filtro marca */}
        <div style={{ display:"flex", gap:6 }}>
          {[
            { label:"Todas as marcas", ativo:true,  cor:"#6366F1" },
            { label:"7K",             ativo:false, cor:"#09ff00" },
            { label:"Cassino",        ativo:false, cor:"#1059b9" },
            { label:"Vera",           ativo:false, cor:"#66ff00" },
          ].map(m => (
            <div key={m.label} style={{
              padding:"3px 8px", borderRadius:6, fontSize:9, fontWeight:700,
              background: m.ativo ? `${m.cor}20` : "transparent",
              border: `1px solid ${m.ativo ? m.cor+"66" : t.border}`,
              color: m.ativo ? m.cor : t.textMuted,
            }}>{m.label}</div>
          ))}
        </div>

        {/* Mini calendário */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
            <div key={d} style={{ textAlign:"center", fontSize:9, fontWeight:700, color:t.textMuted, padding:"3px 0" }}>{d}</div>
          ))}
          {[...Array(5)].map((_,i) => <div key={i} />)}
          {[...Array(7)].map((_,i) => (
            <div key={i} style={{
              background: i===2 ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))" : t.cardAlt,
              border: i===2 ? "1.5px solid rgba(99,102,241,0.6)" : `1px solid ${t.border}`,
              borderRadius:6, padding:"6px 4px", minHeight:44,
            }}>
              <div style={{ fontSize:10, fontWeight:700, color:i===2?"#A5B4FC":i===4?t.textSub:t.textDeep }}>{i+8}</div>
              {i===4 && <div style={{ marginTop:3, fontSize:8, fontWeight:700, padding:"1px 3px", borderRadius:3, background:"rgba(16,185,129,0.15)", color:"#34D399", border:"1px solid rgba(16,185,129,0.3)", textAlign:"center" }}>INÍCIO</div>}
              {i===2 && <div style={{ marginTop:3, fontSize:8, fontWeight:700, padding:"1px 3px", borderRadius:3, background:"rgba(99,102,241,0.1)", color:"#818CF8", border:"1px solid rgba(99,102,241,0.2)", textAlign:"center" }}>EM CURSO</div>}
            </div>
          ))}
        </div>

        {/* Tooltip preview */}
        <div style={{ background:t.cardHover, border:`1px solid ${t.border}`, borderRadius:8, padding:"8px 12px" }}>
          <p style={{ fontSize:9, fontWeight:700, color:"#818CF8", marginBottom:3 }}>CP-42</p>
          <p style={{ fontSize:10, color:t.textSub, marginBottom:5 }}>Cashback VIP Semanal</p>
          <div style={{ display:"flex", gap:4 }}>
            <span style={{ fontSize:8, fontWeight:700, padding:"1px 5px", borderRadius:3, background:"rgba(167,139,250,0.15)", color:"#A78BFA", border:"1px solid rgba(167,139,250,0.25)", display:"flex", alignItems:"center", gap:2 }}>
              <Tag size={7} strokeWidth={2} /> VIP
            </span>
            <span style={{ fontSize:8, fontWeight:700, padding:"1px 5px", borderRadius:3, background:"rgba(52,211,153,0.12)", color:"#34D399", border:"1px solid rgba(52,211,153,0.25)", display:"flex", alignItems:"center", gap:2 }}>
              <Trophy size={7} strokeWidth={2} /> Cashback
            </span>
          </div>
        </div>
      </div>
    ),
  },

  {
    icon:    LayoutList,
    titulo:  "Página de Campanhas",
    descricao: "Visualize todas as campanhas em formato de lista com filtros avançados, ordenação e acesso ao detalhe completo de cada ticket.",
    detalhe: [
      "Filtre por Segmento / Público e Tipo de Prêmio nos chips interativos",
      "Ordene por data de início, fim, responsável ou chave",
      "Clique direto no chip de segmento ou prêmio de uma campanha para filtrar",
      "Status, SLA, Casa e marcas secundárias exibidos em tempo real",
    ],
    preview: (t) => (
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
        {/* Barra de filtro + ordenação */}
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:t.card, border:"1px solid rgba(99,102,241,0.4)", borderRadius:7, padding:"5px 10px", flex:1 }}>
            <SlidersHorizontal size={10} color="#A5B4FC" strokeWidth={2} />
            <span style={{ fontSize:9, fontWeight:700, color:"#A5B4FC" }}>Filtrar</span>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"#6366F1", marginLeft:2 }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:t.card, border:`1px solid ${t.border}`, borderRadius:7, padding:"5px 10px" }}>
            <ArrowUpDown size={10} color={t.textMuted} strokeWidth={2} />
            <span style={{ fontSize:9, color:t.textMuted }}>Início ↓</span>
          </div>
        </div>

        {/* Chips de segmento */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {[
            { label:"Todos", ativo:false, cor:"#6366F1" },
            { label:"VIP",   ativo:true,  cor:"#A78BFA" },
            { label:"Geral", ativo:false, cor:"#A78BFA" },
            { label:"Cashback", ativo:false, cor:"#34D399" },
          ].map(c => (
            <span key={c.label} style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:4, background: c.ativo ? `${c.cor}20` : "transparent", border:`1px solid ${c.ativo ? c.cor+"66" : t.border}`, color: c.ativo ? c.cor : t.textMuted }}>{c.label}</span>
          ))}
        </div>

        {/* Cards */}
        {[
          { chave:"CP-42", nome:"Cashback Semanal VIP", segmento:"VIP",   premio:"Cashback", cor:"#818CF8", casa:"7K"      },
          { chave:"CP-38", nome:"Torneio de Slots",     segmento:"Geral", premio:"Prêmio",   cor:"#F87171", casa:"Cassino" },
        ].map(c => (
          <div key={c.chave} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"9px 12px" }}>
            <div style={{ display:"flex", gap:5, marginBottom:5, flexWrap:"wrap" }}>
              <span style={{ fontSize:9, color:"#818CF8", fontWeight:700, background:"rgba(99,102,241,0.12)", padding:"1px 6px", borderRadius:4 }}>{c.chave}</span>
              <span style={{ fontSize:9, color:"#F59E0B", background:"rgba(245,158,11,0.1)", padding:"1px 6px", borderRadius:4, display:"flex", alignItems:"center", gap:3 }}>
                <Home size={8} strokeWidth={2} /> {c.casa}
              </span>
              <span style={{ fontSize:9, color:"#A78BFA", background:"rgba(167,139,250,0.1)", padding:"1px 6px", borderRadius:4, display:"flex", alignItems:"center", gap:3 }}>
                <Tag size={8} strokeWidth={2} /> {c.segmento}
              </span>
              <span style={{ fontSize:9, color:"#34D399", background:"rgba(52,211,153,0.1)", padding:"1px 6px", borderRadius:4, display:"flex", alignItems:"center", gap:3 }}>
                <Trophy size={8} strokeWidth={2} /> {c.premio}
              </span>
            </div>
            <p style={{ fontSize:11, color:t.textSub, fontWeight:600 }}>{c.nome}</p>
          </div>
        ))}
      </div>
    ),
  },

  {
    icon:    Bell,
    titulo:  "Notificações de Encerramento",
    descricao: "O sistema monitora automaticamente todas as campanhas ativas e dispara alertas sonoros e visuais quando uma campanha está prestes a encerrar.",
    detalhe: [
      "Aviso amarelo 15 minutos antes do encerramento",
      "Aviso vermelho urgente 5 minutos antes",
      "Sinal sonoro toca mesmo com outra aba ativa",
      "O popup exige confirmação para garantir que foi visto",
    ],
    preview: (t) => (
      <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ background:t.card, border:"1.5px solid rgba(251,191,36,0.4)", borderRadius:10, padding:"14px", display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Bell size={16} color="#FBBF24" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:"#FBBF24", marginBottom:3 }}>AVISO — 15 MIN</p>
            <p style={{ fontSize:13, fontWeight:800, color:t.text, marginBottom:3 }}>Faltam 15 minutos</p>
            <p style={{ fontSize:11, color:t.textSub }}>"<span style={{ color:t.text, fontWeight:600 }}>Cashback VIP</span>" encerra às 18:00.</p>
          </div>
        </div>
        <div style={{ background:t.card, border:"1.5px solid rgba(239,68,68,0.4)", borderRadius:10, padding:"14px", display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Bell size={16} color="#F87171" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:"#F87171", marginBottom:3 }}>URGENTE — 5 MIN</p>
            <p style={{ fontSize:13, fontWeight:800, color:t.text, marginBottom:3 }}>Faltam 5 minutos</p>
            <p style={{ fontSize:11, color:t.textSub }}>"<span style={{ color:t.text, fontWeight:600 }}>Torneio de Slots</span>" encerra às 18:10.</p>
          </div>
        </div>
      </div>
    ),
  },

  {
    icon:    RefreshCw,
    titulo:  "Sincronização com o Jira",
    descricao: "Todos os dados vêm diretamente do Jira Service Management em tempo real. Use o botão Sincronizar para forçar uma atualização manual, ou aguarde a atualização automática a cada 60 segundos.",
    detalhe: [
      "Dados sincronizados automaticamente a cada 60 segundos",
      "Novas campanhas inseridas no Jira aparecem destacadas em amarelo",
      "Campos como Segmento, Tipo de Prêmio, Casa e SLA vêm do Jira",
      "Use Sincronizar para forçar atualização imediata",
    ],
    preview: (t) => (
      <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:11, color:t.textMuted }}>Última sincronização</p>
            <p style={{ fontSize:13, fontWeight:600, color:t.textSub, marginTop:2 }}>Há 2 minutos</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"linear-gradient(135deg,#6366F1,#4F46E5)", padding:"8px 14px", borderRadius:8 }}>
            <RefreshCw size={12} color="#fff" strokeWidth={2.5} />
            <span style={{ fontSize:11, fontWeight:700, color:"#fff" }}>SINCRONIZAR</span>
          </div>
        </div>
        <div style={{ background:"linear-gradient(135deg,#FEF08A,#FDE047)", borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#713F12" }}>✦ NOVA PROMOÇÃO INSERIDA: CP-47</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["Segmento", "Tipo de Prêmio", "Casa", "SLA"].map(f => (
            <span key={f} style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:4, background:"rgba(99,102,241,0.1)", color:"#818CF8", border:"1px solid rgba(99,102,241,0.2)" }}>{f}</span>
          ))}
        </div>
      </div>
    ),
  },

  {
    icon:    BarChart2,
    titulo:  "Relatórios",
    descricao: "Acompanhe métricas e indicadores das campanhas. Visualize volume por período, componente, segmento e tipo de prêmio — e exporte os dados em CSV ou JSON.",
    detalhe: [
      "Gráficos de campanhas por mês, componente, segmento e tipo de prêmio",
      "Listas 'Ativas agora' e 'Últimas encerradas' com opção de expandir todas",
      "Filtre por período de início e encerramento",
      "Exporte escolhendo exatamente quais campos incluir (CSV ou JSON)",
    ],
    preview: (t) => (
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
        {/* KPIs */}
        <div style={{ display:"flex", gap:6 }}>
          {[
            { label:"Total",      value:"48",  color:"#818CF8" },
            { label:"Ativas",     value:"12",  color:"#34D399" },
            { label:"Encerradas", value:"36",  color:"#F87171" },
            { label:"Agendadas",  value:"4",   color:"#A78BFA" },
          ].map(m => (
            <div key={m.label} style={{ flex:1, background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 6px", textAlign:"center" }}>
              <p style={{ fontSize:16, fontWeight:800, color:m.color }}>{m.value}</p>
              <p style={{ fontSize:8, color:t.textMuted, marginTop:2, fontWeight:600 }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Gráficos mini */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {[
            { titulo:"POR SEGMENTO", cor:"#A78BFA", icone:Tag,    dados:[["VIP",80],["Geral",50],["Bronze",30]] },
            { titulo:"POR PRÊMIO",   cor:"#34D399", icone:Trophy, dados:[["Cashback",70],["Bônus",45],["Freebet",20]] },
          ].map(g => (
            <div key={g.titulo} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px" }}>
              <p style={{ fontSize:8, fontWeight:700, color:t.textMuted, marginBottom:6, display:"flex", alignItems:"center", gap:4 }}>
                <g.icone size={8} strokeWidth={2} /> {g.titulo}
              </p>
              {g.dados.map(([label, pct]) => (
                <div key={label} style={{ marginBottom:4 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:8, color:t.textMuted }}>{label}</span>
                    <span style={{ fontSize:8, fontWeight:700, color:g.cor }}>{pct}%</span>
                  </div>
                  <div style={{ height:4, background:t.cardHover, borderRadius:2 }}>
                    <div style={{ height:4, borderRadius:2, width:pct+"%", background:g.cor }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Lista expansível preview */}
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 12px" }}>
          <p style={{ fontSize:8, fontWeight:700, color:t.textMuted, marginBottom:6 }}>ATIVAS AGORA</p>
          {[["CP-42","Cashback VIP"],["CP-39","Torneio Slots"]].map(([k,n]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${t.border}` }}>
              <span style={{ fontSize:9, color:"#818CF8", fontWeight:700 }}>{k} <span style={{ color:t.textSub, fontWeight:400 }}>{n}</span></span>
              <span style={{ fontSize:9, color:"#10B981" }}>ativa</span>
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:6, fontSize:9, color:t.textMuted }}>
            <ChevronDown size={10} strokeWidth={2} /> Ver mais 10 campanhas
          </div>
        </div>
      </div>
    ),
  },
];

export default function Tutorial({ onFechar }) {
  const [passo, setPasso] = useState(0);
  const { t }             = useTemaCtx();

  const total  = PASSOS.length;
  const atual  = PASSOS[passo];
  const Icone  = atual.icon;
  const ultimo = passo === total - 1;

  return (
    <>
      <div style={{
        position:"fixed", inset:0,
        background:"rgba(0,0,0,0.75)",
        backdropFilter:"blur(6px)",
        zIndex:9990,
        animation:"fadeIn 0.3s ease"
      }} />

      <div style={{
        position:"fixed", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        zIndex:9991,
        background:t.card,
        border:`1px solid ${t.border}`,
        borderRadius:20,
        width:520,
        maxHeight:"90vh",
        overflowY:"auto",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.08)",
        animation:"slideUp 0.3s ease",
        transition:"background 0.2s"
      }}>

        {/* Header */}
        <div style={{ padding:"24px 28px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", gap:6 }}>
            {PASSOS.map((_,i) => (
              <div key={i} onClick={() => setPasso(i)} style={{
                width:i===passo ? 20 : 6, height:6, borderRadius:3,
                background:i===passo ? "#6366F1" : i < passo ? "#4F46E5" : t.border,
                cursor:"pointer", transition:"all 0.3s ease"
              }} />
            ))}
          </div>
          <button onClick={onFechar} style={{
            background:t.cardHover, border:`1px solid ${t.border}`, borderRadius:8,
            width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", color:t.textMuted, transition:"all 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.background=t.cardAlt; e.currentTarget.style.color=t.textSub; }}
            onMouseLeave={e => { e.currentTarget.style.background=t.cardHover; e.currentTarget.style.color=t.textMuted; }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ padding:"20px 28px 28px" }}>

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
              <h2 style={{ fontSize:17, fontWeight:800, color:t.text, lineHeight:1.2 }}>
                {atual.titulo}
              </h2>
            </div>
          </div>

          <p style={{ fontSize:13, color:t.textSub, lineHeight:1.7, marginBottom:16 }}>
            {atual.descricao}
          </p>

          <div style={{ background:t.cardAlt, border:`1px solid ${t.border}`, borderRadius:12, padding:"16px" }}>
            {atual.preview(t)}
          </div>

          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
            {atual.detalhe.map((d, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#6366F1", flexShrink:0, marginTop:5 }} />
                <p style={{ fontSize:12, color:t.textMuted, lineHeight:1.5 }}>{d}</p>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            {passo > 0 && (
              <button onClick={() => setPasso(p => p - 1)} style={{
                display:"flex", alignItems:"center", gap:6,
                background:t.cardHover, border:`1px solid ${t.border}`, borderRadius:10,
                padding:"11px 18px", cursor:"pointer", fontSize:12, fontWeight:600, color:t.textMuted,
                transition:"all 0.15s"
              }}
                onMouseEnter={e => { e.currentTarget.style.color=t.textSub; e.currentTarget.style.borderColor="rgba(99,102,241,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color=t.textMuted; e.currentTarget.style.borderColor=t.border; }}
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

          {!ultimo && (
            <button onClick={onFechar} style={{
              width:"100%", marginTop:12, background:"none", border:"none",
              cursor:"pointer", fontSize:11, color:t.textDeep, padding:"4px",
              transition:"color 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.color=t.textMuted}
              onMouseLeave={e => e.currentTarget.style.color=t.textDeep}
            >
              Pular tutorial
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
      `}</style>
    </>
  );
}
