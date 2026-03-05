import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";

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

const IconCalendar = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="2.5" />
  </svg>
);

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

export default function LoginPage({ onLogin }) {
  const [erro,         setErro]         = useState("");
  const [loading,      setLoading]      = useState(false);
  const [bemVindo,     setBemVindo]     = useState(false);
  const [nome,         setNome]         = useState("");
  const [cardOpacity,  setCardOpacity]  = useState(0);
  const [cardY,        setCardY]        = useState(24);
  const [welcomePhase, setWelcomePhase] = useState(0);
  const [emailUsuario, setEmailUsuario] = useState("");

  useEffect(() => {
    setTimeout(() => { setCardOpacity(1); setCardY(0); }, 100);
  }, []);

  useEffect(() => {
    if (!bemVindo) return;
    setTimeout(() => setWelcomePhase(1),   50);
    setTimeout(() => setWelcomePhase(2),  700);
    setTimeout(() => setWelcomePhase(3), 2800);
    setTimeout(() => onLogin(emailUsuario), 3600);
  }, [bemVindo]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErro("");
      try {
        const res  = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const user = await res.json();
        const dominio = user.email?.split("@")[1]?.toLowerCase();

        if (!DOMINIOS_PERMITIDOS.includes(dominio)) {
          setErro(`Domínio @${dominio} não autorizado.`);
          setLoading(false);
          return;
        }

        localStorage.setItem("crm_email",  user.email);
        localStorage.setItem("crm_nome",   user.name);
        localStorage.setItem("crm_avatar", user.picture);

        const primeiroNome = user.given_name || user.name.split(" ")[0];
        setNome(primeiroNome);
        setEmailUsuario(user.email);
        setLoading(false);
        setBemVindo(true);

      } catch {
        setErro("Erro ao verificar sua conta. Tente novamente.");
        setLoading(false);
      }
    },
    onError: () => {
      setErro("Login cancelado ou falhou. Tente novamente.");
      setLoading(false);
    }
  });

  const welcomeOpacity = welcomePhase === 2 ? 1 : 0;
  const welcomeScale   = welcomePhase === 2 ? 1 : 0.92;

  // ─── TELA DE BEM-VINDO ────────────────────────────────────────────
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
            0%   { transform: scale(0.8); opacity: 0.6; }
            100% { transform: scale(2.4); opacity: 0; }
          }
          @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
          }
        `}</style>

        <div style={{
          position:"fixed", inset:0,
          background:"radial-gradient(ellipse at 50% 40%, #0f0c29 0%, #020817 60%, #000 100%)",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden",
        }}>
          {PARTICLES.map(p => (
            <div key={p.id} style={{
              position:"absolute", left:p.left, bottom:"-10px",
              width:p.size, height:p.size, borderRadius:"50%",
              background:"#6366f1",
              boxShadow:"0 0 6px #6366f1, 0 0 12px #818cf8",
              animation:`particleFloat ${p.duration} ${p.delay} ease-in infinite`,
            }} />
          ))}

          <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.35)", animation:"pulseRing 2s ease-out infinite" }} />
          <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.2)",  animation:"pulseRing 2s 0.7s ease-out infinite" }} />

          <div style={{
            textAlign:"center", zIndex:10,
            transition:"opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1)",
            opacity:   welcomeOpacity,
            transform: `scale(${welcomeScale})`,
          }}>
            <div style={{
              width:72, height:72, borderRadius:"50%", margin:"0 auto 24px",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 40px rgba(99,102,241,0.5)",
            }}>
              <IconCalendar size={34} />
            </div>

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

            <p style={{ color:"#475569", fontSize:"0.95rem", fontFamily:"Inter, sans-serif" }}>
              Entrando no CRM Calendar...
            </p>

            <div style={{ marginTop:28, width:200, margin:"28px auto 0", background:"rgba(99,102,241,0.12)", borderRadius:99, height:3, overflow:"hidden" }}>
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

  // ─── TELA DE LOGIN ────────────────────────────────────────────────
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .google-btn {
          width: 100%;
          padding: 0.85rem;
          border-radius: 10px;
          background: #fff;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          font-family: Inter, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .google-btn:hover:not(:disabled) {
          background: #f9fafb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transform: translateY(-1px);
        }
        .google-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div style={{
        display:"flex", justifyContent:"center", alignItems:"center",
        minHeight:"100vh", fontFamily:"Inter,sans-serif",
        background:"radial-gradient(ellipse at 50% 0%, #0f0c29 0%, #020817 55%, #000 100%)",
        overflow:"hidden", position:"relative",
      }}>

        <div style={{
          position:"absolute", inset:0, opacity:0.04,
          backgroundImage:`linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`,
          backgroundSize:"60px 60px",
          animation:"gridMove 4s linear infinite",
        }} />

        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position:"absolute", left:p.left, bottom:"-10px",
            width:p.size, height:p.size, borderRadius:"50%",
            background:"rgba(99,102,241,0.7)",
            animation:`particleFloat ${p.duration} ${p.delay} ease-in infinite`,
          }} />
        ))}

        <div style={{
          position:"absolute", width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents:"none",
        }} />

        <div style={{
          position:"relative", zIndex:10,
          background:"rgba(5,14,31,0.85)",
          backdropFilter:"blur(20px)",
          border:"1px solid rgba(99,102,241,0.18)",
          borderRadius:20, padding:"2.5rem 2rem",
          width:360, boxSizing:"border-box",
          boxShadow:"0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
          transition:"opacity 0.6s ease, transform 0.6s ease",
          opacity: cardOpacity,
          transform:`translateY(${cardY}px)`,
        }}>

          <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
            <div style={{
              width:56, height:56, borderRadius:16, margin:"0 auto 14px",
              background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 8px 24px rgba(99,102,241,0.4)",
            }}>
              <IconCalendar size={26} />
            </div>
            <h2 style={{ color:"#f1f5f9", fontSize:"1.35rem", fontWeight:800, margin:"0 0 4px", letterSpacing:"-0.3px" }}>
              CRM Calendar
            </h2>
            <p style={{ color:"#334155", fontSize:"0.8rem", margin:0, letterSpacing:"0.5px" }}>
              ACESSO CORPORATIVO
            </p>
          </div>

          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)", marginBottom:"1.75rem" }} />

          {erro && (
            <div style={{
              background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
              borderRadius:8, padding:"10px 14px",
              display:"flex", alignItems:"center", gap:8, marginBottom:16
            }}>
              <span style={{ fontSize:14 }}>⚠️</span>
              <p style={{ color:"#f87171", margin:0, fontSize:"0.82rem" }}>{erro}</p>
            </div>
          )}

          <button
            className="google-btn"
            onClick={() => { setErro(""); setLoading(true); login(); }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{ width:16, height:16, border:"2px solid #d1d5db", borderTopColor:"#6366f1", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                Verificando...
              </>
            ) : (
              <>
                <IconGoogle />
                Entrar com Google
              </>
            )}
          </button>

          <p style={{ textAlign:"center", color:"#1e293b", fontSize:"0.72rem", marginTop:"1.5rem", marginBottom:0, letterSpacing:"0.3px" }}>
            Acesso restrito a domínios autorizados
          </p>
        </div>
      </div>
    </>
  );
}
