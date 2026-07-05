// Screen A — the operating rhythm home, in narrative order:
// company goals (does it line up?) → delivery agents (what's off track and
// what's the next move?) → the rhythm axis (the system) → this week's feed
// (the day-to-day). Everything with a colour on this screen is derived.

import { STAGES, goals } from "../data.js";
import {
  signalsFor,
  portfolioSignals,
  recentEvents,
  goalStatus,
  deliveryAgents,
} from "../derive.js";
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

// ---------------------------------------------------------------------------
// Company goals strip — "are we meeting the goals for the quarter and the
// year, and how does it line up?" Status rolls up live from initiative health.
// ---------------------------------------------------------------------------
const GOAL_TONE = {
  red: "border-red/30 bg-red-soft/40",
  amber: "border-amber/30 bg-amber-soft/40",
  green: "border-line bg-white",
  none: "border-dashed border-line bg-white/60",
};

function GoalsStrip({ initiatives, asOf, onOpen }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-mid">
          Company Goals — FY2026 · Q3 cascade
        </h2>
        <span className="text-xs text-mid">
          every initiative exists because a goal needs it — status rolls up live
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map((g) => {
          const gs = goalStatus(g, initiatives, asOf);
          return (
            <div key={g.id} className={`flex flex-col rounded-xl border px-4 py-3 shadow-sm ${GOAL_TONE[gs.status]}`}>
              <div className="flex items-center justify-between">
                <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {g.code}
                </span>
                <HealthBadge health={gs.status === "none" ? "none" : gs.status} />
              </div>
              <h3 className="mt-2 text-sm font-bold leading-snug text-navy">{g.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-mid">{g.fy}</p>
              <p className="mt-1.5 text-xs font-semibold text-teal-deep">Q3: {g.q3}</p>
              <div className="mt-auto flex flex-wrap gap-1 pt-2">
                {gs.linked.map((init) => (
                  <button
                    key={init.id}
                    onClick={() => onOpen(init.id)}
                    className="rounded-full bg-pale-blue px-2 py-0.5 text-[10px] font-semibold text-teal-deep hover:bg-teal hover:text-white"
                  >
                    {init.name.split("—")[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delivery agents — each watches one dimension of the backbone and drafts the
// next move. Rule-based here; in production, scheduled agents draft the
// options. Judgment stays human either way.
// ---------------------------------------------------------------------------
function AgentsStrip({ initiatives, asOf, onOpenCase }) {
  const agents = deliveryAgents(initiatives, asOf);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-mid">Delivery Agents</h2>
        <span className="text-xs text-mid">
          each one watches the backbone and drafts the next move — judgment stays human
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {agents.map((a) => (
          <div
            key={a.name}
            className={`rounded-xl border px-4 py-3 shadow-sm ${
              a.flagged ? "border-amber/40 bg-amber-soft/30" : "border-line bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-navy">
                <span
                  className={`h-2 w-2 rounded-full ${a.flagged ? "bg-amber" : "bg-green"}`}
                  aria-hidden
                />
                {a.name}
              </h3>
              <span className="text-[11px] text-mid">watches {a.watches}</span>
            </div>
            <p className={`mt-1.5 text-sm font-semibold ${a.flagged ? "text-amber" : "text-green"}`}>
              {a.finding}
            </p>
            {a.recommendation && (
              <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-navy-2">
                <span className="font-bold text-teal-deep">→ drafted move:</span> {a.recommendation}
              </p>
            )}
            {a.name === "Blocker Agent" && (
              <button
                onClick={onOpenCase}
                className="mt-2 flex w-full items-center justify-between rounded-lg border border-teal/40 bg-pale-blue/50 px-3 py-1.5 text-xs font-semibold text-teal-deep transition hover:bg-teal hover:text-white"
              >
                <span>📁 Case file: Project ABC180 — why this agent exists</span>
                <span aria-hidden>→</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

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
  const p = portfolioSignals(initiatives, asOf);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-mid">Operating Rhythm</h2>
        <span className="text-xs text-mid">
          {p.atRisk.length} of {p.active.length} active initiatives at risk · every initiative moves
          left → right through the same gates
        </span>
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

export default function Portfolio({ initiatives, asOf, onOpen, onOpenCase }) {
  return (
    <div className="space-y-6">
      <GoalsStrip initiatives={initiatives} asOf={asOf} onOpen={onOpen} />
      <AgentsStrip initiatives={initiatives} asOf={asOf} onOpenCase={onOpenCase} />
      <RhythmAxis initiatives={initiatives} asOf={asOf} onOpen={onOpen} />
      <EventsFeed initiatives={initiatives} onOpen={onOpen} />
    </div>
  );
}
