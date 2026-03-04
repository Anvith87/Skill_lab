import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Building2, User, Mail, Lock, Hash, DoorOpen } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", block: "", roomNumber: "" });
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { setMounted(true); }, []);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, block, roomNumber } = form;
    if (!name.trim() || !email.trim() || !password.trim() || !block.trim() || !roomNumber.trim()) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, block: block.trim(), roomNumber: roomNumber.trim() });
      toast({ title: "Registration Successful", description: "Please login with your credentials." });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }

        /* ── DARK TOKENS (reuse ln- prefix for consistency) ── */
        :root, .dark {
          --rg-bg:           #080c14;
          --rg-grid:         rgba(59,130,246,0.04);
          --rg-orb1:         rgba(29,78,216,0.16);
          --rg-orb2:         rgba(14,165,233,0.11);
          --rg-orb3:         rgba(99,102,241,0.10);
          --rg-card-bg:      rgba(255,255,255,0.03);
          --rg-card-border:  rgba(255,255,255,0.08);
          --rg-card-shadow:  0 24px 64px rgba(0,0,0,0.5);
          --rg-card-inset:   inset 0 1px 0 rgba(255,255,255,0.06);
          --rg-accent-line:  linear-gradient(90deg,transparent,rgba(59,130,246,0.6),rgba(14,165,233,0.6),transparent);
          --rg-icon-bg:      linear-gradient(135deg,rgba(29,78,216,0.3),rgba(14,165,233,0.2));
          --rg-icon-border:  rgba(59,130,246,0.3);
          --rg-icon-color:   #60a5fa;
          --rg-icon-glow:    rgba(59,130,246,0.2);
          --rg-title:        #f1f5f9;
          --rg-accent-1:     #60a5fa;
          --rg-accent-2:     #38bdf8;
          --rg-sub:          #64748b;
          --rg-badge-bg:     rgba(59,130,246,0.1);
          --rg-badge-border: rgba(59,130,246,0.2);
          --rg-badge-color:  #60a5fa;
          --rg-label:        #94a3b8;
          --rg-input-bg:     rgba(255,255,255,0.04);
          --rg-input-border: rgba(255,255,255,0.09);
          --rg-input-color:  #e2e8f0;
          --rg-input-ph:     #475569;
          --rg-input-focus-bg:     rgba(59,130,246,0.06);
          --rg-input-focus-border: rgba(59,130,246,0.45);
          --rg-input-focus-shadow: rgba(59,130,246,0.12);
          --rg-divider:      rgba(255,255,255,0.07);
          --rg-divider-text: #334155;
          --rg-btn-shadow:   rgba(29,78,216,0.35);
          --rg-btn-shadow-h: rgba(29,78,216,0.45);
          --rg-footer:       #475569;
          --rg-link:         #60a5fa;
          --rg-link-hover:   #93c5fd;
        }

        /* ── LIGHT TOKENS ── */
        .light {
          --rg-bg:           #f1f5fb;
          --rg-grid:         rgba(59,130,246,0.06);
          --rg-orb1:         rgba(29,78,216,0.07);
          --rg-orb2:         rgba(14,165,233,0.05);
          --rg-orb3:         rgba(99,102,241,0.04);
          --rg-card-bg:      rgba(255,255,255,0.85);
          --rg-card-border:  rgba(0,0,0,0.07);
          --rg-card-shadow:  0 24px 64px rgba(0,0,0,0.1);
          --rg-card-inset:   inset 0 1px 0 rgba(255,255,255,0.9);
          --rg-accent-line:  linear-gradient(90deg,transparent,rgba(37,99,235,0.4),rgba(14,165,233,0.4),transparent);
          --rg-icon-bg:      linear-gradient(135deg,rgba(37,99,235,0.12),rgba(14,165,233,0.07));
          --rg-icon-border:  rgba(37,99,235,0.22);
          --rg-icon-color:   #2563eb;
          --rg-icon-glow:    rgba(37,99,235,0.08);
          --rg-title:        #0f172a;
          --rg-accent-1:     #2563eb;
          --rg-accent-2:     #0ea5e9;
          --rg-sub:          #94a3b8;
          --rg-badge-bg:     rgba(37,99,235,0.07);
          --rg-badge-border: rgba(37,99,235,0.18);
          --rg-badge-color:  #2563eb;
          --rg-label:        #64748b;
          --rg-input-bg:     rgba(0,0,0,0.02);
          --rg-input-border: rgba(0,0,0,0.1);
          --rg-input-color:  #0f172a;
          --rg-input-ph:     #94a3b8;
          --rg-input-focus-bg:     rgba(37,99,235,0.04);
          --rg-input-focus-border: rgba(37,99,235,0.4);
          --rg-input-focus-shadow: rgba(37,99,235,0.1);
          --rg-divider:      rgba(0,0,0,0.08);
          --rg-divider-text: #94a3b8;
          --rg-btn-shadow:   rgba(37,99,235,0.25);
          --rg-btn-shadow-h: rgba(37,99,235,0.35);
          --rg-footer:       #94a3b8;
          --rg-link:         #2563eb;
          --rg-link-hover:   #1d4ed8;
        }

        .reg-root {
          min-height:100vh; display:flex; align-items:center; justify-content:center;
          background: var(--rg-bg); padding:2rem 1.5rem;
          font-family:'DM Sans',sans-serif;
          position:relative; overflow:hidden; transition:background .35s;
        }
        .reg-root::before {
          content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(var(--rg-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--rg-grid) 1px, transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          pointer-events:none;
        }
        .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation:orb-float 8s ease-in-out infinite; }
        .orb-1 { width:420px;height:420px; background:radial-gradient(circle,var(--rg-orb1) 0%,transparent 70%); top:-140px;right:-80px; }
        .orb-2 { width:300px;height:300px; background:radial-gradient(circle,var(--rg-orb2) 0%,transparent 70%); bottom:-80px;left:-60px; animation-delay:-4s; }
        .orb-3 { width:180px;height:180px; background:radial-gradient(circle,var(--rg-orb3) 0%,transparent 70%); top:50%;left:10%; animation-delay:-2s; }
        @keyframes orb-float { 0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-28px) scale(1.04);} }

        .reg-card {
          width:100%; max-width:460px;
          background: var(--rg-card-bg);
          border:1px solid var(--rg-card-border);
          border-radius:24px; padding:2.5rem;
          backdrop-filter:blur(20px);
          position:relative; z-index:10;
          opacity:0; transform:translateY(24px);
          transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1),background .35s,border-color .35s;
          box-shadow:var(--rg-card-shadow),var(--rg-card-inset);
        }
        .reg-card.visible { opacity:1; transform:translateY(0); }
        .reg-card::before {
          content:''; position:absolute; top:0; left:20%; right:20%; height:1px;
          background:var(--rg-accent-line); border-radius:100%;
        }

        .brand-section { text-align:center; margin-bottom:2rem; }
        .brand-icon {
          display:inline-flex; align-items:center; justify-content:center;
          width:52px;height:52px;
          background:var(--rg-icon-bg); border:1px solid var(--rg-icon-border);
          border-radius:14px; margin-bottom:1rem;
          color:var(--rg-icon-color); box-shadow:0 0 20px var(--rg-icon-glow);
          transition:all .35s;
        }
        .brand-title {
          font-family:'Syne',sans-serif; font-size:1.75rem; font-weight:700;
          color:var(--rg-title); letter-spacing:-.03em; margin:0 0 .375rem;
          transition:color .35s;
        }
        .brand-title span {
          background:linear-gradient(90deg,var(--rg-accent-1),var(--rg-accent-2));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .brand-sub { font-size:.875rem; color:var(--rg-sub); transition:color .35s; }

        .step-badge {
          display:inline-flex; align-items:center; gap:.4rem;
          background:var(--rg-badge-bg); border:1px solid var(--rg-badge-border);
          border-radius:99px; padding:.25rem .75rem;
          font-size:.72rem; font-weight:500; color:var(--rg-badge-color);
          letter-spacing:.04em; text-transform:uppercase; margin-bottom:1.5rem;
          transition:all .35s;
        }
        .step-dot { width:6px;height:6px; background:var(--rg-badge-color); border-radius:50%; animation:pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);} }

        .form-stack { display:flex; flex-direction:column; gap:1.125rem; }
        .field-group { display:flex; flex-direction:column; gap:.45rem; }
        .field-label {
          font-size:.78rem; font-weight:500;
          color:var(--rg-label); letter-spacing:.04em; text-transform:uppercase;
          display:flex; align-items:center; gap:.4rem; transition:color .35s;
        }
        .field-input {
          width:100%;
          background:var(--rg-input-bg) !important;
          border:1px solid var(--rg-input-border) !important;
          border-radius:12px !important;
          color:var(--rg-input-color) !important;
          font-family:'DM Sans',sans-serif !important;
          font-size:.9375rem !important; height:48px !important;
          padding:0 1rem !important; outline:none !important;
          transition:border-color .2s,box-shadow .2s,background .2s,color .35s !important;
          -webkit-appearance:none;
        }
        .field-input::placeholder { color:var(--rg-input-ph) !important; }
        .field-input:focus {
          background:var(--rg-input-focus-bg) !important;
          border-color:var(--rg-input-focus-border) !important;
          box-shadow:0 0 0 3px var(--rg-input-focus-shadow) !important;
        }
        .field-input:-webkit-autofill,
        .field-input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0 1000px #0d1424 inset !important;
          -webkit-text-fill-color:#e2e8f0 !important;
        }
        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }

        .section-divider { display:flex; align-items:center; gap:.75rem; margin:.25rem 0; }
        .divider-line { flex:1; height:1px; background:var(--rg-divider); transition:background .35s; }
        .divider-label {
          font-size:.72rem; color:var(--rg-divider-text);
          text-transform:uppercase; letter-spacing:.06em; white-space:nowrap;
          transition:color .35s;
        }

        .submit-btn {
          width:100%; height:50px;
          background:linear-gradient(135deg,#1d4ed8,#0ea5e9) !important;
          border:none !important; border-radius:12px !important;
          color:#fff !important;
          font-family:'Syne',sans-serif !important;
          font-size:.9375rem !important; font-weight:600 !important; letter-spacing:.02em !important;
          cursor:pointer; margin-top:.25rem;
          transition:transform .2s,box-shadow .2s,opacity .2s !important;
          box-shadow:0 4px 20px var(--rg-btn-shadow) !important;
          position:relative; overflow:hidden;
        }
        .submit-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.12),transparent); border-radius:12px;
        }
        .submit-btn:hover:not(:disabled){ transform:translateY(-1px) !important; box-shadow:0 8px 28px var(--rg-btn-shadow-h) !important; }
        .submit-btn:active:not(:disabled){ transform:translateY(0) !important; }
        .submit-btn:disabled { opacity:.7 !important; cursor:not-allowed !important; }

        .spinner { display:inline-block; width:16px;height:16px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; margin-right:8px; vertical-align:middle; }
        @keyframes spin { to{transform:rotate(360deg);} }

        .reg-footer { text-align:center; margin-top:1.5rem; font-size:.875rem; color:var(--rg-footer); transition:color .35s; }
        .reg-footer a { color:var(--rg-link); font-weight:500; text-decoration:none; transition:color .2s; }
        .reg-footer a:hover { color:var(--rg-link-hover); }

        .fade-up { opacity:0; transform:translateY(12px); transition:opacity .5s ease,transform .5s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .delay-1{transition-delay:.08s;} .delay-2{transition-delay:.15s;}
        .delay-3{transition-delay:.22s;} .delay-4{transition-delay:.29s;}
        .delay-5{transition-delay:.36s;} .delay-6{transition-delay:.43s;}
      `}</style>

      <div className="reg-root">
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

        {/* Floating theme toggle */}
        <ThemeToggle variant="float" />

        <div className={`reg-card ${mounted ? "visible" : ""}`}>
          <div className={`brand-section fade-up ${mounted ? "visible" : ""}`}>
            <div className="brand-icon"><Building2 size={24} /></div>
            <h1 className="brand-title">Hostel<span>Ops</span></h1>
            <p className="brand-sub">Create your student account</p>
          </div>

          <div className={`fade-up ${mounted ? "visible" : ""} delay-1`} style={{display:"flex",justifyContent:"center"}}>
            <div className="step-badge"><span className="step-dot"/>New Registration</div>
          </div>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className={`field-group fade-up ${mounted ? "visible" : ""} delay-1`}>
              <label className="field-label"><User size={12}/>Full Name</label>
              <input type="text" placeholder="John Doe" value={form.name} onChange={update("name")} required maxLength={100} className="field-input"/>
            </div>
            <div className={`field-group fade-up ${mounted ? "visible" : ""} delay-2`}>
              <label className="field-label"><Mail size={12}/>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} required maxLength={255} className="field-input"/>
            </div>
            <div className={`field-group fade-up ${mounted ? "visible" : ""} delay-3`}>
              <label className="field-label"><Lock size={12}/>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={update("password")} required maxLength={128} className="field-input"/>
            </div>

            <div className={`section-divider fade-up ${mounted ? "visible" : ""} delay-3`}>
              <div className="divider-line"/><span className="divider-label">Room Details</span><div className="divider-line"/>
            </div>

            <div className={`two-col fade-up ${mounted ? "visible" : ""} delay-4`}>
              <div className="field-group">
                <label className="field-label"><Hash size={12}/>Block</label>
                <input type="text" placeholder="e.g. A" value={form.block} onChange={update("block")} required maxLength={10} className="field-input"/>
              </div>
              <div className="field-group">
                <label className="field-label"><DoorOpen size={12}/>Room No.</label>
                <input type="text" placeholder="e.g. 101" value={form.roomNumber} onChange={update("roomNumber")} required maxLength={10} className="field-input"/>
              </div>
            </div>

            <div className={`fade-up ${mounted ? "visible" : ""} delay-5`}>
              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? <><span className="spinner"/>Creating Account...</> : "Create Account"}
              </button>
            </div>
          </form>

          <p className={`reg-footer fade-up ${mounted ? "visible" : ""} delay-6`}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
