import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  "In Progress": "bg-info/15 text-info border-info/30",
  Resolved: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-warning/15 text-warning border-warning/30",
  High: "bg-destructive/15 text-destructive border-destructive/30",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <Badge variant="outline" className={cn("text-xs font-medium", statusStyles[status] || "")}>
    {status}
  </Badge>
);

export const PriorityBadge = ({ priority }: { priority: string }) => (
  <Badge variant="outline" className={cn("text-xs font-medium", priorityStyles[priority] || "")}>
    {priority}
  </Badge>
);
