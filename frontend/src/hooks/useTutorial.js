import { useState, useEffect } from "react";

const CHAVE = "crm_tutorial_visto";

export function useTutorial() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const jaViu = localStorage.getItem(CHAVE);
    if (!jaViu) {
      // Pequeno delay para a UI carregar primeiro
      const t = setTimeout(() => setVisivel(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function abrir()  { setVisivel(true); }
  function fechar() {
    setVisivel(false);
    localStorage.setItem(CHAVE, "true");
  }

  return { visivel, abrir, fechar };
}
