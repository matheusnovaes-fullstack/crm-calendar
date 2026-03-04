// App.jsx
import { useState, createContext, useContext } from "react";
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

// Hook helpers para consumir os contextos facilmente
export function useIssuesCtx()       { return useContext(IssuesContext); }
export function useNotificacoesCtx() { return useContext(NotificacoesContext); }

// ── Provider único de dados ────────────────────────────────
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
    <DataProvider>
      <Routes>
        <Route path="/"              element={<CalendarPage onAbrirTutorial={abrir} />} />
        <Route path="/day/:date"     element={<DayPage />} />
        <Route path="/promo/:key"    element={<PromoPage />} />
        <Route path="/campanhas"     element={<CampanhasPage />} />
        <Route path="/campanhas/:marca" element={<CampanhasPage />} />
        <Route path="/relatorios"    element={<RelatoriosPage />} />
      </Routes>
      {visivel && <Tutorial onFechar={fechar} />}
    </DataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
