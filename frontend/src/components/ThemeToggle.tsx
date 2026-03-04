import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  /** 'navbar' = compact icon-only pill (for DashboardLayout header)
   *  'float'  = floating button (for Login / Register pages) */
  variant?: "navbar" | "float";
}

const ThemeToggle = ({ variant = "navbar" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "float") {
    return (
      <>
        <style>{`
          .tt-float {
            position: fixed;
            top: 1.25rem;
            right: 1.25rem;
            z-index: 999;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 1px solid;
            transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
          .tt-float.is-dark {
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.1);
            color: #94a3b8;
            box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          }
          .tt-float.is-light {
            background: rgba(0,0,0,0.06);
            border-color: rgba(0,0,0,0.1);
            color: #64748b;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          }
          .tt-float:hover {
            transform: scale(1.1) rotate(12deg);
          }
          .tt-float.is-dark:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.18);
            color: #f1f5f9;
          }
          .tt-float.is-light:hover {
            background: rgba(0,0,0,0.1);
            border-color: rgba(0,0,0,0.18);
            color: #0f172a;
          }
          .tt-icon {
            transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.25s;
            display: flex; align-items: center; justify-content: center;
          }
        `}</style>
        <button
          className={`tt-float ${isDark ? "is-dark" : "is-light"}`}
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="tt-icon">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </span>
        </button>
      </>
    );
  }

  // variant === "navbar"
  return (
    <>
      <style>{`
        .tt-navbar {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.35rem 0.75rem;
          border-radius: 99px;
          border: 1px solid;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.775rem;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tt-navbar.is-dark {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.09);
          color: #64748b;
        }
        .tt-navbar.is-dark:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: #f1f5f9;
        }
        .tt-navbar.is-light {
          background: rgba(0,0,0,0.04);
          border-color: rgba(0,0,0,0.1);
          color: #64748b;
        }
        .tt-navbar.is-light:hover {
          background: rgba(0,0,0,0.08);
          border-color: rgba(0,0,0,0.18);
          color: #0f172a;
        }
        .tt-navbar-icon {
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          display: flex;
        }
        .tt-navbar:hover .tt-navbar-icon {
          transform: rotate(20deg);
        }
        @media (max-width: 480px) {
          .tt-navbar-label { display: none; }
        }
      `}</style>
      <button
        className={`tt-navbar ${isDark ? "is-dark" : "is-light"}`}
        onClick={toggleTheme}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="tt-navbar-icon">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </span>
        <span className="tt-navbar-label">
          {isDark ? "Light" : "Dark"}
        </span>
      </button>
    </>
  );
};

export default ThemeToggle;
