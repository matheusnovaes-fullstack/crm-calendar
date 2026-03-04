import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CalendarPage from "./pages/CalendarPage";
import DayPage from "./pages/DayPage";
import PromoPage from "./pages/PromoPage";
import CampanhasPage from "./pages/CampanhasPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import Tutorial from "./components/Tutorial";
import LoginPage from "./pages/LoginPage";
import { useTutorial } from "./hooks/useTutorial";
import MANUTENCAO from "./config/manutencao";
import ManutencaoScreen from "./components/ManutencaoScreen";

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
    <>
      <Routes>
        <Route path="/"                 element={<CalendarPage onAbrirTutorial={abrir} />} />
        <Route path="/day/:date"        element={<DayPage />}        />
        <Route path="/promo/:key"       element={<PromoPage />}      />
        <Route path="/campanhas"        element={<CampanhasPage />}  />
        <Route path="/campanhas/:marca" element={<CampanhasPage />}  />
        <Route path="/relatorios"       element={<RelatoriosPage />} />
      </Routes>
      {visivel && <Tutorial onFechar={fechar} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
