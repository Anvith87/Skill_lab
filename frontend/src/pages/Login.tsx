import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }

        /* ── DARK TOKENS ── */
        :root, .dark {
          --ln-bg:           #080c14;
          --ln-grid:         rgba(59,130,246,0.04);
          --ln-orb1:         rgba(29,78,216,0.18);
          --ln-orb2:         rgba(14,165,233,0.12);
          --ln-orb3:         rgba(99,102,241,0.1);
          --ln-card-bg:      rgba(255,255,255,0.03);
          --ln-card-border:  rgba(255,255,255,0.08);
          --ln-card-shadow:  0 24px 64px rgba(0,0,0,0.5);
          --ln-card-inset:   inset 0 1px 0 rgba(255,255,255,0.06);
          --ln-accent-line:  linear-gradient(90deg,transparent,rgba(59,130,246,0.6),rgba(14,165,233,0.6),transparent);
          --ln-icon-bg:      linear-gradient(135deg,rgba(29,78,216,0.3),rgba(14,165,233,0.2));
          --ln-icon-border:  rgba(59,130,246,0.3);
          --ln-icon-color:   #60a5fa;
          --ln-icon-glow:    rgba(59,130,246,0.2);
          --ln-title:        #f1f5f9;
          --ln-accent-1:     #60a5fa;
          --ln-accent-2:     #38bdf8;
          --ln-sub:          #64748b;
          --ln-label:        #94a3b8;
          --ln-input-bg:     rgba(255,255,255,0.04);
          --ln-input-border: rgba(255,255,255,0.09);
          --ln-input-color:  #e2e8f0;
          --ln-input-ph:     #475569;
          --ln-input-focus-bg:     rgba(59,130,246,0.06);
          --ln-input-focus-border: rgba(59,130,246,0.45);
          --ln-input-focus-shadow: rgba(59,130,246,0.12);
          --ln-eye:          #475569;
          --ln-eye-hover:    #94a3b8;
          --ln-btn-shadow:   rgba(29,78,216,0.35);
          --ln-btn-shadow-h: rgba(29,78,216,0.45);
          --ln-footer:       #475569;
          --ln-link:         #60a5fa;
          --ln-link-hover:   #93c5fd;
        }

        /* ── LIGHT TOKENS ── */
        .light {
          --ln-bg:           #f1f5fb;
          --ln-grid:         rgba(59,130,246,0.06);
          --ln-orb1:         rgba(29,78,216,0.08);
          --ln-orb2:         rgba(14,165,233,0.06);
          --ln-orb3:         rgba(99,102,241,0.05);
          --ln-card-bg:      rgba(255,255,255,0.85);
          --ln-card-border:  rgba(0,0,0,0.07);
          --ln-card-shadow:  0 24px 64px rgba(0,0,0,0.1);
          --ln-card-inset:   inset 0 1px 0 rgba(255,255,255,0.9);
          --ln-accent-line:  linear-gradient(90deg,transparent,rgba(37,99,235,0.4),rgba(14,165,233,0.4),transparent);
          --ln-icon-bg:      linear-gradient(135deg,rgba(37,99,235,0.12),rgba(14,165,233,0.07));
          --ln-icon-border:  rgba(37,99,235,0.22);
          --ln-icon-color:   #2563eb;
          --ln-icon-glow:    rgba(37,99,235,0.08);
          --ln-title:        #0f172a;
          --ln-accent-1:     #2563eb;
          --ln-accent-2:     #0ea5e9;
          --ln-sub:          #94a3b8;
          --ln-label:        #64748b;
          --ln-input-bg:     rgba(0,0,0,0.02);
          --ln-input-border: rgba(0,0,0,0.1);
          --ln-input-color:  #0f172a;
          --ln-input-ph:     #94a3b8;
          --ln-input-focus-bg:     rgba(37,99,235,0.04);
          --ln-input-focus-border: rgba(37,99,235,0.4);
          --ln-input-focus-shadow: rgba(37,99,235,0.1);
          --ln-eye:          #94a3b8;
          --ln-eye-hover:    #64748b;
          --ln-btn-shadow:   rgba(37,99,235,0.25);
          --ln-btn-shadow-h: rgba(37,99,235,0.35);
          --ln-footer:       #94a3b8;
          --ln-link:         #2563eb;
          --ln-link-hover:   #1d4ed8;
        }

        .login-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: var(--ln-bg);
          padding: 1.5rem;
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
          transition: background .35s;
        }
        .login-root::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--ln-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--ln-grid) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          pointer-events: none;
        }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none;
          animation: orb-float 8s ease-in-out infinite;
        }
        .orb-1 {
          width:420px; height:420px;
          background: radial-gradient(circle, var(--ln-orb1) 0%, transparent 70%);
          top:-120px; left:-80px;
        }
        .orb-2 {
          width:320px; height:320px;
          background: radial-gradient(circle, var(--ln-orb2) 0%, transparent 70%);
          bottom:-80px; right:-60px; animation-delay:-4s;
        }
        .orb-3 {
          width:200px; height:200px;
          background: radial-gradient(circle, var(--ln-orb3) 0%, transparent 70%);
          top:40%; left:60%; animation-delay:-2s;
        }
        @keyframes orb-float {
          0%,100%{ transform:translateY(0) scale(1); }
          50%    { transform:translateY(-30px) scale(1.05); }
        }

        .login-card {
          width:100%; max-width:420px;
          background: var(--ln-card-bg);
          border: 1px solid var(--ln-card-border);
          border-radius: 24px;
          padding: 2.75rem 2.5rem;
          backdrop-filter: blur(20px);
          position: relative; z-index: 10;
          opacity: 0; transform: translateY(24px);
          transition: opacity .6s cubic-bezier(.16,1,.3,1),
                      transform .6s cubic-bezier(.16,1,.3,1),
                      background .35s, border-color .35s;
          box-shadow: var(--ln-card-shadow), var(--ln-card-inset);
        }
        .login-card.visible { opacity:1; transform:translateY(0); }
        .login-card::before {
          content:''; position:absolute;
          top:0; left:20%; right:20%; height:1px;
          background: var(--ln-accent-line); border-radius:100%;
        }

        .brand-section { text-align:center; margin-bottom:2.25rem; }
        .brand-icon {
          display:inline-flex; align-items:center; justify-content:center;
          width:52px; height:52px;
          background: var(--ln-icon-bg);
          border: 1px solid var(--ln-icon-border);
          border-radius:14px; margin-bottom:1rem;
          color: var(--ln-icon-color);
          box-shadow: 0 0 20px var(--ln-icon-glow);
          transition: all .35s;
        }
        .brand-title {
          font-family:'Syne',sans-serif; font-size:1.75rem; font-weight:700;
          color: var(--ln-title); letter-spacing:-.03em;
          margin:0 0 .375rem; transition:color .35s;
        }
        .brand-title span {
          background: linear-gradient(90deg, var(--ln-accent-1), var(--ln-accent-2));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .brand-sub { font-size:.875rem; color:var(--ln-sub); transition:color .35s; }

        .form-stack { display:flex; flex-direction:column; gap:1.125rem; }
        .field-group { display:flex; flex-direction:column; gap:.45rem; }
        .field-label {
          font-size:.78rem; font-weight:500;
          color: var(--ln-label); letter-spacing:.04em; text-transform:uppercase;
          transition: color .35s;
        }
        .field-wrap { position:relative; }
        .field-input {
          width:100%;
          background: var(--ln-input-bg) !important;
          border: 1px solid var(--ln-input-border) !important;
          border-radius:12px !important;
          color: var(--ln-input-color) !important;
          font-family:'DM Sans',sans-serif !important;
          font-size:.9375rem !important;
          height:48px !important;
          padding:0 1rem !important;
          outline:none !important;
          transition: border-color .2s, box-shadow .2s, background .2s, color .35s !important;
          -webkit-appearance:none;
        }
        .field-input::placeholder { color: var(--ln-input-ph) !important; }
        .field-input:focus {
          background: var(--ln-input-focus-bg) !important;
          border-color: var(--ln-input-focus-border) !important;
          box-shadow: 0 0 0 3px var(--ln-input-focus-shadow) !important;
        }
        .field-input.has-icon { padding-right:3rem !important; }
        .field-input:-webkit-autofill,
        .field-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0d1424 inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }

        .eye-btn {
          position:absolute; right:1rem; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color: var(--ln-eye); padding:0; display:flex; align-items:center;
          transition:color .2s;
        }
        .eye-btn:hover { color: var(--ln-eye-hover); }

        .submit-btn {
          width:100%; height:50px;
          background: linear-gradient(135deg,#1d4ed8,#0ea5e9) !important;
          border:none !important; border-radius:12px !important;
          color:#fff !important;
          font-family:'Syne',sans-serif !important;
          font-size:.9375rem !important; font-weight:600 !important;
          letter-spacing:.02em !important;
          cursor:pointer; margin-top:.375rem;
          transition:transform .2s, box-shadow .2s, opacity .2s !important;
          box-shadow: 0 4px 20px var(--ln-btn-shadow) !important;
          position:relative; overflow:hidden;
        }
        .submit-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.12),transparent);
          border-radius:12px;
        }
        .submit-btn:hover:not(:disabled) {
          transform:translateY(-1px) !important;
          box-shadow: 0 8px 28px var(--ln-btn-shadow-h) !important;
        }
        .submit-btn:active:not(:disabled) { transform:translateY(0) !important; }
        .submit-btn:disabled { opacity:.7 !important; cursor:not-allowed !important; }

        .spinner {
          display:inline-block; width:16px; height:16px;
          border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
          border-radius:50%; animation:spin .7s linear infinite;
          margin-right:8px; vertical-align:middle;
        }
        @keyframes spin { to{ transform:rotate(360deg); } }

        .login-footer {
          text-align:center; margin-top:1.5rem;
          font-size:.875rem; color:var(--ln-footer); transition:color .35s;
        }
        .login-footer a {
          color: var(--ln-link); font-weight:500;
          text-decoration:none; transition:color .2s;
        }
        .login-footer a:hover { color: var(--ln-link-hover); }

        .fade-up { opacity:0; transform:translateY(12px); transition:opacity .5s ease, transform .5s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .delay-1{ transition-delay:.1s; }
        .delay-2{ transition-delay:.18s; }
        .delay-3{ transition-delay:.26s; }
        .delay-4{ transition-delay:.34s; }
      `}</style>

      <div className="login-root">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

        {/* Floating theme toggle */}
        <ThemeToggle variant="float" />

        <div className={`login-card ${mounted ? "visible" : ""}`}>
          <div className={`brand-section fade-up ${mounted ? "visible" : ""}`}>
            <div className="brand-icon"><Building2 size={24} /></div>
            <h1 className="brand-title">Hostel<span>Ops</span></h1>
            <p className="brand-sub">Welcome back — sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className={`field-group fade-up ${mounted ? "visible" : ""} delay-1`}>
              <label className="field-label">Email Address</label>
              <div className="field-wrap">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required placeholder="you@example.com" className="field-input" />
              </div>
            </div>

            <div className={`field-group fade-up ${mounted ? "visible" : ""} delay-2`}>
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required placeholder="••••••••" className="field-input has-icon" />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className={`fade-up ${mounted ? "visible" : ""} delay-3`}>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <><span className="spinner" />Signing in...</> : "Sign In"}
              </button>
            </div>
          </form>

          <p className={`login-footer fade-up ${mounted ? "visible" : ""} delay-4`}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
