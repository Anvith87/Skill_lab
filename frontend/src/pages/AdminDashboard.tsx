import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle, Zap, Wifi, Droplets, Sparkles, MoreHorizontal,
  Clock, CheckCircle2, XCircle, Loader2, ShieldCheck, Filter,
  BarChart2, PieChartIcon, Download, CalendarDays,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const STATUSES   = ["Pending", "In Progress", "Resolved", "Rejected"] as const;
const CATEGORIES = ["Electrical", "Plumbing", "Internet", "Cleaning", "Other"] as const;
const PRIORITIES = ["Low", "Medium", "High"] as const;

type TimeRange = "all" | "7" | "30";

const categoryIcons: Record<string, React.ReactNode> = {
  Electrical: <Zap size={12}/>, Plumbing: <Droplets size={12}/>,
  Internet: <Wifi size={12}/>, Cleaning: <Sparkles size={12}/>, Other: <MoreHorizontal size={12}/>,
};
const priorityConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Low:    { color:"#34d399", bg:"rgba(52,211,153,0.08)",  border:"rgba(52,211,153,0.2)",  dot:"#34d399" },
  Medium: { color:"#fbbf24", bg:"rgba(251,191,36,0.08)",  border:"rgba(251,191,36,0.2)",  dot:"#fbbf24" },
  High:   { color:"#f87171", bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.2)", dot:"#f87171" },
};
const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Pending:       { color:"#94a3b8", bg:"rgba(148,163,184,0.08)", border:"rgba(148,163,184,0.2)", icon:<Clock size={11}/> },
  "In Progress": { color:"#60a5fa", bg:"rgba(96,165,250,0.08)",  border:"rgba(96,165,250,0.2)",  icon:<Loader2 size={11}/> },
  Resolved:      { color:"#34d399", bg:"rgba(52,211,153,0.08)",  border:"rgba(52,211,153,0.2)",  icon:<CheckCircle2 size={11}/> },
  Rejected:      { color:"#f87171", bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.2)", icon:<XCircle size={11}/> },
};
const STATUS_COLORS   = ["#94a3b8","#60a5fa","#34d399","#f87171"];

/* ─────────────────────────── TYPES ─────────────────────────── */
interface AdminComplaint {
  _id: string;
  student: { name: string; block: string; roomNumber: string; email: string };
  category: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  description: string;
  createdAt: string;
}

/* ─────────────────────────── CSV EXPORT ─────────────────────────── */
function exportToCSV(complaints: AdminComplaint[]): void {
  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const escapeCell = (val: string): string =>
    `"${val.replace(/"/g, '""')}"`;

  const headers = [
    "Student Name", "Email", "Block", "Room Number",
    "Category", "Priority", "Status", "Description", "Created Date",
  ];

  const rows = complaints.map((c) => [
    escapeCell(c.student?.name   ?? ""),
    escapeCell(c.student?.email  ?? ""),
    escapeCell(c.student?.block  ?? ""),
    escapeCell(c.student?.roomNumber ?? ""),
    escapeCell(c.category),
    escapeCell(c.priority),
    escapeCell(c.status),
    escapeCell(c.description),
    escapeCell(formatDate(c.createdAt)),
  ].join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const today = new Date().toISOString().split("T")[0];

  const link = document.createElement("a");
  link.href     = url;
  link.download = `complaints-report-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ─────────────────────────── CUSTOM TOOLTIP ─────────────────────────── */
const ChartTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; color?: string; name?: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"rgba(15,23,42,0.97)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:10, padding:"8px 14px", fontSize:"0.8rem",
      color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif",
      boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <div style={{color:"#64748b",marginBottom:3,fontSize:"0.75rem"}}>
        {label ?? payload[0]?.name}
      </div>
      <div style={{fontWeight:600, color:payload[0]?.color ?? "#60a5fa"}}>
        {payload[0]?.value} complaint{payload[0]?.value !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */
const AdminDashboard = () => {
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [timeRange,      setTimeRange]      = useState<TimeRange>("all");
  const [exporting,      setExporting]      = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complaints = [], isLoading } = useQuery<AdminComplaint[]>({
    queryKey: ["admin-complaints"],
    queryFn: async () => { const res = await api.get("/api/admin/complaints"); return res.data; },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/api/admin/complaints/${id}`, { status }); return res.data;
    },
    onSuccess: () => {
      toast({ title:"Updated", description:"Status updated successfully." });
      queryClient.invalidateQueries({ queryKey:["admin-complaints"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast({ title:"Error", description:error?.response?.data?.message ?? "Failed to update.", variant:"destructive" });
    },
  });

  /* ── Time-filtered complaints (charts only) ── */
  const analyticsComplaints = useMemo<AdminComplaint[]>(() => {
    if (timeRange === "all") return complaints;
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - Number(timeRange));
    return complaints.filter((c) => new Date(c.createdAt) >= cutoff);
  }, [complaints, timeRange]);

  /* ── Table-filtered complaints ── */
  const filtered = useMemo<AdminComplaint[]>(() =>
    complaints.filter((c) => {
      if (filterStatus   !== "all" && c.status   !== filterStatus)   return false;
      if (filterCategory !== "all" && c.category !== filterCategory) return false;
      if (filterPriority !== "all" && c.priority !== filterPriority) return false;
      return true;
    }),
  [complaints, filterStatus, filterCategory, filterPriority]);

  /* ── Stats from analyticsComplaints ── */
  const stats = useMemo(() => ({
    total:          analyticsComplaints.length,
    pending:        analyticsComplaints.filter(c=>c.status==="Pending").length,
    inProgress:     analyticsComplaints.filter(c=>c.status==="In Progress").length,
    resolved:       analyticsComplaints.filter(c=>c.status==="Resolved").length,
    high:           analyticsComplaints.filter(c=>c.priority==="High").length,
    uniqueStudents: new Set(analyticsComplaints.map(c=>c.student?.email)).size,
  }), [analyticsComplaints]);

  /* ── Chart data from analyticsComplaints ── */
  const categoryData = CATEGORIES.map(cat => ({
    name: cat, count: analyticsComplaints.filter(c=>c.category===cat).length,
  }));
  const statusData = STATUSES.map(s => ({
    name: s, value: analyticsComplaints.filter(c=>c.status===s).length,
  }));
  const resolutionRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const activeFilters = [filterStatus, filterCategory, filterPriority].filter(f=>f!=="all").length;

  /* ── CSV Export handler ── */
  const handleExport = () => {
    if (filtered.length === 0) {
      toast({ title:"Nothing to export", description:"No complaints match the current filters.", variant:"destructive" });
      return;
    }
    setExporting(true);
    try {
      exportToCSV(filtered);
      toast({ title:"Export successful", description:`${filtered.length} complaints exported to CSV.` });
    } catch {
      toast({ title:"Export failed", description:"Could not generate CSV.", variant:"destructive" });
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  const timeRangeLabel: Record<TimeRange, string> = {
    all: "All Time", "7": "Last 7 Days", "30": "Last 30 Days",
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* ══ DARK TOKENS ══ */
        :root,.dark{
          --ad-bg:            #080c14;
          --ad-stat-bg:       rgba(255,255,255,0.03);
          --ad-stat-border:   rgba(255,255,255,0.07);
          --ad-stat-border-h: rgba(255,255,255,0.13);
          --ad-stat-line:     linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);
          --ad-label:         #475569;
          --ad-sub:           #334155;
          --ad-panel-bg:      rgba(255,255,255,0.03);
          --ad-panel-border:  rgba(255,255,255,0.07);
          --ad-panel-accent:  linear-gradient(90deg,transparent,rgba(59,130,246,0.35),transparent);
          --ad-hdr-border:    rgba(255,255,255,0.05);
          --ad-icon-bg:       rgba(59,130,246,0.12);
          --ad-icon-border:   rgba(59,130,246,0.2);
          --ad-icon-color:    #60a5fa;
          --ad-title:         #e2e8f0;
          --ad-cnt-bg:        rgba(59,130,246,0.12);
          --ad-cnt-border:    rgba(59,130,246,0.22);
          --ad-cnt-color:     #60a5fa;
          --ad-filter:        #475569;
          --ad-badge-bg:      rgba(59,130,246,0.2);
          --ad-badge-color:   #60a5fa;
          --ad-sel-bg:        rgba(255,255,255,0.04);
          --ad-sel-border:    rgba(255,255,255,0.09);
          --ad-sel-color:     #cbd5e1;
          --ad-sel-focus:     rgba(59,130,246,0.4);
          --ad-act-border:    rgba(59,130,246,0.35);
          --ad-act-color:     #60a5fa;
          --ad-act-bg:        rgba(59,130,246,0.07);
          --ad-row-color:     #94a3b8;
          --ad-row-hvr-border:rgba(59,130,246,0.35);
          --ad-row-hvr-color: #e2e8f0;
          --ad-thead-border:  rgba(255,255,255,0.06);
          --ad-th:            #334155;
          --ad-tr-border:     rgba(255,255,255,0.04);
          --ad-tr-hover:      rgba(255,255,255,0.02);
          --ad-td:            #94a3b8;
          --ad-sname:         #cbd5e1;
          --ad-semail:        #334155;
          --ad-room-bg:       rgba(255,255,255,0.04);
          --ad-room-border:   rgba(255,255,255,0.07);
          --ad-room-color:    #64748b;
          --ad-cat-bg:        rgba(255,255,255,0.05);
          --ad-cat-border:    rgba(255,255,255,0.08);
          --ad-cat-color:     #94a3b8;
          --ad-desc:          #64748b;
          --ad-date:          #475569;
          --ad-empty-icon-bg: rgba(255,255,255,0.03);
          --ad-empty-icon-border:rgba(255,255,255,0.07);
          --ad-empty-icon-color:#334155;
          --ad-empty-title:   #475569;
          --ad-empty-sub:     #334155;
          --ad-reset-border:  rgba(248,113,113,0.2);
          --ad-reset-color:   #f87171;
          --ad-reset-hvr-bg:  rgba(248,113,113,0.07);
          --ad-reset-hvr-border:rgba(248,113,113,0.35);
          --ad-axis:          #334155;
          --ad-rate-ring:     rgba(255,255,255,0.06);
          --ad-rate-text:     #f1f5f9;
          --ad-rate-sub:      #475569;
          --ad-export-bg:     rgba(52,211,153,0.1);
          --ad-export-border: rgba(52,211,153,0.2);
          --ad-export-color:  #34d399;
          --ad-export-hvr-bg: rgba(52,211,153,0.15);
          --ad-export-hvr-border:rgba(52,211,153,0.35);
          --ad-toolbar-bg:    rgba(255,255,255,0.02);
          --ad-toolbar-border:rgba(255,255,255,0.06);
          --ad-time-active-bg:rgba(59,130,246,0.12);
          --ad-time-active-border:rgba(59,130,246,0.3);
          --ad-time-active-color:#60a5fa;
          --ad-time-dot:      #60a5fa;
        }

        /* ══ LIGHT TOKENS ══ */
        .light{
          --ad-bg:            #f1f5fb;
          --ad-stat-bg:       rgba(255,255,255,0.75);
          --ad-stat-border:   rgba(0,0,0,0.07);
          --ad-stat-border-h: rgba(0,0,0,0.13);
          --ad-stat-line:     linear-gradient(90deg,transparent,rgba(0,0,0,0.05),transparent);
          --ad-label:         #94a3b8;
          --ad-sub:           #cbd5e1;
          --ad-panel-bg:      rgba(255,255,255,0.75);
          --ad-panel-border:  rgba(0,0,0,0.07);
          --ad-panel-accent:  linear-gradient(90deg,transparent,rgba(37,99,235,0.2),transparent);
          --ad-hdr-border:    rgba(0,0,0,0.06);
          --ad-icon-bg:       rgba(37,99,235,0.08);
          --ad-icon-border:   rgba(37,99,235,0.18);
          --ad-icon-color:    #2563eb;
          --ad-title:         #0f172a;
          --ad-cnt-bg:        rgba(37,99,235,0.08);
          --ad-cnt-border:    rgba(37,99,235,0.2);
          --ad-cnt-color:     #2563eb;
          --ad-filter:        #94a3b8;
          --ad-badge-bg:      rgba(37,99,235,0.15);
          --ad-badge-color:   #2563eb;
          --ad-sel-bg:        rgba(0,0,0,0.02);
          --ad-sel-border:    rgba(0,0,0,0.1);
          --ad-sel-color:     #334155;
          --ad-sel-focus:     rgba(37,99,235,0.35);
          --ad-act-border:    rgba(37,99,235,0.3);
          --ad-act-color:     #2563eb;
          --ad-act-bg:        rgba(37,99,235,0.05);
          --ad-row-color:     #64748b;
          --ad-row-hvr-border:rgba(37,99,235,0.3);
          --ad-row-hvr-color: #0f172a;
          --ad-thead-border:  rgba(0,0,0,0.06);
          --ad-th:            #94a3b8;
          --ad-tr-border:     rgba(0,0,0,0.04);
          --ad-tr-hover:      rgba(0,0,0,0.02);
          --ad-td:            #64748b;
          --ad-sname:         #1e293b;
          --ad-semail:        #94a3b8;
          --ad-room-bg:       rgba(0,0,0,0.03);
          --ad-room-border:   rgba(0,0,0,0.07);
          --ad-room-color:    #64748b;
          --ad-cat-bg:        rgba(0,0,0,0.03);
          --ad-cat-border:    rgba(0,0,0,0.07);
          --ad-cat-color:     #64748b;
          --ad-desc:          #94a3b8;
          --ad-date:          #94a3b8;
          --ad-empty-icon-bg: rgba(0,0,0,0.02);
          --ad-empty-icon-border:rgba(0,0,0,0.07);
          --ad-empty-icon-color:#94a3b8;
          --ad-empty-title:   #64748b;
          --ad-empty-sub:     #94a3b8;
          --ad-reset-border:  rgba(220,38,38,0.2);
          --ad-reset-color:   #dc2626;
          --ad-reset-hvr-bg:  rgba(220,38,38,0.05);
          --ad-reset-hvr-border:rgba(220,38,38,0.35);
          --ad-axis:          #94a3b8;
          --ad-rate-ring:     rgba(0,0,0,0.06);
          --ad-rate-text:     #0f172a;
          --ad-rate-sub:      #94a3b8;
          --ad-export-bg:     rgba(22,163,74,0.08);
          --ad-export-border: rgba(22,163,74,0.2);
          --ad-export-color:  #16a34a;
          --ad-export-hvr-bg: rgba(22,163,74,0.12);
          --ad-export-hvr-border:rgba(22,163,74,0.35);
          --ad-toolbar-bg:    rgba(255,255,255,0.6);
          --ad-toolbar-border:rgba(0,0,0,0.06);
          --ad-time-active-bg:rgba(37,99,235,0.08);
          --ad-time-active-border:rgba(37,99,235,0.25);
          --ad-time-active-color:#2563eb;
          --ad-time-dot:      #2563eb;
        }

        .ad-wrap{ font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; gap:1.75rem; }

        /* ── STAT CARDS ── */
        .ad-stats{ display:grid; grid-template-columns:repeat(6,1fr); gap:1rem; }
        @media(max-width:1100px){.ad-stats{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:640px){.ad-stats{grid-template-columns:repeat(2,1fr);}}
        .stat-card{ background:var(--ad-stat-bg); border:1px solid var(--ad-stat-border); border-radius:16px; padding:1.125rem 1.25rem; position:relative; overflow:hidden; transition:border-color .2s,transform .2s,background .3s; cursor:default; }
        .stat-card:hover{ border-color:var(--ad-stat-border-h); transform:translateY(-2px); }
        .stat-card::before{ content:''; position:absolute; top:0;left:0;right:0; height:1px; background:var(--ad-stat-line); }
        .stat-label{ font-size:.68rem; text-transform:uppercase; letter-spacing:.07em; color:var(--ad-label); font-weight:500; margin-bottom:.5rem; white-space:nowrap; transition:color .3s; }
        .stat-value{ font-family:'Syne',sans-serif; font-size:1.875rem; font-weight:700; line-height:1; margin-bottom:.2rem; }
        .stat-sub{ font-size:.7rem; color:var(--ad-sub); white-space:nowrap; transition:color .3s; }
        .stat-icon-bg{ position:absolute; bottom:.75rem;right:1rem; opacity:.06; font-size:2.25rem; line-height:1; }

        /* ── ANALYTICS TOOLBAR ── */
        .analytics-toolbar{
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:.875rem;
          background:var(--ad-toolbar-bg);
          border:1px solid var(--ad-toolbar-border);
          border-radius:16px; padding:.875rem 1.25rem;
          transition:background .3s,border-color .3s;
        }
        .toolbar-left{ display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; }
        .toolbar-section-label{
          font-size:.72rem; font-weight:600; color:var(--ad-label);
          text-transform:uppercase; letter-spacing:.07em;
          transition:color .3s;
        }

        /* Time range pills */
        .time-pills{ display:flex; align-items:center; gap:.375rem; }
        .time-pill{
          display:inline-flex; align-items:center; gap:.35rem;
          background:var(--ad-sel-bg); border:1px solid var(--ad-sel-border);
          border-radius:99px; padding:.3rem .75rem;
          font-size:.775rem; font-weight:500; color:var(--ad-sel-color);
          cursor:pointer; transition:all .2s; white-space:nowrap;
          font-family:'DM Sans',sans-serif;
        }
        .time-pill:hover{ border-color:var(--ad-act-border); color:var(--ad-act-color); }
        .time-pill.active{
          background:var(--ad-time-active-bg);
          border-color:var(--ad-time-active-border);
          color:var(--ad-time-active-color);
        }
        .time-pill-dot{
          width:5px; height:5px; border-radius:50%;
          background:var(--ad-time-dot); opacity:0;
          transition:opacity .2s;
        }
        .time-pill.active .time-pill-dot{ opacity:1; }

        /* Analytics label */
        .analytics-range-badge{
          display:inline-flex; align-items:center; gap:.35rem;
          font-size:.72rem; color:var(--ad-sub);
          transition:color .3s;
        }

        /* Export button */
        .export-btn{
          display:inline-flex; align-items:center; gap:.5rem;
          background:var(--ad-export-bg);
          border:1px solid var(--ad-export-border);
          border-radius:10px; padding:.45rem 1rem;
          font-family:'Syne',sans-serif; font-size:.8125rem; font-weight:600;
          color:var(--ad-export-color); cursor:pointer;
          transition:all .2s; white-space:nowrap; letter-spacing:.01em;
        }
        .export-btn:hover:not(:disabled){
          background:var(--ad-export-hvr-bg);
          border-color:var(--ad-export-hvr-border);
          transform:translateY(-1px);
          box-shadow:0 4px 12px rgba(52,211,153,0.15);
        }
        .export-btn:disabled{ opacity:.6; cursor:not-allowed; }
        .export-spin{
          width:13px; height:13px;
          border:2px solid rgba(52,211,153,0.3);
          border-top-color:#34d399;
          border-radius:50%; animation:spin .6s linear infinite;
        }

        /* ── ANALYTICS GRID ── */
        .ad-charts{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.25rem; }
        @media(max-width:1024px){.ad-charts{grid-template-columns:1fr 1fr;}}
        @media(max-width:640px){.ad-charts{grid-template-columns:1fr;}}

        /* ── PANELS ── */
        .ad-panel,.chart-panel{ background:var(--ad-panel-bg); border:1px solid var(--ad-panel-border); border-radius:20px; overflow:hidden; position:relative; transition:background .3s,border-color .3s; }
        .ad-panel::before,.chart-panel::before{ content:''; position:absolute; top:0;left:15%;right:15%; height:1px; background:var(--ad-panel-accent); }
        .ad-panel-header,.chart-header{ padding:1.125rem 1.5rem; display:flex; flex-wrap:wrap; align-items:center; gap:.875rem; border-bottom:1px solid var(--ad-hdr-border); transition:border-color .3s; }
        .panel-left{ display:flex;align-items:center;gap:.625rem;flex:1;min-width:160px; }
        .panel-icon,.chart-icon{ display:flex;align-items:center;justify-content:center; background:var(--ad-icon-bg);border:1px solid var(--ad-icon-border); border-radius:8px;color:var(--ad-icon-color);flex-shrink:0;transition:all .3s; }
        .panel-icon{ width:30px;height:30px; }
        .chart-icon{ width:28px;height:28px; }
        .panel-title,.chart-title{ font-family:'Syne',sans-serif; font-size:.9rem; font-weight:600; color:var(--ad-title); letter-spacing:-.01em; transition:color .3s; }
        .panel-count{ display:inline-flex;align-items:center;justify-content:center; min-width:22px;height:22px;padding:0 6px; background:var(--ad-cnt-bg);border:1px solid var(--ad-cnt-border); border-radius:99px;font-size:.72rem;font-weight:600;color:var(--ad-cnt-color);transition:all .3s; }
        .chart-body{ padding:1.25rem 1rem 1.5rem; }

        /* ── RESOLUTION RING ── */
        .rate-ring-wrap{ display:flex;flex-direction:column;align-items:center;justify-content:center; padding:1.5rem 1rem 2rem; gap:1.125rem; }
        .rate-ring{ position:relative;width:118px;height:118px; }
        .rate-svg{ width:118px;height:118px;transform:rotate(-90deg); }
        .rate-bg-circle{ fill:none;stroke:var(--ad-rate-ring);stroke-width:9;transition:stroke .3s; }
        .rate-fg-circle{ fill:none;stroke:url(#rateGrad);stroke-width:9;stroke-linecap:round; stroke-dasharray:333; transition:stroke-dashoffset .9s cubic-bezier(.16,1,.3,1); }
        .rate-inner{ position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center; }
        .rate-pct{ font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:700;color:var(--ad-rate-text);line-height:1;transition:color .3s; }
        .rate-lbl{ font-size:.62rem;color:var(--ad-rate-sub);text-transform:uppercase;letter-spacing:.06em;transition:color .3s; }
        .rate-stats{ display:flex;gap:1.625rem; }
        .rate-stat{ text-align:center; }
        .rate-stat-val{ font-family:'Syne',sans-serif;font-size:1.125rem;font-weight:700;line-height:1; }
        .rate-stat-lbl{ font-size:.68rem;color:var(--ad-sub);margin-top:.2rem;white-space:nowrap;transition:color .3s; }

        /* ── FILTERS ── */
        .filters-wrap{ display:flex;flex-wrap:wrap;align-items:center;gap:.625rem; }
        .filter-label{ display:flex;align-items:center;gap:.35rem;font-size:.75rem;color:var(--ad-filter);font-weight:500;white-space:nowrap;transition:color .3s; }
        .filter-badge{ display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px; background:var(--ad-badge-bg);border-radius:50%;font-size:.65rem;font-weight:700;color:var(--ad-badge-color);transition:all .3s; }

        /* selects */
        .dark-sel [data-radix-select-trigger],.dark-sel button[role="combobox"]{ background:var(--ad-sel-bg)!important;border:1px solid var(--ad-sel-border)!important;border-radius:9px!important;color:var(--ad-sel-color)!important;font-family:'DM Sans',sans-serif!important;font-size:.8125rem!important;height:36px!important;min-width:130px!important;transition:border-color .2s,color .3s,background .3s!important; }
        .dark-sel [data-radix-select-trigger]:focus,.dark-sel button[role="combobox"]:focus{ border-color:var(--ad-sel-focus)!important;box-shadow:0 0 0 3px rgba(59,130,246,0.1)!important;outline:none!important; }
        .row-sel [data-radix-select-trigger],.row-sel button[role="combobox"]{ background:var(--ad-sel-bg)!important;border:1px solid var(--ad-sel-border)!important;border-radius:8px!important;color:var(--ad-row-color)!important;font-family:'DM Sans',sans-serif!important;font-size:.775rem!important;height:32px!important;min-width:120px!important;transition:border-color .2s,color .3s!important; }
        .row-sel [data-radix-select-trigger]:hover,.row-sel button[role="combobox"]:hover{ border-color:var(--ad-row-hvr-border)!important;color:var(--ad-row-hvr-color)!important; }
        .filter-active [data-radix-select-trigger],.filter-active button[role="combobox"]{ border-color:var(--ad-act-border)!important;color:var(--ad-act-color)!important;background:var(--ad-act-bg)!important; }

        /* ── TABLE ── */
        .ad-table-wrap{ overflow-x:auto; }
        .ad-table{ width:100%;border-collapse:collapse;min-width:780px; }
        .ad-table thead tr{ border-bottom:1px solid var(--ad-thead-border);transition:border-color .3s; }
        .ad-table th{ padding:.75rem 1.25rem;text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ad-th);font-weight:500;white-space:nowrap;transition:color .3s; }
        .ad-table tbody tr{ border-bottom:1px solid var(--ad-tr-border);transition:background .15s,border-color .3s; }
        .ad-table tbody tr:last-child{ border-bottom:none; }
        .ad-table tbody tr:hover{ background:var(--ad-tr-hover); }
        .ad-table td{ padding:.9375rem 1.25rem;font-size:.875rem;color:var(--ad-td);vertical-align:middle;transition:color .3s; }
        .student-cell{ display:flex;flex-direction:column;gap:.2rem; }
        .student-name{ font-weight:500;color:var(--ad-sname);font-size:.875rem;white-space:nowrap;transition:color .3s; }
        .student-email{ font-size:.75rem;color:var(--ad-semail);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;transition:color .3s; }
        .room-chip{ display:inline-flex;align-items:center;background:var(--ad-room-bg);border:1px solid var(--ad-room-border);border-radius:7px;padding:.2rem .55rem;font-size:.8rem;color:var(--ad-room-color);font-family:'Syne',sans-serif;font-weight:600;letter-spacing:.02em;white-space:nowrap;transition:all .3s; }
        .cat-chip{ display:inline-flex;align-items:center;gap:.35rem;background:var(--ad-cat-bg);border:1px solid var(--ad-cat-border);border-radius:99px;padding:.22rem .625rem;font-size:.775rem;color:var(--ad-cat-color);font-weight:500;white-space:nowrap;transition:all .3s; }
        .pri-chip{ display:inline-flex;align-items:center;gap:.3rem;border-radius:99px;padding:.22rem .65rem;font-size:.775rem;font-weight:500;white-space:nowrap; }
        .pri-dot{ width:5px;height:5px;border-radius:50%;flex-shrink:0; }
        .sts-chip{ display:inline-flex;align-items:center;gap:.3rem;border-radius:99px;padding:.22rem .65rem;font-size:.775rem;font-weight:500;white-space:nowrap; }

        /* ── EMPTY / LOADING ── */
        .empty-state{ display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 1rem;gap:.75rem;text-align:center; }
        .empty-icon{ width:52px;height:52px;background:var(--ad-empty-icon-bg);border:1px solid var(--ad-empty-icon-border);border-radius:14px;display:flex;align-items:center;justify-content:center;color:var(--ad-empty-icon-color);margin-bottom:.25rem;transition:all .3s; }
        .empty-title{ font-family:'Syne',sans-serif;font-size:.9375rem;color:var(--ad-empty-title);font-weight:600;transition:color .3s; }
        .empty-sub{ font-size:.8125rem;color:var(--ad-empty-sub);transition:color .3s; }
        .spin{ width:20px;height:20px;border:2px solid rgba(96,165,250,0.2);border-top-color:#60a5fa;border-radius:50%;animation:spin .7s linear infinite; }
        @keyframes spin{to{transform:rotate(360deg);}}
        .reset-btn{ display:inline-flex;align-items:center;gap:.35rem;background:none;border:1px solid var(--ad-reset-border);border-radius:8px;padding:.35rem .75rem;font-size:.775rem;font-weight:500;color:var(--ad-reset-color);cursor:pointer;transition:background .2s,border-color .2s;font-family:'DM Sans',sans-serif; }
        .reset-btn:hover{ background:var(--ad-reset-hvr-bg);border-color:var(--ad-reset-hvr-border); }

        /* ── TABLE FOOTER ── */
        .table-footer{
          padding:.875rem 1.5rem;
          display:flex; align-items:center; justify-content:space-between;
          border-top:1px solid var(--ad-hdr-border);
          transition:border-color .3s;
        }
        .table-footer-text{ font-size:.775rem; color:var(--ad-sub); transition:color .3s; }
      `}</style>

      <div className="ad-wrap">

        {/* ══ STAT CARDS ══ */}
        <div className="ad-stats">
          {([
            { label:"Total",         value:stats.total,          sub:"All complaints",   icon:"📋", color:"#60a5fa" },
            { label:"Pending",       value:stats.pending,        sub:"Awaiting action",  icon:"⏳", color:"#94a3b8" },
            { label:"In Progress",   value:stats.inProgress,     sub:"Being resolved",   icon:"⚙️", color:"#60a5fa" },
            { label:"Resolved",      value:stats.resolved,       sub:"Completed",        icon:"✅", color:"#34d399" },
            { label:"High Priority", value:stats.high,           sub:"Need attention",   icon:"🔴", color:"#f87171" },
            { label:"Students",      value:stats.uniqueStudents, sub:"Unique reporters", icon:"👥", color:"#a78bfa" },
          ] as const).map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{color:s.color}}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
              <div className="stat-icon-bg">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* ══ ANALYTICS TOOLBAR ══ */}
        <div className="analytics-toolbar">
          <div className="toolbar-left">
            <div style={{display:"flex",alignItems:"center",gap:".4rem"}}>
              <CalendarDays size={13} style={{color:"var(--ad-icon-color)"}}/>
              <span className="toolbar-section-label">Time Range</span>
            </div>
            <div className="time-pills">
              {(["all","7","30"] as TimeRange[]).map((t) => (
                <button
                  key={t}
                  className={`time-pill ${timeRange===t ? "active" : ""}`}
                  onClick={() => setTimeRange(t)}
                >
                  <span className="time-pill-dot"/>
                  {timeRangeLabel[t]}
                </button>
              ))}
            </div>
            {timeRange !== "all" && (
              <span className="analytics-range-badge">
                <span style={{
                  width:6,height:6,borderRadius:"50%",background:"var(--ad-time-dot)",
                  display:"inline-block",animation:"pulse-dot 2s ease-in-out infinite"
                }}/>
                Showing {analyticsComplaints.length} complaint{analyticsComplaints.length!==1?"s":""}
              </span>
            )}
          </div>

          {/* Export button */}
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={exporting || filtered.length===0}
          >
            {exporting
              ? <><div className="export-spin"/>Exporting...</>
              : <><Download size={14}/>Export CSV</>
            }
          </button>
        </div>

        {/* ══ ANALYTICS CHARTS ══ */}
        <div className="ad-charts">

          {/* 1 — Category Bar Chart */}
          <div className="chart-panel">
            <div className="chart-header">
              <div className="chart-icon"><BarChart2 size={14}/></div>
              <span className="chart-title">Complaints by Category</span>
              {timeRange !== "all" && (
                <span style={{fontSize:".68rem",color:"var(--ad-cnt-color)",marginLeft:"auto",
                  background:"var(--ad-cnt-bg)",border:"1px solid var(--ad-cnt-border)",
                  borderRadius:99,padding:".15rem .5rem",fontWeight:600}}>
                  {timeRangeLabel[timeRange]}
                </span>
              )}
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={195}>
                <BarChart data={categoryData} barCategoryGap="38%">
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{fontSize:10,fill:"var(--ad-axis)",fontFamily:"DM Sans"}} axisLine={false} tickLine={false}/>
                  <YAxis allowDecimals={false} tick={{fontSize:10,fill:"var(--ad-axis)",fontFamily:"DM Sans"}} axisLine={false} tickLine={false} width={22}/>
                  <Tooltip content={<ChartTooltip/>} cursor={{fill:"rgba(96,165,250,0.06)"}}/>
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[6,6,0,0]} maxBarSize={38}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2 — Status Pie Chart */}
          <div className="chart-panel">
            <div className="chart-header">
              <div className="chart-icon"><PieChartIcon size={14}/></div>
              <span className="chart-title">Status Distribution</span>
              {timeRange !== "all" && (
                <span style={{fontSize:".68rem",color:"var(--ad-cnt-color)",marginLeft:"auto",
                  background:"var(--ad-cnt-bg)",border:"1px solid var(--ad-cnt-border)",
                  borderRadius:99,padding:".15rem .5rem",fontWeight:600}}>
                  {timeRangeLabel[timeRange]}
                </span>
              )}
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={195}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name"
                    cx="50%" cy="43%" outerRadius={62} paddingAngle={3}>
                    {statusData.map((_,i)=>(
                      <Cell key={i} fill={STATUS_COLORS[i]} stroke="transparent"/>
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip/>}/>
                  <Legend iconType="circle" iconSize={7}
                    formatter={(v:string)=>(
                      <span style={{fontSize:"0.71rem",color:"var(--ad-axis)",fontFamily:"DM Sans"}}>{v}</span>
                    )}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 — Resolution Rate Ring */}
          <div className="chart-panel">
            <div className="chart-header">
              <div className="chart-icon"><CheckCircle2 size={14}/></div>
              <span className="chart-title">Resolution Rate</span>
              {timeRange !== "all" && (
                <span style={{fontSize:".68rem",color:"var(--ad-cnt-color)",marginLeft:"auto",
                  background:"var(--ad-cnt-bg)",border:"1px solid var(--ad-cnt-border)",
                  borderRadius:99,padding:".15rem .5rem",fontWeight:600}}>
                  {timeRangeLabel[timeRange]}
                </span>
              )}
            </div>
            <div className="rate-ring-wrap">
              <div className="rate-ring">
                <svg className="rate-svg" viewBox="0 0 118 118">
                  <defs>
                    <linearGradient id="rateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34d399"/>
                      <stop offset="100%" stopColor="#0ea5e9"/>
                    </linearGradient>
                  </defs>
                  <circle className="rate-bg-circle" cx="59" cy="59" r="53"/>
                  <circle className="rate-fg-circle" cx="59" cy="59" r="53"
                    strokeDashoffset={333-(333*resolutionRate/100)}/>
                </svg>
                <div className="rate-inner">
                  <span className="rate-pct">{resolutionRate}%</span>
                  <span className="rate-lbl">resolved</span>
                </div>
              </div>
              <div className="rate-stats">
                {([
                  { val:stats.resolved,                   color:"#34d399", lbl:"Resolved" },
                  { val:stats.pending+stats.inProgress,   color:"#60a5fa", lbl:"Open"     },
                  { val:stats.high,                       color:"#f87171", lbl:"High Pri." },
                ] as const).map(r=>(
                  <div className="rate-stat" key={r.lbl}>
                    <div className="rate-stat-val" style={{color:r.color}}>{r.val}</div>
                    <div className="rate-stat-lbl">{r.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ══ COMPLAINTS TABLE PANEL ══ */}
        <div className="ad-panel">
          <div className="ad-panel-header">
            <div className="panel-left">
              <div className="panel-icon"><ShieldCheck size={15}/></div>
              <span className="panel-title">All Complaints</span>
              {filtered.length>0 && <span className="panel-count">{filtered.length}</span>}
            </div>
            <div className="filters-wrap">
              <span className="filter-label">
                <Filter size={12}/>Filter
                {activeFilters>0 && <span className="filter-badge">{activeFilters}</span>}
              </span>
              {([
                { val:filterStatus,   set:setFilterStatus,   items:[...STATUSES],   ph:"Status"   },
                { val:filterCategory, set:setFilterCategory, items:[...CATEGORIES], ph:"Category" },
                { val:filterPriority, set:setFilterPriority, items:[...PRIORITIES], ph:"Priority" },
              ] as const).map(({val,set,items,ph})=>(
                <div key={ph} className={`dark-sel ${val!=="all"?"filter-active":""}`}>
                  <Select value={val} onValueChange={set}>
                    <SelectTrigger><SelectValue placeholder={ph}/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {ph}</SelectItem>
                      {items.map(i=><SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {activeFilters>0 && (
                <button className="reset-btn"
                  onClick={()=>{setFilterStatus("all");setFilterCategory("all");setFilterPriority("all");}}>
                  ✕ Reset
                </button>
              )}
            </div>
          </div>

          <div className="ad-table-wrap">
            {isLoading ? (
              <div className="empty-state">
                <div className="spin"/>
                <span style={{fontSize:".875rem",color:"var(--ad-empty-title)",marginTop:".5rem"}}>Loading complaints...</span>
              </div>
            ) : filtered.length===0 ? (
              <div className="empty-state">
                <div className="empty-icon"><AlertCircle size={22}/></div>
                <div className="empty-title">No complaints found</div>
                <div className="empty-sub">{activeFilters>0?"Try adjusting your filters.":"No complaints submitted yet."}</div>
              </div>
            ) : (
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Student</th><th>Room</th><th>Category</th>
                    <th>Description</th><th>Priority</th><th>Status</th>
                    <th>Date</th><th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c)=>{
                    const pri = priorityConfig[c.priority];
                    const sts = statusConfig[c.status] ?? statusConfig["Pending"];
                    return (
                      <tr key={c._id}>
                        <td>
                          <div className="student-cell">
                            <span className="student-name">{c.student?.name}</span>
                            <span className="student-email">{c.student?.email}</span>
                          </div>
                        </td>
                        <td><span className="room-chip">{c.student?.block}-{c.student?.roomNumber}</span></td>
                        <td><span className="cat-chip">{categoryIcons[c.category]??<MoreHorizontal size={12}/>}{c.category}</span></td>
                        <td style={{maxWidth:200}}>
                          <span style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",fontSize:".8rem",color:"var(--ad-desc)",lineHeight:1.5}}>
                            {c.description}
                          </span>
                        </td>
                        <td>
                          {pri
                            ? <span className="pri-chip" style={{background:pri.bg,border:`1px solid ${pri.border}`,color:pri.color}}><span className="pri-dot" style={{background:pri.dot}}/>{c.priority}</span>
                            : <PriorityBadge priority={c.priority}/>}
                        </td>
                        <td>
                          {sts
                            ? <span className="sts-chip" style={{background:sts.bg,border:`1px solid ${sts.border}`,color:sts.color}}>{sts.icon}{c.status}</span>
                            : <StatusBadge status={c.status}/>}
                        </td>
                        <td style={{whiteSpace:"nowrap",fontSize:".8rem",color:"var(--ad-date)"}}>
                          {new Date(c.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </td>
                        <td>
                          <div className="row-sel">
                            <Select value={c.status} onValueChange={(v)=>updateMutation.mutate({id:c._id,status:v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                {STATUSES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="table-footer">
              <span className="table-footer-text">
                Showing <strong style={{color:"var(--ad-cnt-color)"}}>{filtered.length}</strong> of{" "}
                <strong style={{color:"var(--ad-cnt-color)"}}>{complaints.length}</strong> complaints
              </span>
              <button
                className="export-btn"
                onClick={handleExport}
                disabled={exporting}
                style={{fontSize:".75rem",padding:".35rem .75rem"}}
              >
                {exporting
                  ? <><div className="export-spin"/>Exporting...</>
                  : <><Download size={12}/>Export {filtered.length} rows</>
                }
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
