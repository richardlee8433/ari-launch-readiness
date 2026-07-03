// Screen A — the operating rhythm home. Every initiative sits somewhere on
// one lifecycle axis; the warning strip and event feed are derived, not typed.

import { STAGES } from "../data.js";
import { signalsFor, portfolioSignals, recentEvents } from "../derive.js";
import { HealthBadge, Panel, CountBadge, HEALTH } from "./ui.jsx";

function statLine(init, s) {
  if (init.postLaunch) {
    return `${init.postLaunch.measuredAt}: ${init.postLaunch.adoptionActual}% adoption vs ${init.postLaunch.adoptionTarget}% target`;
  }
  if (s.daysToLaunch != null && s.readiness) {
    return `${s.daysToLaunch}d to launch · ${s.readiness.pct}% ready`;
  }
  if (s.daysToLaunch != null) {
    return `${s.daysToLaunch}d to launch`;
  }
  const next = init.charter?.milestones?.find((m) => !m.done);
  return next ? `${next.label} · ${next.due}` : "—";
}

function InitiativeChip({ init, asOf, onOpen }) {
  const s = signalsFor(init, asOf);
  return (
    <button
      onClick={() => onOpen(init.id)}
      className="w-full rounded-xl border border-line bg-white p-3 text-left shadow-sm transition hover:border-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${HEALTH[s.health].dot}`} aria-hidden />
        <h3 className="min-w-0 flex-1 text-sm font-bold leading-snug text-navy">{init.name}</h3>
      </div>
      <p className="mt-1.5 text-xs text-mid">{init.owner}</p>
      <p className="mt-1 text-xs font-semibold text-teal-deep">{statLine(init, s)}</p>
    </button>
  );
}

function RhythmAxis({ initiatives, asOf, onOpen }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-mid">Operating Rhythm</h2>
        <span className="text-xs text-mid">every initiative moves left → right through the same gates</span>
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((stage, idx) => {
          const here = initiatives.filter((i) => i.stage === stage.key);
          const isGate = stage.key === "readiness";
          return (
            <div key={stage.key} className="flex flex-col">
              <div
                className={`mb-2 flex items-center gap-1 border-b-2 pb-1.5 text-xs font-bold uppercase tracking-wide ${
                  isGate ? "border-teal text-teal-deep" : "border-line text-mid"
                }`}
              >
                <span className="text-[10px] text-mid/60">{idx + 1}</span>
                {stage.label}
                {isGate && <span title="go / no-go gate">⛩</span>}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {here.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-line px-2 py-3 text-center text-[11px] text-mid/60">
                    —
                  </div>
                ) : (
                  here.map((init) => (
                    <InitiativeChip key={init.id} init={init} asOf={asOf} onOpen={onOpen} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WarningStrip({ initiatives, asOf }) {
  const p = portfolioSignals(initiatives, asOf);
  const cards = [
    {
      label: "Initiatives at risk",
      value: `${p.atRisk.length} / ${p.active.length}`,
      sub: p.atRisk.map(({ init }) => init.name.split("—")[0].trim()).join(" · ") || "none",
      tone: p.atRisk.some(({ s }) => s.health === "red") ? "red" : p.atRisk.length ? "amber" : "green",
    },
    {
      label: "Decision debt",
      value: `${p.decisionDebt.length} past due`,
      sub: p.decisionDebt.length
        ? `oldest ${Math.max(...p.decisionDebt.map((d) => d.overdue))}d overdue · ${p.openDecisions} open total`
        : `${p.openDecisions} open, all within due`,
      tone: p.decisionDebt.length ? "red" : "green",
    },
    {
      label: "Oldest open blocker",
      value: p.oldestBlocker ? `${p.oldestBlocker.days}d` : "0d",
      sub: p.oldestBlocker ? p.oldestBlocker.init.name.split("—")[0].trim() : "no open blockers",
      tone: p.oldestBlocker?.days >= 7 ? "red" : p.oldestBlocker ? "amber" : "green",
    },
    {
      label: "Readiness pace",
      value: p.paceWarnings.length ? `${p.paceWarnings.length} below line` : "on pace",
      sub: p.paceWarnings.length
        ? p.paceWarnings
            .map(({ init, s }) => `${init.name.split("—")[0].trim()} ${s.readiness.pct}% @ ${s.daysToLaunch}d`)
            .join(" · ")
        : "all launches tracking the pace line",
      tone: p.paceWarnings.length ? "amber" : "green",
    },
  ];
  const toneCls = {
    red: "border-red/30 bg-red-soft/40",
    amber: "border-amber/30 bg-amber-soft/40",
    green: "border-line bg-white",
  };
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-mid">Early Warnings</h2>
        <span className="text-xs text-mid">derived live from the backbone — nothing typed in</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border px-4 py-3 shadow-sm ${toneCls[c.tone]}`}>
            <div className="text-xs font-semibold uppercase tracking-wide text-mid">{c.label}</div>
            <div className="mt-1 text-xl font-bold text-navy">{c.value}</div>
            <div className="mt-0.5 truncate text-xs text-mid" title={c.sub}>
              {c.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EVENT_TYPE = {
  decision: { label: "decision", cls: "bg-amber-soft text-amber" },
  blocker: { label: "blocker", cls: "bg-red-soft text-red" },
  readiness: { label: "readiness", cls: "bg-teal/15 text-teal-deep" },
  milestone: { label: "milestone", cls: "bg-pale-blue text-navy" },
  scope: { label: "scope", cls: "bg-pale-lime text-navy" },
  review: { label: "review", cls: "bg-green-soft text-green" },
};

function EventsFeed({ initiatives, onOpen }) {
  const events = recentEvents(initiatives);
  return (
    <Panel title="What Moved This Week" accent="bg-lime" right={<CountBadge>{events.length}</CountBadge>}>
      <ul className="divide-y divide-line">
        {events.map((e, i) => (
          <li key={i} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="w-14 shrink-0 pt-0.5 text-xs font-semibold text-mid">
              {e.date.slice(5).replace("-", "/")}
            </span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${EVENT_TYPE[e.type].cls}`}
            >
              {EVENT_TYPE[e.type].label}
            </span>
            <p className="min-w-0 flex-1 text-sm leading-snug text-navy-2">
              {e.text}{" "}
              <button
                onClick={() => onOpen(e.initiative.id)}
                className="font-semibold text-teal hover:underline"
              >
                {e.initiative.name.split("—")[0].trim()} →
              </button>
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function Portfolio({ initiatives, asOf, onOpen }) {
  return (
    <div className="space-y-6">
      <WarningStrip initiatives={initiatives} asOf={asOf} />
      <RhythmAxis initiatives={initiatives} asOf={asOf} onOpen={onOpen} />
      <EventsFeed initiatives={initiatives} onOpen={onOpen} />
    </div>
  );
}
