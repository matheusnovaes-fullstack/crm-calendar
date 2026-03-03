import { useState, useEffect } from "react";

const DOMINIOS_PERMITIDOS = [
  "anagaming.com.br",
  "cactusgaming.net",
  "convertax.com.br"
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 4}s`,
  duration: `${3 + Math.random() * 4}s`,
  size: `${2 + Math.random() * 3}px`,
}));

export default function LoginPage({ onLogin }) {
  const [email, setEmail]         = useState("");
  const [erro, setErro]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [bemVindo, setBemVindo]   = useState(false);
  const [nome, setNome]           = useState("");
  const [cardOpacity, setCardOpacity] = useState(0);
  const [cardY, setCardY]         = useState(24);
  const [welcomePhase, setWelcomePhase] = useState(0);
  // 0 = oculto, 1 = fade-in, 2 = visível, 3 = fade-out

  useEffect(() => {
    setTimeout(() => { setCardOpacity(1); setCardY(0); }, 100);
  }, []);

  useEffect(() => {
    if (!bemVindo) return;
    setTimeout(() => setWelcomePhase(1), 50);
    setTimeout(() => setWelcomePhase(2), 700);
    setTimeout(() => setWelcomePhase(3), 2800);
    setTimeout(() => onLogin(email), 3600);
  }, [bemVindo]);

  function handleSubmit(e) {
    e.preventDefault();
    const dominio = email.split("@")[1]?.toLowerCase();
    if (DOMINIOS_PERMITIDOS.includes(dominio)) {
      setLoading(true);
      const primeiroNome = email.split("@")[0].split(".")[0];
      setNome(primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1));
      localStorage.setItem("crm_email", email);
      setTimeout(() => { setLoading(false); setBemVindo(true); }, 900);
    } else {
      setErro("Email não autorizado.");
    }
  }

  const welcomeOpacity = welcomePhase === 0 ? 0 : welcomePhase === 1 ? 0 : welcomePhase === 2 ? 1 : 0;
  const welcomeScale   = welcomePhase === 0 ? 0.92 : welcomePhase === 1 ? 0.92 : 1;

  if (bemVindo) {
    return (
      <>
        <style>{`
          @keyframes particleFloat {
            0%   { transform: translateY(100vh) scale(0); opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 1; }
            100% { transform: translateY(-10vh) scale(1); opacity: 0; }
          }
          @keyframes pulseRing {
            0%   { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>
        <div style={{
          position:"fixed", inset:0,
          background:"radial-gradient(ellipse at 50% 40%, #0f0c29 0%, #020817 60%, #000 100%)",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden",
        }}>
          {/* Partículas */}
          {PARTICLES.map(p => (
            <div key={p.id} style={{
              position:"absolute", left:p.left, bottom:"-10px",
              width:p.size, height:p.size, borderRadius:"50%",
              background:"#6366f1",
              boxShadow:"0 0 6px #6366f1, 0 0 12px #818cf8",
              animation:`particleFloat ${p.duration} ${p.delay} ease-in infinite`,
            }} />
          ))}

          {/* Anel pulsante */}
          <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.4)", animation:"pulseRing 2s ease-out infinite" }} />
          <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.2)", animation:"pulseRing 2s 0.6s ease-out infinite" }} />

          {/* Conteúdo */}
          <div style={{
            textAlign:"center", zIndex:10,
            transition:"opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1)",
            opacity: welcomeOpacity,
            transform: `scale(${welcomeScale})`,
          }}>
            <div style={{
              width:72, height:72, borderRadius:"50%", margin:"0 auto 24px",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:32, boxShadow:"0 0 40px rgba(99,102,241,0.5)",
            }}>🎯</div>

            <h1 style={{
              fontSize:"2.2rem", fontWeight:800, margin:"0 0 8px",
              background:"linear-gradient(90deg, #fff 0%, #818cf8 50%, #fff 100%)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              animation:"shimmer 2.5s linear infinite",
              fontFamily:"Inter, sans-serif", letterSpacing:"-0.5px",
            }}>
              Bem-vindo, {nome}!
            </h1>

            <p style={{
              color:"#475569", fontSize:"0.95rem",
              fontFamily:"Inter, sans-serif", letterSpacing:"0.5px",
            }}>
              Entrando no CRM Calendar...
            </p>

            {/* Barra de progresso */}
            <div style={{ marginTop:28, width:200, margin:"28px auto 0", background:"rgba(99,102,241,0.15)", borderRadius:99, height:3, overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:99,
                background:"linear-gradient(90deg,#6366f1,#8b5cf6)",
                transition:"width 2.2s cubic-bezier(.4,0,.6,1)",
                width: welcomePhase >= 2 ? "100%" : "0%",
                boxShadow:"0 0 8px #6366f1",
              }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes particleFloat {
          0%   { transform: translateY(100vh) scale(0); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
        @keyframes gridMove {
          0%   { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-input {
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: 1px solid #1e293b;
          background: #020817;
          color: #f1f5f9;
          font-size: 0.9rem;
          font-family: Inter, sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .login-input::placeholder { color: #334155; }
        .login-btn {
          padding: 0.85rem;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.95rem;
          font-family: Inter, sans-serif;
          letter-spacing: 0.3px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div style={{
        display:"flex", justifyContent:"center", alignItems:"center",
        minHeight:"100vh", fontFamily:"Inter,sans-serif",
        background:"radial-gradient(ellipse at 50% 0%, #0f0c29 0%, #020817 55%, #000 100%)",
        overflow:"hidden", position:"relative",
      }}>

        {/* Grid animado de fundo */}
        <div style={{
          position:"absolute", inset:0, opacity:0.04,
          backgroundImage:`linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`,
          backgroundSize:"60px 60px",
          animation:"gridMove 4s linear infinite",
        }} />

        {/* Partículas */}
        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position:"absolute", left:p.left, bottom:"-10px",
            width:p.size, height:p.size, borderRadius:"50%",
            background:"rgba(99,102,241,0.7)",
            animation:`particleFloat ${p.duration} ${p.delay} ease-in infinite`,
          }} />
        ))}

        {/* Glow central */}
        <div style={{
          position:"absolute", width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents:"none",
        }} />

        {/* Card */}
        <div style={{
          position:"relative", zIndex:10,
          background:"rgba(5,14,31,0.85)",
          backdropFilter:"blur(20px)",
          border:"1px solid rgba(99,102,241,0.18)",
          borderRadius:20, padding:"2.5rem 2rem",
          width:360, boxSizing:"border-box",
          boxShadow:"0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
          transition:`opacity 0.6s ease, transform 0.6s ease`,
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
        }}>

          {/* Logo / ícone */}
          <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
            <div style={{
              width:56, height:56, borderRadius:16, margin:"0 auto 14px",
              background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:26, boxShadow:"0 8px 24px rgba(99,102,241,0.4)",
            }}>🎯</div>
            <h2 style={{ color:"#f1f5f9", fontSize:"1.35rem", fontWeight:800, margin:"0 0 4px", letterSpacing:"-0.3px" }}>
              CRM Calendar
            </h2>
            <p style={{ color:"#334155", fontSize:"0.8rem", margin:0, letterSpacing:"0.5px" }}>
              ACESSO CORPORATIVO
            </p>
          </div>

          {/* Linha divisória */}
          <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)", marginBottom:"1.75rem" }} />

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
            <div>
              <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#475569", letterSpacing:"0.8px", display:"block", marginBottom:6 }}>
                EMAIL CORPORATIVO
              </label>
              <input
                className="login-input"
                type="email"
                placeholder="voce@suaempresa.com.br"
                value={email}
                onChange={e => { setEmail(e.target.value); setErro(""); }}
                required
                autoComplete="email"
              />
            </div>

            {erro && (
              <div style={{
                background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
                borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ fontSize:14 }}>⚠️</span>
                <p style={{ color:"#f87171", margin:0, fontSize:"0.82rem" }}>{erro}</p>
              </div>
            )}

            <button className="login-btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                  Verificando...
                </span>
              ) : "Entrar →"}
            </button>
          </form>

          {/* Rodapé */}
          <p style={{ textAlign:"center", color:"#1e293b", fontSize:"0.72rem", marginTop:"1.5rem", marginBottom:0, letterSpacing:"0.3px" }}>
            Acesso restrito a domínios autorizados
          </p>
        </div>
      </div>
    </>
  );
}
