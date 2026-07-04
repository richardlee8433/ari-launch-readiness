// Screen B — one initiative, read through the remaining lenses:
// charter · readiness gate · decisions & blockers · post-launch loop.

import { useState } from "react";
import { STAGES, goals } from "../data.js";
import { signalsFor, daysBetween } from "../derive.js";
import { StatusChip, HealthBadge, Panel, SectionLabel, CountBadge } from "./ui.jsx";

const TABS = ["Charter", "Readiness Gate", "Decisions & Blockers", "Post-Launch"];

function stageLabel(key) {
  return STAGES.find((s) => s.key === key)?.label || key;
}

// ---------------------------------------------------------------------------

function CharterTab({ init }) {
  const c = init.charter;
  const isPlanning = init.stage === "planning";
  return (
    <div className="space-y-4">
      <Panel title="Problem" accent="bg-navy">
        <p className="text-sm leading-relaxed text-navy-2">{c.problem}</p>
        {isPlanning && (
          <p className="mt-3 rounded-lg bg-pale-blue px-3 py-2 text-xs text-teal-deep">
            Draft charter — scope, owner, milestones and risks are confirmed at the planning
            review before this initiative can enter Kickoff. Nothing enters the rhythm half-defined.
          </p>
        )}
      </Panel>

      {(c.scope.length > 0 || c.outOfScope.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel title="In Scope" accent="bg-teal">
            <ul className="space-y-1.5 text-sm leading-relaxed text-navy-2">
              {c.scope.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-teal">▸</span>
                  {s}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Out of Scope" accent="bg-mid">
            <ul className="space-y-1.5 text-sm leading-relaxed text-mid">
              {c.outOfScope.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span>✕</span>
                  {s}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {c.milestones.length > 0 && (
        <Panel title="Milestones" accent="bg-teal">
          <ul className="space-y-2">
            {c.milestones.map((m, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span aria-hidden>{m.done ? "✅" : "◻️"}</span>
                <span className={`flex-1 ${m.done ? "text-mid line-through" : "font-medium text-navy-2"}`}>
                  {m.label}
                </span>
                <span className="text-xs font-semibold text-mid">{m.due}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {c.risks.length > 0 && (
        <Panel title="Risks" accent="bg-red">
          <ul className="space-y-3">
            {c.risks.map((r, i) => (
              <li key={i} className="rounded-xl border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-navy">{r.risk}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      r.severity === "High" ? "bg-red-soft text-red" : "bg-amber-soft text-amber"
                    }`}
                  >
                    {r.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-mid">
                  <span className="font-semibold">Mitigation:</span> {r.mitigation}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {init.dependencies.length > 0 && (
        <Panel title="Dependencies" accent="bg-amber">
          <ul className="space-y-2.5">
            {init.dependencies.map((d, i) => (
              <li key={i} className="rounded-xl border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-navy">{d.on}</p>
                  <StatusChip statusKey={d.status} />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-mid">{d.why}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ReadinessTab({ init, signals }) {
  if (!init.readiness.length) {
    return (
      <EmptyLens text="The readiness checklist opens at Kickoff, when each function commits its definition of ready. In Plan, there is nothing to check yet — by design." />
    );
  }
  const r = signals.readiness;
  const blocked = init.readiness.filter((i) => i.status === "blocked");
  const verdict =
    blocked.length > 0
      ? { label: "HOLD", cls: "bg-red-soft text-red", note: `${blocked.length} blocked item(s) gate this launch` }
      : r.pct >= 90
        ? { label: "GO — pending final checks", cls: "bg-green-soft text-green", note: `${r.ready}/${r.total} ready` }
        : { label: "NOT READY", cls: "bg-amber-soft text-amber", note: `${r.ready}/${r.total} ready` };

  const byFn = init.readiness.reduce((acc, item) => {
    (acc[item.fn] = acc[item.fn] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 shadow-sm">
        <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${verdict.cls}`}>
          Gate verdict: {verdict.label}
        </span>
        <span className="text-sm text-mid">{verdict.note}</span>
        <span className="ml-auto text-sm font-semibold text-navy">
          {r.pct}% ready
          {signals.daysToLaunch != null && <span className="text-mid"> · {signals.daysToLaunch}d to launch</span>}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(byFn).map(([fn, items]) => (
          <div key={fn} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <SectionLabel>{fn}</SectionLabel>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-2 text-sm">
                  <span className="leading-snug text-navy-2">{item.item}</span>
                  <StatusChip statusKey={item.status} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-mid">
        “Ready to ship” here means the <span className="font-semibold text-navy-2">organization</span> is
        ready — pricing, positioning, onboarding, support workflows and internal knowledge — not that
        engineering is done. Engineering-done is one row, not the definition.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function DecisionsTab({ init, asOf }) {
  const open = init.decisions.filter((d) => d.status === "open");
  const blockers = init.blockers.filter((b) => !b.resolved);

  if (!open.length && !blockers.length) {
    return (
      <EmptyLens
        text={
          init.stage === "planning"
            ? "The decision log opens at Kickoff. Planning-review outcomes are its first entries."
            : "No open decisions or blockers. The log stays — resolved items keep their history."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Open Decisions"
        accent="bg-teal"
        right={<CountBadge>{open.length}</CountBadge>}
      >
        <ul className="space-y-2.5">
          {open.map((d, i) => {
            const overdue = daysBetween(d.due, asOf);
            return (
              <li key={i} className={`rounded-xl border p-3.5 ${overdue > 0 ? "border-red/40 bg-red-soft/30" : "border-line"}`}>
                <p className="text-sm font-medium leading-relaxed text-navy-2">{d.q}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mid">
                  <span>
                    Owner: <span className="font-semibold text-navy">{d.owner}</span>
                  </span>
                  <span>Raised: {d.raised}</span>
                  <span>
                    Due: <span className={overdue > 0 ? "font-bold text-red" : "font-semibold text-navy"}>{d.due}</span>
                  </span>
                  {overdue > 0 && (
                    <span className="rounded-full bg-red px-2 py-0.5 font-bold text-white">
                      {overdue}d overdue → escalated
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-mid">
          Every decision has one owner and one due date. Past-due decisions escalate automatically —
          they don't wait for someone to notice.
        </p>
      </Panel>

      <Panel title="Blockers" accent="bg-red" right={<CountBadge>{blockers.length}</CountBadge>}>
        {blockers.length === 0 ? (
          <p className="text-sm text-mid">No open blockers.</p>
        ) : (
          <ul className="space-y-2.5">
            {blockers.map((b, i) => (
              <li key={i} className="rounded-xl border border-line bg-amber-soft/30 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-relaxed text-navy-2">{b.what}</p>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-red">
                    {daysBetween(b.raised, asOf)}d
                  </span>
                </div>
                <div className="mt-2 space-y-0.5 text-xs text-mid">
                  <div>
                    <span className="font-semibold">Waiting on:</span> {b.waitingOn}
                  </div>
                  <div>
                    <span className="font-semibold">Raised:</span> {b.raised}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {init.scopeChanges.length > 0 && (
        <Panel title="Scope Changes" accent="bg-lime" right={<CountBadge>{init.scopeChanges.length}</CountBadge>}>
          <ul className="space-y-2">
            {init.scopeChanges.map((sc, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 text-xs font-semibold text-mid">{sc.date}</span>
                <span className="flex-1 leading-snug text-navy-2">{sc.change}</span>
                <span className={`shrink-0 text-xs font-bold ${sc.approved ? "text-green" : "text-amber"}`}>
                  {sc.approved ? "approved" : "pending"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function PostLaunchTab({ init }) {
  const pl = init.postLaunch;
  if (!pl) {
    return (
      <EmptyLens text="This lens opens at Launch. The 30/60/90 reviews measure whether the product was actually absorbed — adoption vs. target, onboarding friction, and what feeds back into the roadmap. Launching is the midpoint of an initiative here, not the end." />
    );
  }
  const pctOfTarget = Math.round((pl.adoptionActual / pl.adoptionTarget) * 100);
  return (
    <div className="space-y-4">
      <Panel title="Adoption vs Target" accent="bg-teal">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-navy">{pl.adoptionMetric}</span>
          <span className="text-mid">
            measured at {pl.measuredAt} · target by {pl.adoptionTargetBy}
          </span>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-line">
          <div className="relative h-full">
            <div
              className={`h-full rounded-full ${pctOfTarget < 80 ? "bg-amber" : "bg-teal"}`}
              style={{ width: `${Math.min(pl.adoptionActual, 100)}%` }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-navy"
              style={{ left: `${pl.adoptionTarget}%` }}
              title={`target ${pl.adoptionTarget}%`}
            />
          </div>
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="font-bold text-navy">{pl.adoptionActual}% actual</span>
          <span className="font-semibold text-mid">{pl.adoptionTarget}% target ▸</span>
        </div>
      </Panel>

      {pl.reviews.map((rev) =>
        rev.held ? (
          <Panel key={rev.day} title={`Day-${rev.day} Review — held ${rev.held}`} accent="bg-green">
            <SectionLabel>Findings</SectionLabel>
            <ul className="mb-4 space-y-1.5 text-sm leading-relaxed text-navy-2">
              {rev.findings.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-teal">▸</span>
                  {f}
                </li>
              ))}
            </ul>
            <SectionLabel>Actions — fed back into the system</SectionLabel>
            <ul className="space-y-2">
              {rev.actions.map((a, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-3 text-sm">
                  <span className="flex-1 font-medium text-navy-2">{a.what}</span>
                  <span className="text-xs text-mid">
                    {a.owner} · due {a.due}
                  </span>
                  <span className="rounded-full bg-pale-lime px-2 py-0.5 text-xs font-bold text-navy">
                    → {a.fedInto}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : (
          <div key={rev.day} className="rounded-2xl border border-dashed border-line bg-white/60 px-5 py-3 text-sm text-mid">
            Day-{rev.day} review scheduled — {rev.scheduled}
          </div>
        )
      )}
    </div>
  );
}

function EmptyLens({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-8 text-center">
      <p className="mx-auto max-w-xl text-sm leading-relaxed text-mid">{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function Cockpit({ init, asOf, onBack, initialTab }) {
  const [tab, setTab] = useState(initialTab || TABS[0]);
  const signals = signalsFor(init, asOf);

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-sm font-semibold text-teal hover:underline">
        ← All initiatives
      </button>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy">{init.name}</h1>
            <p className="mt-1 text-sm text-mid">
              {init.owner} · stage: <span className="font-semibold text-navy">{stageLabel(init.stage)}</span>
              {init.targetLaunch && init.stage !== "post_launch" && (
                <span> · launch {init.targetLaunch}</span>
              )}
              {init.launchedOn && <span> · launched {init.launchedOn}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {goals
              .filter((g) => g.initiatives.includes(init.id))
              .map((g) => (
                <span
                  key={g.id}
                  title={`${g.name} — ${g.fy}`}
                  className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold text-white"
                >
                  {g.code}
                </span>
              ))}
            <HealthBadge health={signals.health} />
          </div>
        </div>
        {signals.reasons.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-line pt-3">
            {signals.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-mid">
                <span className="text-amber">⚠</span>
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
              tab === t ? "bg-navy text-white" : "text-mid hover:bg-pale-blue hover:text-navy"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Charter" && <CharterTab init={init} />}
      {tab === "Readiness Gate" && <ReadinessTab init={init} signals={signals} />}
      {tab === "Decisions & Blockers" && <DecisionsTab init={init} asOf={asOf} />}
      {tab === "Post-Launch" && <PostLaunchTab init={init} />}
    </div>
  );
}
