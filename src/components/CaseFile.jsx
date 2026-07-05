// The Blocker Agent's case file — Project ABC180.
// A month-by-month replay of a real (de-identified) never-launched product:
// scrub through time and compare what the agent would have said each month
// with what actually happened. The agent's aging tiers and the system's
// drift rule were learned from this case.

import { useState } from "react";
import { CASE } from "../casefile-data.js";
import { daysBetween } from "../derive.js";
import { SectionLabel } from "./ui.jsx";

const SLA = 7;
const PARK = SLA * 4;

// ---- month helpers ---------------------------------------------------------
function monthList(from, to) {
  const out = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) (m = 1), y++;
  }
  return out;
}
const endOfMonth = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
};
const fmtMonth = (ym) => {
  const [y, m] = ym.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(m) - 1]} ${y}`;
};

const MONTHS = monthList(CASE.window.from, CASE.window.to);

// ---- per-month derivation (same rules as the live agent) --------------------
function monthView(ym) {
  const asOf = endOfMonth(ym);
  const open = CASE.blockers
    .filter((b) => b.raised <= asOf && (!b.resolved || b.resolved > asOf))
    .map((b) => {
      const age = daysBetween(b.raised, asOf);
      return { ...b, age, tier: age > PARK ? "continue-or-park" : age > SLA ? "working-session" : "within-sla" };
    });
  const past = CASE.events.filter((e) => e.date <= asOf);
  const lastEvent = past.length ? past[past.length - 1].date : null;
  const silenceDays = lastEvent ? daysBetween(lastEvent, asOf) : 0;
  const drift = silenceDays > 30 && open.length > 0;
  const ownerVacant = asOf >= CASE.ownerVacantFrom;
  const events = CASE.events.filter((e) => e.date.slice(0, 7) === ym);
  return { asOf, open, events, silenceDays, drift, ownerVacant };
}

const TIER_STYLE = {
  "within-sla": { chip: "bg-green-soft text-green", label: "within SLA" },
  "working-session": { chip: "bg-amber-soft text-amber", label: "working session" },
  "continue-or-park": { chip: "bg-red-soft text-red", label: "continue-or-park" },
};

const MOVE = {
  "working-session":
    "book a 30-minute working session between the two owners this week; it won't clear itself in the weekly.",
  "continue-or-park":
    "past working-session territory — take a continue-or-park decision to the exec sponsor this week.",
};

// ---- pieces -----------------------------------------------------------------
function Stat({ value, label, tone = "text-navy" }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
      <div className={`text-xl font-bold ${tone}`}>{value}</div>
      <div className="mt-0.5 text-xs leading-snug text-mid">{label}</div>
    </div>
  );
}

function Heartbeat({ ym, setYm }) {
  const max = Math.max(...MONTHS.map((m) => CASE.events.filter((e) => e.date.slice(0, 7) === m).length), 1);
  return (
    <div>
      <div className="flex items-end gap-[3px]">
        {MONTHS.map((m) => {
          const n = CASE.events.filter((e) => e.date.slice(0, 7) === m).length;
          const hasMilestone = CASE.milestones.some((x) => x.ym === m);
          const h = n === 0 ? 3 : 8 + (n / max) * 36;
          return (
            <button
              key={m}
              onClick={() => setYm(m)}
              title={`${fmtMonth(m)} — ${n} event${n === 1 ? "" : "s"}`}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              <span
                className={`block w-full rounded-sm transition ${
                  m === ym ? "bg-teal" : n === 0 ? "bg-red/40" : "bg-navy/25 group-hover:bg-navy/50"
                }`}
                style={{ height: `${h}px` }}
              />
              <span className={`h-1.5 w-1.5 rounded-full ${hasMilestone ? "bg-lime" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-mid">
        <span>{fmtMonth(MONTHS[0])}</span>
        <span className="text-red/70">flat = no recorded activity</span>
        <span>{fmtMonth(MONTHS[MONTHS.length - 1])}</span>
      </div>
    </div>
  );
}

function LifespanChart({ ym }) {
  const start = new Date(`${CASE.window.from}-01`);
  const end = new Date(CASE.terminated);
  const span = end - start;
  const pct = (d) => Math.min(100, Math.max(0, ((new Date(d) - start) / span) * 100));
  const cursor = pct(endOfMonth(ym));
  return (
    <div className="relative space-y-2 rounded-2xl border border-line bg-white p-4 shadow-sm">
      <SectionLabel>Blocker lifespans — raised → resolved (or not)</SectionLabel>
      {CASE.blockers.map((b) => {
        const from = pct(b.raised);
        const to = b.resolved ? pct(b.resolved) : 100;
        const days = daysBetween(b.raised, b.resolved || CASE.terminated);
        return (
          <div key={b.id} className="relative">
            <div className="mb-0.5 flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate font-medium text-navy-2">{b.what.split("—")[0].trim()}</span>
              <span className={`shrink-0 font-bold ${b.resolved ? "text-green" : "text-red"}`}>
                {days}d {b.resolved ? "· resolved" : "· never resolved"}
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-pale-blue">
              <div
                className={`absolute h-3 rounded-full ${b.resolved ? "bg-green/60" : "bg-red/60"}`}
                style={{ left: `${from}%`, width: `${Math.max(to - from, 1)}%` }}
              />
            </div>
          </div>
        );
      })}
      {/* time cursor */}
      <div className="pointer-events-none absolute bottom-3 top-10 w-0.5 bg-teal" style={{ left: `calc(${cursor}% )` }} />
      <p className="pt-1 text-[11px] text-mid">
        Teal line = the month you're viewing. The green bar is what healthy looks like — 7 days,
        because both sides engaged. The red bars are what this page is about.
      </p>
    </div>
  );
}

// ---- main -------------------------------------------------------------------
export default function CaseFile({ onBack }) {
  const [ym, setYm] = useState("2024-12"); // the inflection point
  const v = monthView(ym);
  const idx = MONTHS.indexOf(ym);

  const monthsInFlight = MONTHS.length - 1;
  const silenceMonths = Math.round(daysBetween("2025-06-12", "2026-03-10") / 30);
  const parkToStop = Math.round(daysBetween(CASE.firstParkSignal, CASE.terminated) / 30);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm font-semibold text-teal hover:underline">
        ← Delivery agents
      </button>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="rounded bg-navy px-2 py-0.5 text-xs font-bold text-white">CASE FILE</span>
          <h1 className="text-xl font-bold text-navy">{CASE.title}</h1>
          <span className="text-sm text-mid">{CASE.subtitle}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-navy-2">
          Why does the Blocker Agent escalate with age? Why does the system treat silence as a
          signal? Because of this project. Scrub through the months and compare{" "}
          <span className="font-semibold">what the agent would have said</span> with{" "}
          <span className="font-semibold">what actually happened</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={`${monthsInFlight} months`} label="in flight — never launched" />
        <Stat value="2 blockers" label="never resolved — 590d and 522d old at termination" tone="text-red" />
        <Stat value={`~${silenceMonths} months`} label="of zero recorded activity, with both blockers open" tone="text-red" />
        <Stat value={`${parkToStop} months`} label="from the first park-or-continue signal to the actual stop decision" tone="text-amber" />
      </div>

      {/* scrubber */}
      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Activity heartbeat — click a month, or step through</SectionLabel>
          <div className="flex items-center gap-2">
            <button
              onClick={() => idx > 0 && setYm(MONTHS[idx - 1])}
              className="rounded-lg border border-line px-2.5 py-1 text-sm font-bold text-navy hover:bg-pale-blue"
            >
              ←
            </button>
            <span className="w-24 text-center text-sm font-bold text-navy">{fmtMonth(ym)}</span>
            <button
              onClick={() => idx < MONTHS.length - 1 && setYm(MONTHS[idx + 1])}
              className="rounded-lg border border-line px-2.5 py-1 text-sm font-bold text-navy hover:bg-pale-blue"
            >
              →
            </button>
          </div>
        </div>
        <Heartbeat ym={ym} setYm={setYm} />
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {CASE.milestones.map((m) => (
            <button
              key={m.ym + m.label}
              onClick={() => setYm(m.ym)}
              className={`text-[11px] hover:text-teal ${m.ym === ym ? "font-bold text-teal" : "text-mid"}`}
            >
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-lime align-middle" />
              {fmtMonth(m.ym).slice(0, 3)} {m.ym.slice(0, 4)}: {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* the two columns */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-teal/40 bg-white p-4 shadow-sm">
          <SectionLabel>What the agent would have said — {fmtMonth(ym)}</SectionLabel>
          {v.open.length === 0 && !v.drift && (
            <p className="text-sm text-mid">
              No open blockers. The agent stays quiet — that's part of the job too.
            </p>
          )}
          <ul className="space-y-2.5">
            {v.open.map((b) => (
              <li key={b.id} className="rounded-xl border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug text-navy-2">{b.what.split("—")[0].trim()}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${TIER_STYLE[b.tier].chip}`}>
                    {b.age}d · {TIER_STYLE[b.tier].label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-mid">Waiting on: {b.waitingOn}</p>
                {b.tier !== "within-sla" && (
                  <p className="mt-2 rounded-lg bg-pale-blue/60 px-2.5 py-1.5 text-xs leading-relaxed text-navy-2">
                    <span className="font-bold text-teal-deep">→ drafted move:</span> {MOVE[b.tier]}
                  </p>
                )}
              </li>
            ))}
          </ul>
          {v.drift && (
            <div className="mt-2.5 rounded-xl border border-red/40 bg-red-soft/40 p-3">
              <p className="text-sm font-bold text-red">⚠ Drift alarm</p>
              <p className="mt-1 text-xs leading-relaxed text-navy-2">
                No recorded activity for <span className="font-bold">{v.silenceDays} days</span> with{" "}
                {v.open.length} blocker(s) still open. This initiative has no driver — name an owner
                this week, or park it formally with re-entry criteria.
              </p>
            </div>
          )}
          {v.ownerVacant && (
            <p className="mt-2.5 rounded-lg bg-amber-soft/50 px-3 py-2 text-xs leading-relaxed text-navy-2">
              <span className="font-bold text-amber">Ownership gap:</span> the programme driver left
              in Dec 2024 with no successor named — every open item above is now informally owned.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <SectionLabel>What actually happened — {fmtMonth(ym)}</SectionLabel>
          {v.events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line px-4 py-6 text-center">
              <p className="text-sm font-semibold text-red/80">— no recorded activity —</p>
              <p className="mt-1 text-xs text-mid">
                {v.open.length > 0
                  ? "Both threads silent. Nobody escalated, nobody parked it, nobody wrote anything down."
                  : "Quiet month."}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {v.events.map((e, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="w-12 shrink-0 pt-0.5 text-xs font-semibold text-mid">{e.date.slice(5)}</span>
                  <span className="leading-snug text-navy-2">{e.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <LifespanChart ym={ym} />

      {/* lessons */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <SectionLabel>What this case taught the system</SectionLabel>
        <div className="grid gap-4 lg:grid-cols-3">
          {CASE.lessons.map((l, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-navy">
                {i + 1}. {l.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-navy-2">{l.text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-mid">
        Reconstructed from a real never-launched product the author managed (2023–2026). All
        partners, companies, people, systems and identifying details have been removed or
        generalized; dates, durations and the shape of events are real. Shown as the case that
        taught this system its blocker-aging tiers and its drift rule.
      </p>
    </div>
  );
}
