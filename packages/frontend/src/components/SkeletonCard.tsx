export default function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-subtle)" }} />
        <div className="h-5 w-20 rounded-full" style={{ backgroundColor: "var(--bg-subtle)" }} />
      </div>
      <div className="mb-2 h-4 w-72 rounded-lg" style={{ backgroundColor: "var(--bg-subtle)" }} />
      <div className="h-4 w-32 rounded-lg" style={{ backgroundColor: "var(--bg-subtle)" }} />
    </div>
  );
}
