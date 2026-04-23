import type { CampaignStatus } from "../types";

const config: Record<CampaignStatus, { label: string; className: string; dot: string }> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
    dot: "bg-primary-500",
  },
  sending: {
    label: "Sending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    dot: "bg-amber-500 animate-pulse",
  },
  sent: {
    label: "Sent",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

interface Props {
  status: CampaignStatus;
}

export default function StatusBadge({ status }: Props) {
  const { label, className, dot } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
