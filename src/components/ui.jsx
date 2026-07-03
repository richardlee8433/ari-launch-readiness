// Shared UI atoms — status chips, health badges, panels.

export const READINESS_STATUS = {
  not_started: { label: "Not Started", icon: "🔴", chip: "bg-line text-mid" },
  in_progress: { label: "In Progress", icon: "🟡", chip: "bg-pale-lime text-navy" },
  blocked: { label: "Blocked", icon: "🚧", chip: "bg-amber-soft text-amber" },
  ready: { label: "Ready", icon: "✅", chip: "bg-teal/15 text-teal-deep" },
};

export const HEALTH = {
  red: { label: "At risk", dot: "bg-red", chip: "bg-red-soft text-red" },
  amber: { label: "Watch", dot: "bg-amber", chip: "bg-amber-soft text-amber" },
  green: { label: "On track", dot: "bg-green", chip: "bg-green-soft text-green" },
  none: { label: "Planning", dot: "bg-mid/40", chip: "bg-line text-mid" },
};

export function StatusChip({ statusKey, size = "sm" }) {
  const s = READINESS_STATUS[statusKey];
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs";
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full font-semibold ${pad} ${s.chip}`}>
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </span>
  );
}

export function HealthBadge({ health }) {
  const h = HEALTH[health];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${h.chip}`}>
      <span className={`h-2 w-2 rounded-full ${h.dot}`} aria-hidden />
      {h.label}
    </span>
  );
}

export function Panel({ title, accent = "bg-teal", right, children }) {
  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="flex items-center justify-between rounded-t-2xl border-b border-line px-5 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy">
          <span className={`h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden />
          {title}
        </h2>
        {right}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function SectionLabel({ children }) {
  return (
    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-mid">{children}</h3>
  );
}

export function CountBadge({ children }) {
  return (
    <span className="rounded-full bg-pale-blue px-2.5 py-0.5 text-xs font-semibold text-teal-deep">
      {children}
    </span>
  );
}
