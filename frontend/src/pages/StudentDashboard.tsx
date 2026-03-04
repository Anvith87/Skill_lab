import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Zap,
  Wifi,
  Droplets,
  Sparkles,
  MoreHorizontal,
  ClipboardList,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const categories = ["Electrical", "Plumbing", "Internet", "Cleaning", "Other"];
const priorities = ["Low", "Medium", "High"];

const categoryIcons: Record<string, React.ReactNode> = {
  Electrical: <Zap size={13} />,
  Plumbing: <Droplets size={13} />,
  Internet: <Wifi size={13} />,
  Cleaning: <Sparkles size={13} />,
  Other: <MoreHorizontal size={13} />,
};

const priorityConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Low:    { color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",  dot: "#34d399" },
  Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  dot: "#fbbf24" },
  High:   { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", dot: "#f87171" },
};

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Pending:     { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)", icon: <Clock size={11} /> },
  "In Progress":{ color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)", icon: <Loader2 size={11} /> },
  Resolved:    { color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",  icon: <CheckCircle2 size={11} /> },
  Rejected:    { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", icon: <XCircle size={11} /> },
};

interface Complaint {
  _id: string;
  category: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  createdAt: string;
}

const StudentDashboard = () => {
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complaints = [], isLoading, isError } = useQuery<Complaint[]>({
    queryKey: ["my-complaints"],
    queryFn: async () => {
      const res = await api.get("/api/complaints/my");
      return res.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { category: string; description: string; priority: string }) => {
      const res = await api.post("/api/complaints", data);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Complaint submitted successfully." });
      setCategory(""); setDescription(""); setPriority("");
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.response?.data?.error || "Failed to submit complaint.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description.trim() || !priority) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (description.trim().length > 1000) {
      toast({ title: "Validation Error", description: "Description must be under 1000 characters.", variant: "destructive" });
      return;
    }
    submitMutation.mutate({ category, description: description.trim(), priority });
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .sd-wrap {
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        /* ---- STAT CARDS ---- */
        .sd-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        @media (max-width: 900px) { .sd-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 500px) { .sd-stats { grid-template-columns: 1fr 1fr; } }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.25rem 1.375rem;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .stat-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #475569;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .stat-sub {
          font-size: 0.75rem;
          color: #334155;
        }
        .stat-icon {
          position: absolute;
          bottom: 1rem; right: 1.25rem;
          opacity: 0.07;
          font-size: 2.5rem;
        }

        /* ---- MAIN GRID ---- */
        .sd-main {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        @media (max-width: 1024px) { .sd-main { grid-template-columns: 1fr; } }

        /* ---- PANEL ---- */
        .sd-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        .sd-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 15%; right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent);
        }
        .panel-header {
          padding: 1.375rem 1.625rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .panel-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px; height: 32px;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 9px;
          color: #60a5fa;
        }
        .panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #e2e8f0;
          letter-spacing: -0.01em;
        }
        .panel-body {
          padding: 1.375rem 1.625rem 1.625rem;
        }

        /* ---- FORM ---- */
        .form-stack { display: flex; flex-direction: column; gap: 1.125rem; }

        .field-group { display: flex; flex-direction: column; gap: 0.45rem; }
        .field-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Override select trigger */
        .dark-select [data-radix-select-trigger],
        .dark-select button[role="combobox"] {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.09) !important;
          border-radius: 11px !important;
          color: #e2e8f0 !important;
          font-family: 'DM Sans', sans-serif !important;
          height: 44px !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .dark-select [data-radix-select-trigger]:focus,
        .dark-select button[role="combobox"]:focus {
          border-color: rgba(59,130,246,0.45) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important;
          outline: none !important;
        }

        .dark-textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 11px;
          color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          resize: vertical;
          min-height: 110px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          line-height: 1.6;
        }
        .dark-textarea::placeholder { color: #334155; }
        .dark-textarea:focus {
          border-color: rgba(59,130,246,0.45);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
          background: rgba(59,130,246,0.05);
        }

        .char-count {
          font-size: 0.72rem;
          color: #334155;
          text-align: right;
          margin-top: -0.625rem;
        }
        .char-count.warn { color: #f87171; }

        .submit-btn {
          width: 100%;
          height: 46px;
          background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 4px 18px rgba(29,78,216,0.3);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(29,78,216,0.4);
        }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ---- TABLE ---- */
        .complaints-table { width: 100%; border-collapse: collapse; }
        .complaints-table thead tr {
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .complaints-table th {
          padding: 0.625rem 1rem;
          text-align: left;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #334155;
          font-weight: 500;
          white-space: nowrap;
        }
        .complaints-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .complaints-table tbody tr:last-child { border-bottom: none; }
        .complaints-table tbody tr:hover { background: rgba(255,255,255,0.02); }
        .complaints-table td {
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          color: #94a3b8;
          vertical-align: middle;
        }

        .cat-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 99px;
          padding: 0.2rem 0.6rem;
          font-size: 0.8rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .pri-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          border-radius: 99px;
          padding: 0.2rem 0.65rem;
          font-size: 0.775rem;
          font-weight: 500;
        }
        .pri-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          border-radius: 99px;
          padding: 0.2rem 0.65rem;
          font-size: 0.775rem;
          font-weight: 500;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3.5rem 1rem;
          gap: 0.75rem;
          color: #334155;
          text-align: center;
        }
        .empty-icon {
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          margin-bottom: 0.25rem;
        }
        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.9375rem;
          color: #475569;
          font-weight: 600;
        }
        .empty-sub { font-size: 0.8125rem; color: #334155; }

        .badge-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #60a5fa;
          margin-left: auto;
        }
      `}</style>

      <div className="sd-wrap">

        {/* ---- STAT CARDS ---- */}
        <div className="sd-stats">
          {[
            { label: "Total", value: stats.total, sub: "All time", icon: "📋", color: "#60a5fa" },
            { label: "Pending", value: stats.pending, sub: "Awaiting review", icon: "⏳", color: "#94a3b8" },
            { label: "In Progress", value: stats.inProgress, sub: "Being resolved", icon: "⚙️", color: "#60a5fa" },
            { label: "Resolved", value: stats.resolved, sub: "Completed", icon: "✅", color: "#34d399" },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
              <div className="stat-icon">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* ---- MAIN GRID ---- */}
        <div className="sd-main">

          {/* ---- SUBMIT FORM ---- */}
          <div className="sd-panel">
            <div className="panel-header">
              <div className="panel-icon"><Send size={15} /></div>
              <span className="panel-title">Submit a Complaint</span>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit} className="form-stack">
                <div className="field-group dark-select">
                  <label className="field-label">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {categoryIcons[c]} {c}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="field-group dark-select">
                  <label className="field-label">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: priorityConfig[p]?.dot,
                              display: "inline-block",
                              flexShrink: 0
                            }} />
                            {p}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="field-group">
                  <label className="field-label">Description</label>
                  <textarea
                    placeholder="Describe your issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    className="dark-textarea"
                  />
                  <div className={`char-count ${description.length > 900 ? "warn" : ""}`}>
                    {description.length}/1000
                  </div>
                </div>

                <button type="submit" disabled={submitMutation.isPending} className="submit-btn">
                  {submitMutation.isPending ? (
                    <><div className="spinner" /> Submitting...</>
                  ) : (
                    <><Send size={14} /> Submit Complaint</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ---- MY COMPLAINTS ---- */}
          <div className="sd-panel">
            <div className="panel-header">
              <div className="panel-icon"><ClipboardList size={15} /></div>
              <span className="panel-title">My Complaints</span>
              {complaints.length > 0 && (
                <span className="badge-count">{complaints.length}</span>
              )}
            </div>
            <div style={{ overflowX: "auto" }}>
              {isLoading ? (
                <div className="empty-state">
                  <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2.5 }} />
                  <span style={{ fontSize: "0.875rem", color: "#475569", marginTop: "0.5rem" }}>Loading complaints...</span>
                </div>
              ) : isError ? (
                <div className="empty-state">
                  <div className="empty-icon"><AlertCircle size={22} /></div>
                  <div className="empty-title">Failed to load</div>
                  <div className="empty-sub">Could not fetch your complaints. Try refreshing.</div>
                </div>
              ) : complaints.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><ClipboardList size={22} /></div>
                  <div className="empty-title">No complaints yet</div>
                  <div className="empty-sub">Submit your first complaint using the form.</div>
                </div>
              ) : (
                <table className="complaints-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => {
                      const pri = priorityConfig[c.priority];
                      const sts = statusConfig[c.status] || statusConfig["Pending"];
                      return (
                        <tr key={c._id}>
                          <td>
                            <span className="cat-chip">
                              {categoryIcons[c.category] || <MoreHorizontal size={13} />}
                              {c.category}
                            </span>
                          </td>
                          <td style={{ maxWidth: 220 }}>
                            <span style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              color: "#94a3b8",
                              fontSize: "0.8125rem",
                              lineHeight: 1.5
                            }}>
                              {c.description}
                            </span>
                          </td>
                          <td>
                            {pri ? (
                              <span className="pri-chip" style={{ background: pri.bg, border: `1px solid ${pri.border}`, color: pri.color }}>
                                <span className="pri-dot" style={{ background: pri.dot }} />
                                {c.priority}
                              </span>
                            ) : <PriorityBadge priority={c.priority} />}
                          </td>
                          <td>
                            {sts ? (
                              <span className="status-chip" style={{ background: sts.bg, border: `1px solid ${sts.border}`, color: sts.color }}>
                                {sts.icon}
                                {c.status}
                              </span>
                            ) : <StatusBadge status={c.status} />}
                          </td>
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: "#475569" }}>
                            {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;