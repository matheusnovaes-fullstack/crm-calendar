import { useState, useEffect } from "react";

const DOMINIOS_PERMITIDOS = [
  "anagaming.com.br",
  "cactusgaming.net",
  "convertax.com.br"
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [erro, setErro]         = useState("");
  const [bemVindo, setBemVindo] = useState(false);
  const [nome, setNome]         = useState("");
  const [opacity, setOpacity]   = useState(0);

  useEffect(() => {
    if (bemVindo) {
      setTimeout(() => setOpacity(1), 50);
      setTimeout(() => setOpacity(0), 2500);
      setTimeout(() => onLogin(email), 3200);
    }
  }, [bemVindo]);

  function handleSubmit(e) {
    e.preventDefault();
    const dominio = email.split("@")[1]?.toLowerCase();

    if (DOMINIOS_PERMITIDOS.includes(dominio)) {
      const primeiroNome = email.split("@")[0].split(".")[0];
      const nomeFormatado = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1);
      setNome(nomeFormatado);
      localStorage.setItem("crm_email", email);
      setBemVindo(true);
    } else {
      setErro("Email não autorizado.");
    }
  }

  if (bemVindo) {
    return (
      <div style={{
        display:"flex", justifyContent:"center", alignItems:"center",
        height:"100vh", background:"#0f172a",
        transition:"opacity 0.7s ease",
        opacity: opacity
      }}>
        <div style={{ textAlign:"center" }}>
          <h1 style={{ color:"#fff", fontSize:"2rem", marginBottom:"0.5rem" }}>
            Bem-vindo, {nome}! 👋
          </h1>
          <p style={{ color:"#94a3b8", fontSize:"1rem" }}>Carregando o CRM Calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:"#0f172a" }}>
      <form onSubmit={handleSubmit} style={{ background:"#1e293b", padding:"2rem", borderRadius:"12px", width:"320px", display:"flex", flexDirection:"column", gap:"1rem" }}>
        <h2 style={{ color:"#fff", textAlign:"center", margin:0 }}>CRM Calendar</h2>
        <input
          type="email"
          placeholder="Seu email corporativo"
          value={email}
          onChange={e => { setEmail(e.target.value); setErro(""); }}
          required
          style={{ padding:"0.75rem", borderRadius:"8px", border:"1px solid #334155", background:"#0f172a", color:"#fff" }}
        />
        {erro && <p style={{ color:"#f87171", margin:0, fontSize:"0.85rem" }}>{erro}</p>}
        <button type="submit" style={{ padding:"0.75rem", borderRadius:"8px", background:"#6366f1", color:"#fff", border:"none", cursor:"pointer", fontWeight:"bold" }}>
          Entrar
        </button>
      </form>
    </div>
  );
}
