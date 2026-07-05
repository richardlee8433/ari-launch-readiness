// Project ABC180 — the full Delivery OS replayed against a real never-launch.
// A backbone was reconstructed from the real mail archive by an extraction
// pass (categories defined ex ante; every flag cites in-month evidence);
// the same deterministic rules the live dashboard uses are then replayed
// month by month. Scrub through time: left is what the system would have
// said, right is what actually happened.

import { useState } from "react";
import { CASE, commitments, caseDecisions, caseAdoption, exhaust, draftedMoves } from "../casefile-data.js";
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

// ---- per-month replay (same rules as the live agents) -----------------------
function monthView(ym) {
  const asOf = endOfMonth(ym);
  const flags = []; // { agent, tone: "red"|"amber"|"green", text }

  // PACE — expectations, conditional commitments, dateless running
  for (const c of commitments) {
    if (c.set > asOf) continue;
    // the informal expectation is superseded once the formal commitment exists
    if (c.type === "expectation" && asOf >= "2024-02-16") continue;
    if (c.due > asOf) {
      const unconfirmed = (c.conditions || []).filter((x) => !x.confirmed);
      if (unconfirmed.length) {
        flags.push({
          agent: "Pace",
          tone: "amber",
          text: `“${c.what}” stands on ${unconfirmed.length} untracked external condition(s) — none registered as a gate.`,
        });
      }
      const overdueCond = (c.conditions || []).filter((x) => !x.confirmed && x.due <= asOf);
      for (const oc of overdueCond) {
        flags.push({
          agent: "Pace",
          tone: "red",
          text: `Condition “${oc.what}” was due ${daysBetween(oc.due, asOf)}d ago with no recorded confirmation — the commitment now stands on an unverified condition.`,
        });
      }
    } else if (!c.met && !c.resetRecorded) {
      flags.push({
        agent: "Pace",
        tone: "red",
        text: `“${c.what}” passed ${daysBetween(c.due, asOf)}d ago — not met, and no new date recorded anywhere. The initiative is running dateless.`,
      });
    }
  }

  // DECISION — open decisions age; ownerless ones age louder
  for (const d of caseDecisions) {
    if (d.raised > asOf) continue;
    if (d.resolved && d.resolved <= asOf) {
      if (d.resolved.slice(0, 7) === ym) {
        flags.push({
          agent: "Decision",
          tone: "green",
          text: `Decided${d.resolvedBy ? ` — by ${d.resolvedBy}` : ` in ${daysBetween(d.raised, d.resolved)}d`}: “${d.q}”`,
        });
      }
      continue;
    }
    const age = daysBetween(d.raised, asOf);
    const ownerless = d.owner.includes("never") || d.owner.includes("no due date");
    flags.push({
      agent: "Decision",
      tone: age > 30 || ownerless ? "red" : "amber",
      text: `Open ${age}d: “${d.q}” (${d.owner}).`,
    });
  }

  // BLOCKER — ages and tiers, as on the live dashboard
  for (const b of CASE.blockers) {
    if (b.raised > asOf || (b.resolved && b.resolved <= asOf)) continue;
    const age = daysBetween(b.raised, asOf);
    const tier = age > PARK ? "continue-or-park" : age > SLA ? "working-session" : "within SLA";
    flags.push({
      agent: "Blocker",
      tone: age > PARK ? "red" : age > SLA ? "amber" : "green",
      text: `${age}d · ${tier}: ${b.what.split("—")[0].trim()} (waiting on ${b.waitingOn.split("—")[0].trim()}).`,
    });
  }

  // ADOPTION — live with nothing measured
  if (caseAdoption.phase1Live <= asOf && !caseAdoption.measured && asOf < CASE.terminated) {
    flags.push({
      agent: "Adoption",
      tone: "amber",
      text: `Phase 1 live ${daysBetween(caseAdoption.phase1Live, asOf)}d — no usage target set, nothing measured. ${asOf >= "2024-01-31" ? "The subscription build was accelerated on zero absorption evidence." : ""}`,
    });
  }

  // DRIFT — silence with open items; ownership vacuum
  const past = CASE.events.filter((e) => e.date <= asOf);
  const lastEvent = past.length ? past[past.length - 1].date : null;
  const silenceDays = lastEvent ? daysBetween(lastEvent, asOf) : 0;
  const openBlockers = CASE.blockers.filter((b) => b.raised <= asOf && (!b.resolved || b.resolved > asOf));
  if (silenceDays > 30 && openBlockers.length > 0) {
    flags.push({
      agent: "Drift",
      tone: "red",
      text: `No recorded activity for ${silenceDays}d with ${openBlockers.length} blocker(s) open. This initiative has no driver — name an owner, or park it formally.`,
    });
  }
  if (asOf >= CASE.ownerVacantFrom && asOf < CASE.terminated) {
    flags.push({
      agent: "Drift",
      tone: "amber",
      text: "Programme driver left with no successor named — every open item above is informally owned.",
    });
  }

  const events = CASE.events.filter((e) => e.date.slice(0, 7) === ym);
  const mail = exhaust.find((x) => x.ym === ym)?.flags || [];
  return { asOf, flags, events, mail, silenceDays, openBlockers };
}

const AGENT_TAG = {
  Pace: "bg-pale-blue text-teal-deep",
  Decision: "bg-amber-soft text-amber",
  Blocker: "bg-red-soft text-red",
  Adoption: "bg-pale-lime text-navy",
  Drift: "bg-line text-navy-2",
};
const TONE_DOT = { red: "bg-red", amber: "bg-amber", green: "bg-green" };

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

const SIDE_CHIP = {
  us: { label: "our side", cls: "bg-teal/15 text-teal-deep" },
  partner: { label: "partner side", cls: "bg-amber-soft text-amber" },
  joint: { label: "joint", cls: "bg-navy text-white" },
};

function MovesPanel({ ym }) {
  // latest drafted-move set at or before this month — moves stand until acted on
  const current = [...draftedMoves].reverse().find((d) => d.ym <= ym);
  const standing = current && current.ym !== ym;
  const standingMonths = standing
    ? (Number(ym.slice(0, 4)) - Number(current.ym.slice(0, 4))) * 12 +
      (Number(ym.slice(5)) - Number(current.ym.slice(5)))
    : 0;
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <SectionLabel>The drafted moves — {fmtMonth(ym)}</SectionLabel>
        <span className="text-[11px] text-mid">
          LLM-drafted from that month's flags — every move names an owner; drafting is not deciding
        </span>
      </div>
      {!current ? (
        <p className="text-sm text-mid">Nothing on the table yet.</p>
      ) : (
        <>
          {standing && (
            <div className="mb-2.5 rounded-lg bg-red-soft/50 px-3 py-2 text-xs font-semibold text-red">
              Standing since {fmtMonth(current.ym)} — {standingMonths} month{standingMonths === 1 ? "" : "s"} on
              the table, no action recorded.
            </div>
          )}
          <ul className="space-y-2">
            {current.moves.map((m, i) => (
              <li key={i} className="rounded-xl border border-line p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${AGENT_TAG[m.agent]}`}>
                    {m.agent}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SIDE_CHIP[m.side].cls}`}>
                    {SIDE_CHIP[m.side].label}
                  </span>
                  <span className="text-[11px] font-semibold text-navy">{m.owner}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-navy-2">{m.action}</p>
              </li>
            ))}
          </ul>
        </>
      )}
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
          The whole system, replayed against a real never-launch. A backbone was reconstructed from
          the project's real mail archive by an extraction pass; the same rules the live dashboard
          runs are then replayed month by month. Scrub through time:{" "}
          <span className="font-semibold">left is what the system would have said, right is what
          actually happened.</span>
        </p>
        <p className="mt-2 rounded-lg bg-pale-blue/60 px-3 py-2 text-xs leading-relaxed text-teal-deep">
          An agent reading the mail flags risk in <span className="font-bold">Nov 2023</span> — nine
          months before the first humanly-recorded blocker (Aug 2024) — and the rules force a
          park-or-continue decision by <span className="font-bold">Dec 2024</span>, 19 months before
          the stop actually came, written by the partner.
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
          <SectionLabel>The Delivery OS replay — {fmtMonth(ym)}</SectionLabel>
          {v.flags.length === 0 ? (
            <p className="text-sm text-mid">
              Nothing to flag. The system stays quiet — that's part of the job too.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {v.flags.map((f, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg border border-line/70 px-2.5 py-1.5">
                  <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${AGENT_TAG[f.agent]}`}>
                    {f.agent}
                  </span>
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[f.tone]}`} aria-hidden />
                  <span className="text-xs leading-relaxed text-navy-2">{f.text}</span>
                </li>
              ))}
            </ul>
          )}

          {v.mail.length > 0 && (
            <div className="mt-3 rounded-xl bg-pale-blue/50 p-3">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-deep">
                📨 What the extraction agent read in that month's mail
              </p>
              <ul className="space-y-1.5">
                {v.mail.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-navy-2">
                    <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${AGENT_TAG[m.agent]}`}>
                      {m.agent}
                    </span>
                    <span className="italic">{m.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <SectionLabel>What actually happened — {fmtMonth(ym)}</SectionLabel>
          {v.events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line px-4 py-6 text-center">
              <p className="text-sm font-semibold text-red/80">— no recorded activity —</p>
              <p className="mt-1 text-xs text-mid">
                {v.openBlockers.length > 0
                  ? "Threads silent. Nobody escalated, nobody parked it, nobody wrote anything down."
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

      <MovesPanel ym={ym} />

      {/* lessons */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <SectionLabel>What this case taught the system</SectionLabel>
        <div className="grid gap-4 lg:grid-cols-2">
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
        generalized; dates, durations and the shape of events are real. Method: signal categories
        were defined before extraction, and every flag cites in-month evidence — nothing is flagged
        that can't point at text that existed in that month.
      </p>
    </div>
  );
}
