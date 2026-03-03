import { BrowserRouter, Routes, Route } from "react-router-dom";
import CalendarPage   from "./pages/CalendarPage";
import DayPage        from "./pages/DayPage";
import PromoPage      from "./pages/PromoPage";
import CampanhasPage  from "./pages/CampanhasPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import Tutorial       from "./components/Tutorial";
import { useTutorial } from "./hooks/useTutorial";

function AppContent() {
  const { visivel, abrir, fechar } = useTutorial();

  return (
    <>
      <Routes>
        <Route path="/"                 element={<CalendarPage   onAbrirTutorial={abrir} />} />
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
