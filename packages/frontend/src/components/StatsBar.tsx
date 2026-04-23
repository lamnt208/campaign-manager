interface Props {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}

export default function StatsBar({ label, value, percentage, color = "bg-primary-500" }: Props) {
  const pct = Math.round(percentage * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
        <span className="font-medium">{label}</span>
        <span>
          {value} <span style={{ color: "var(--text-muted)" }}>({pct}%)</span>
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--bg-subtle)" }}
      >
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
