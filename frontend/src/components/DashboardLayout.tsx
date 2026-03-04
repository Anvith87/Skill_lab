import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Building2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ── DARK TOKENS ── */
        :root, .dark {
          --dl-bg:                  #080c14;
          --dl-header-bg:           rgba(8,12,20,0.88);
          --dl-header-border:       rgba(255,255,255,0.06);
          --dl-grid:                rgba(59,130,246,0.03);
          --dl-brand-icon-bg:       linear-gradient(135deg,rgba(29,78,216,.4),rgba(14,165,233,.25));
          --dl-brand-icon-border:   rgba(59,130,246,.3);
          --dl-brand-icon-color:    #60a5fa;
          --dl-brand-icon-glow:     rgba(59,130,246,.15);
          --dl-brand-text:          #f1f5f9;
          --dl-accent-1:            #60a5fa;
          --dl-accent-2:            #38bdf8;
          --dl-role-bg:             rgba(59,130,246,.1);
          --dl-role-border:         rgba(59,130,246,.2);
          --dl-role-color:          #60a5fa;
          --dl-sep:                 rgba(255,255,255,.08);
          --dl-user-name:           #94a3b8;
          --dl-avatar-border:       rgba(59,130,246,.3);
          --dl-avatar-glow:         rgba(29,78,216,.25);
          --dl-logout-bg:           rgba(255,255,255,.04);
          --dl-logout-border:       rgba(255,255,255,.08);
          --dl-logout-color:        #64748b;
          --dl-logout-hvr-bg:       rgba(248,113,113,.08);
          --dl-logout-hvr-border:   rgba(248,113,113,.2);
          --dl-logout-hvr-color:    #f87171;
          --dl-crumb-home:          #334155;
          --dl-crumb-sep:           #1e293b;
          --dl-crumb-active:        #60a5fa;
          --dl-title:               #f1f5f9;
        }

        /* ── LIGHT TOKENS ── */
        .light {
          --dl-bg:                  #f1f5fb;
          --dl-header-bg:           rgba(255,255,255,.92);
          --dl-header-border:       rgba(0,0,0,.07);
          --dl-grid:                rgba(59,130,246,.05);
          --dl-brand-icon-bg:       linear-gradient(135deg,rgba(29,78,216,.12),rgba(14,165,233,.08));
          --dl-brand-icon-border:   rgba(37,99,235,.22);
          --dl-brand-icon-color:    #2563eb;
          --dl-brand-icon-glow:     rgba(37,99,235,.08);
          --dl-brand-text:          #0f172a;
          --dl-accent-1:            #2563eb;
          --dl-accent-2:            #0ea5e9;
          --dl-role-bg:             rgba(37,99,235,.07);
          --dl-role-border:         rgba(37,99,235,.18);
          --dl-role-color:          #2563eb;
          --dl-sep:                 rgba(0,0,0,.08);
          --dl-user-name:           #64748b;
          --dl-avatar-border:       rgba(37,99,235,.22);
          --dl-avatar-glow:         rgba(37,99,235,.1);
          --dl-logout-bg:           rgba(0,0,0,.03);
          --dl-logout-border:       rgba(0,0,0,.09);
          --dl-logout-color:        #64748b;
          --dl-logout-hvr-bg:       rgba(220,38,38,.06);
          --dl-logout-hvr-border:   rgba(220,38,38,.18);
          --dl-logout-hvr-color:    #dc2626;
          --dl-crumb-home:          #94a3b8;
          --dl-crumb-sep:           #cbd5e1;
          --dl-crumb-active:        #2563eb;
          --dl-title:               #0f172a;
        }

        .dl-root {
          min-height: 100vh;
          background: var(--dl-bg);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          transition: background .3s;
        }
        .dl-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(var(--dl-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--dl-grid) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 100% 100% at 50% 0%, black 40%, transparent 100%);
          pointer-events: none; z-index: 0;
        }

        .dl-header {
          position: sticky; top: 0; z-index: 100;
          background: var(--dl-header-bg);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--dl-header-border);
          box-shadow: 0 4px 24px rgba(0,0,0,.08);
          transition: background .3s, border-color .3s;
        }
        .dl-header-inner {
          max-width: 1400px; margin: 0 auto;
          padding: 0 1.75rem; height: 60px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem;
        }
        .dl-left  { display: flex; align-items: center; gap: .875rem; }
        .dl-right { display: flex; align-items: center; gap: .75rem; }

        .dl-brand-icon {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          background: var(--dl-brand-icon-bg);
          border: 1px solid var(--dl-brand-icon-border);
          border-radius: 9px;
          color: var(--dl-brand-icon-color);
          box-shadow: 0 0 12px var(--dl-brand-icon-glow);
          flex-shrink: 0; transition: all .3s;
        }
        .dl-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.125rem; font-weight: 700;
          color: var(--dl-brand-text);
          letter-spacing: -0.03em; line-height: 1;
          transition: color .3s;
        }
        .dl-brand-name span {
          background: linear-gradient(90deg, var(--dl-accent-1), var(--dl-accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dl-role-badge {
          display: inline-flex; align-items: center; gap: .35rem;
          background: var(--dl-role-bg); border: 1px solid var(--dl-role-border);
          border-radius: 99px; padding: .2rem .65rem;
          font-size: .7rem; font-weight: 600;
          color: var(--dl-role-color);
          letter-spacing: .06em; text-transform: uppercase;
          transition: all .3s;
        }
        .dl-role-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--dl-role-color);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100%{ opacity:1; transform:scale(1); }
          50%    { opacity:.5; transform:scale(.75); }
        }
        .dl-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg,#1d4ed8,#0ea5e9);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: .7rem; font-weight: 700; color: #fff;
          letter-spacing: .05em;
          border: 1px solid var(--dl-avatar-border);
          box-shadow: 0 0 10px var(--dl-avatar-glow);
          flex-shrink: 0; transition: border-color .3s, box-shadow .3s;
        }
        .dl-user-name {
          font-size: .875rem; color: var(--dl-user-name);
          max-width: 160px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
          transition: color .3s;
        }
        @media(max-width:600px){ .dl-user-name{ display:none; } }
        .dl-sep {
          width:1px; height:20px;
          background: var(--dl-sep); transition: background .3s;
        }
        .dl-logout-btn {
          display: flex; align-items: center; gap: .4rem;
          background: var(--dl-logout-bg);
          border: 1px solid var(--dl-logout-border);
          border-radius: 9px; padding: .4rem .875rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .8125rem; font-weight: 500;
          color: var(--dl-logout-color);
          cursor: pointer; transition: all .2s; white-space: nowrap;
        }
        .dl-logout-btn:hover {
          background: var(--dl-logout-hvr-bg);
          border-color: var(--dl-logout-hvr-border);
          color: var(--dl-logout-hvr-color);
        }
        @media(max-width:480px){ .dl-logout-text{ display:none; } }

        .dl-breadcrumb {
          max-width:1400px; margin:0 auto;
          padding:1.375rem 1.75rem 0;
          display:flex; align-items:center; gap:.5rem;
          position:relative; z-index:1;
        }
        .dl-crumb-home  { font-size:.8rem; color:var(--dl-crumb-home); transition:color .3s; }
        .dl-crumb-sep   { color:var(--dl-crumb-sep); transition:color .3s; }
        .dl-crumb-page  {
          font-family:'Syne',sans-serif; font-size:.8rem; font-weight:600;
          color:var(--dl-crumb-active); letter-spacing:-.01em; transition:color .3s;
        }

        .dl-title-area {
          max-width:1400px; margin:0 auto;
          padding:.625rem 1.75rem 1.5rem;
          position:relative; z-index:1;
        }
        .dl-title {
          font-family:'Syne',sans-serif; font-size:1.625rem; font-weight:700;
          color:var(--dl-title); letter-spacing:-.03em; line-height:1.2;
          transition:color .3s;
        }
        .dl-title-line {
          width:32px; height:3px;
          background:linear-gradient(90deg, var(--dl-accent-1), var(--dl-accent-2));
          border-radius:99px; margin-top:.5rem;
        }
        .dl-main {
          max-width:1400px; margin:0 auto;
          padding:0 1.75rem 3rem;
          position:relative; z-index:1;
        }
      `}</style>

      <div className="dl-root">
        <header className="dl-header">
          <div className="dl-header-inner">
            <div className="dl-left">
              <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                <div className="dl-brand-icon"><Building2 size={18} /></div>
                <span className="dl-brand-name">Hostel<span>Ops</span></span>
              </div>
              {user?.role && (
                <div className="dl-role-badge">
                  <span className="dl-role-dot" />{user.role}
                </div>
              )}
            </div>

            <div className="dl-right">
              {/* 🌙 / ☀️ Toggle */}
              <ThemeToggle variant="navbar" />

              <div style={{ display:"flex", alignItems:"center", gap:".625rem" }}>
                <div className="dl-avatar">{initials}</div>
                {user?.name && <span className="dl-user-name">{user.name}</span>}
              </div>

              <div className="dl-sep" />

              <button className="dl-logout-btn" onClick={handleLogout}>
                <LogOut size={14} />
                <span className="dl-logout-text">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="dl-breadcrumb">
          <span className="dl-crumb-home">Home</span>
          <ChevronRight size={12} className="dl-crumb-sep" />
          <span className="dl-crumb-page">{title}</span>
        </div>

        <div className="dl-title-area">
          <h2 className="dl-title">{title}</h2>
          <div className="dl-title-line" />
        </div>

        <main className="dl-main">{children}</main>
      </div>
    </>
  );
};

export default DashboardLayout;
