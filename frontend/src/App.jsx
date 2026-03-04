// App.jsx
import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CalendarPage from "./pages/CalendarPage";
import DayPage from "./pages/DayPage";
import PromoPage from "./pages/PromoPage";
import CampanhasPage from "./pages/CampanhasPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import Tutorial from "./components/Tutorial";
import LoginPage from "./pages/LoginPage";
import { useTutorial } from "./hooks/useTutorial";
import { useIssues } from "./hooks/useIssues";
import { useNotificacoes } from "./hooks/useNotificacoes";
import MANUTENCAO from "./config/manutencao";
import ManutencaoScreen from "./components/ManutencaoScreen";

// ── Contexts ──────────────────────────────────────────────
export const IssuesContext       = createContext(null);
export const NotificacoesContext = createContext(null);
export const TemaContext         = createContext(null);

export function useIssuesCtx()       { return useContext(IssuesContext); }
export function useNotificacoesCtx() { return useContext(NotificacoesContext); }
export function useTemaCtx()         { return useContext(TemaContext); }

// ── Paleta de cores exportável ─────────────────────────────
export const TEMA = {
  dark: {
    bg:          "#020817",
    sidebar:     "#050E1F",
    card:        "#050E1F",
    cardHover:   "#0A1628",
    cardAlt:     "#030912",
    border:      "#0D1F3C",
    borderHover: "rgba(99,102,241,0.4)",
    text:        "#F1F5F9",
    textSub:     "#94A3B8",
    textMuted:   "#64748B",
    textDim:     "#334155",
    textDeep:    "#1E3A5F",
    input:       "#050E1F",
    inputAlt:    "#030912",
    colorScheme: "dark",
  },
  light: {
    bg:          "#F1F5F9",
    sidebar:     "#FFFFFF",
    card:        "#FFFFFF",
    cardHover:   "#F8FAFC",
    cardAlt:     "#F1F5F9",
    border:      "#E2E8F0",
    borderHover: "rgba(99,102,241,0.5)",
    text:        "#0F172A",
    textSub:     "#334155",
    textMuted:   "#64748B",
    textDim:     "#94A3B8",
    textDeep:    "#CBD5E1",
    input:       "#FFFFFF",
    inputAlt:    "#F8FAFC",
    colorScheme: "light",
  }
};

// ── Provider de tema ───────────────────────────────────────
function TemaProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem("crm_tema") || "dark");

  useEffect(() => {
    localStorage.setItem("crm_tema", tema);
    document.body.style.background = TEMA[tema].bg;
    document.body.style.transition = "background 0.2s";
  }, [tema]);

  function toggleTema() { setTema(t => t === "dark" ? "light" : "dark"); }

  return (
    <TemaContext.Provider value={{ tema, toggleTema, t: TEMA[tema] }}>
      {children}
    </TemaContext.Provider>
  );
}

// ── Provider de dados ──────────────────────────────────────
function DataProvider({ children }) {
  const issuesValue       = useIssues("CP");
  const notificacoesValue = useNotificacoes(issuesValue.issues);

  return (
    <IssuesContext.Provider value={issuesValue}>
      <NotificacoesContext.Provider value={notificacoesValue}>
        {children}
      </NotificacoesContext.Provider>
    </IssuesContext.Provider>
  );
}

// ── App principal ──────────────────────────────────────────
function AppContent() {
  const { visivel, abrir, fechar } = useTutorial();
  const [email, setEmail] = useState(localStorage.getItem("crm_email") || "");

  if (MANUTENCAO.ativo) {
    return (
      <ManutencaoScreen
        titulo={MANUTENCAO.titulo}
        mensagem={MANUTENCAO.mensagem}
        previsao={MANUTENCAO.previsao}
      />
    );
  }

  if (!email) {
    return <LoginPage onLogin={setEmail} />;
  }

  return (
    <TemaProvider>
      <DataProvider>
        <Routes>
          <Route path="/"                 element={<CalendarPage onAbrirTutorial={abrir} />} />
          <Route path="/day/:date"        element={<DayPage />} />
          <Route path="/promo/:key"       element={<PromoPage />} />
          <Route path="/campanhas"        element={<CampanhasPage />} />
          <Route path="/campanhas/:marca" element={<CampanhasPage />} />
          <Route path="/relatorios"       element={<RelatoriosPage />} />
        </Routes>
        {visivel && <Tutorial onFechar={fechar} />}
      </DataProvider>
    </TemaProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
