// ============================================================================
// Derived signals — the early-warning layer.
//
// Nothing in this file is hand-set. Every number the dashboard shows as a
// "signal" (readiness %, decision aging, blocker age, pace vs. launch date,
// health) is computed from the initiative data. That's the point: leading
// indicators are derived from the same backbone everyone already maintains,
// not a second reporting system someone has to feed.
// ============================================================================

export const dayMs = 86400000;

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / dayMs);
}

// Readiness score: ready = 1, in progress = 0.5, blocked/not started = 0.
export function readinessScore(items) {
  if (!items || items.length === 0) return null;
  const ready = items.filter((i) => i.status === "ready").length;
  const inProgress = items.filter((i) => i.status === "in_progress").length;
  const blocked = items.filter((i) => i.status === "blocked").length;
  const pct = Math.round(((ready + 0.5 * inProgress) / items.length) * 100);
  return { ready, inProgress, blocked, total: items.length, pct };
}

// Pace line: how ready an initiative should be, given days to launch.
// (Simple stepwise benchmark — the shape matters more than the numbers.)
export function expectedReadinessPct(daysToLaunch) {
  if (daysToLaunch == null) return null;
  if (daysToLaunch >= 42) return 40;
  if (daysToLaunch >= 28) return 50;
  if (daysToLaunch >= 21) return 60;
  if (daysToLaunch >= 14) return 70;
  if (daysToLaunch >= 7) return 85;
  return 95;
}

// Full signal set for one initiative.
export function signalsFor(init, asOf) {
  const s = {
    daysToLaunch: null,
    readiness: readinessScore(init.readiness),
    openDecisions: [],
    pastDueDecisions: [],
    openBlockers: [],
    oldestBlockerDays: 0,
    paceGap: null, // expected − actual readiness pct (positive = behind)
    adoptionGap: null,
    reasons: [],
    health: "none",
  };

  if (init.targetLaunch && init.stage !== "post_launch") {
    s.daysToLaunch = daysBetween(asOf, init.targetLaunch);
  }

  s.openDecisions = (init.decisions || []).filter((d) => d.status === "open");
  s.pastDueDecisions = s.openDecisions.filter((d) => daysBetween(d.due, asOf) > 0);

  s.openBlockers = (init.blockers || []).filter((b) => !b.resolved);
  s.oldestBlockerDays = s.openBlockers.reduce(
    (max, b) => Math.max(max, daysBetween(b.raised, asOf)),
    0
  );

  const expected = expectedReadinessPct(s.daysToLaunch);
  if (expected != null && s.readiness) {
    s.paceGap = expected - s.readiness.pct;
  }

  if (init.postLaunch) {
    s.adoptionGap = init.postLaunch.adoptionTarget - init.postLaunch.adoptionActual;
  }

  // Health score — explainable, rule-based.
  let score = 0;
  for (const d of s.pastDueDecisions) {
    score += 2;
    s.reasons.push(`Decision past due ${daysBetween(d.due, asOf)}d: “${d.q}” (${d.owner})`);
  }
  if (s.oldestBlockerDays >= 7) {
    score += 2;
    s.reasons.push(`Blocker open ${s.oldestBlockerDays}d — waiting on ${s.openBlockers[0].waitingOn.split("—")[0].trim()}`);
  } else if (s.openBlockers.length > 0) {
    score += 1;
    s.reasons.push(`${s.openBlockers.length} open blocker(s)`);
  }
  if (s.paceGap != null && s.paceGap >= 20) {
    score += 2;
    s.reasons.push(`Readiness ${s.readiness.pct}% vs ${s.paceGap + s.readiness.pct}% pace line at ${s.daysToLaunch}d out`);
  } else if (s.paceGap != null && s.paceGap >= 8) {
    score += 1;
    s.reasons.push(`Readiness ${s.readiness.pct}% — ${s.paceGap} pts below pace at ${s.daysToLaunch}d out`);
  }
  if (s.adoptionGap != null && init.postLaunch.adoptionActual < init.postLaunch.adoptionTarget * 0.8) {
    score += 2;
    s.reasons.push(
      `Adoption ${init.postLaunch.adoptionActual}% at ${init.postLaunch.measuredAt} vs ${init.postLaunch.adoptionTarget}% target by ${init.postLaunch.adoptionTargetBy}`
    );
  }

  if (init.stage === "planning") s.health = "none";
  else if (score >= 4) s.health = "red";
  else if (score >= 1) s.health = "amber";
  else s.health = "green";

  return s;
}

// Portfolio-level early warnings for the home screen.
export function portfolioSignals(inits, asOf) {
  const all = inits.map((i) => ({ init: i, s: signalsFor(i, asOf) }));
  const active = all.filter(({ init }) => init.stage !== "planning");

  const atRisk = active.filter(({ s }) => s.health === "red" || s.health === "amber");
  const decisionDebt = all.flatMap(({ init, s }) =>
    s.pastDueDecisions.map((d) => ({ init, d, overdue: daysBetween(d.due, asOf) }))
  );
  const openDecisions = all.reduce((n, { s }) => n + s.openDecisions.length, 0);
  const oldestBlocker = all.reduce(
    (top, { init, s }) =>
      s.oldestBlockerDays > (top?.days || 0) ? { init, days: s.oldestBlockerDays } : top,
    null
  );
  const paceWarnings = all.filter(({ s }) => s.paceGap != null && s.paceGap >= 8);

  return { all, active, atRisk, decisionDebt, openDecisions, oldestBlocker, paceWarnings };
}

// Goal roll-up: a goal's status is the worst health among its active linked
// initiatives. Nothing to type — if Atlas goes red, G1 and G4 go red with it.
export function goalStatus(goal, inits, asOf) {
  const linked = goal.initiatives
    .map((id) => inits.find((i) => i.id === id))
    .filter(Boolean);
  const active = linked.filter((i) => i.stage !== "planning");
  const healths = active.map((i) => signalsFor(i, asOf).health);
  const status = healths.includes("red")
    ? "red"
    : healths.includes("amber")
      ? "amber"
      : active.length
        ? "green"
        : "none";
  return { linked, active, status };
}

// ---------------------------------------------------------------------------
// Delivery agents — the same derived signals, framed as what they are in
// operation: small watchers over the backbone. Each one states what it
// watches, what it found, and a drafted next move (re-scope / re-estimate /
// escalate / reset expectations). Rule-based here; in production these run on
// a schedule with an LLM drafting the options — judgment stays human.
// ---------------------------------------------------------------------------
export function deliveryAgents(inits, asOf) {
  const all = inits.map((i) => ({ init: i, s: signalsFor(i, asOf) }));
  const short = (i) => i.name.split("—")[0].trim();

  // Pace Agent — readiness % vs. the pace line on upcoming launches.
  const launches = all.filter(({ s }) => s.daysToLaunch != null && s.readiness);
  const belowPace = launches.filter(({ s }) => s.paceGap != null && s.paceGap >= 8);
  const paceRec = belowPace
    .map(({ init, s }) => {
      const lastScope = init.scopeChanges?.[init.scopeChanges.length - 1];
      const cut = lastScope
        ? ` Newest scope addition (“${lastScope.change.split("(")[0].trim()}”) is the re-scope candidate.`
        : "";
      return `${short(init)}: ${s.readiness.pct}% ready with ${s.daysToLaunch}d left — re-scope or re-estimate now and reset GTM expectations this week, not at the gate.${cut}`;
    })
    .join(" ");
  const agents = [
    {
      name: "Pace Agent",
      watches: launches.length
        ? `readiness vs. launch date on ${launches.length} upcoming launches`
        : "readiness vs. launch date",
      flagged: belowPace.length > 0,
      finding: belowPace.length
        ? `${belowPace.length} launch below the pace line`
        : launches.length
          ? "all launches tracking the pace line"
          : "nothing to watch — no initiative carries a launch date",
      recommendation: belowPace.length ? paceRec : null,
    },
  ];

  // Decision Agent — every open decision has an owner and a due date.
  const openDecisions = all.flatMap(({ init, s }) =>
    s.openDecisions.map((d) => ({ init, d, overdue: daysBetween(d.due, asOf) }))
  );
  const overdue = openDecisions.filter((x) => x.overdue > 0);
  agents.push({
    name: "Decision Agent",
    watches: `${openDecisions.length} open decisions, each with one owner and one due date`,
    flagged: overdue.length > 0,
    finding: overdue.length
      ? `${overdue.length} past due — oldest ${Math.max(...overdue.map((x) => x.overdue))}d`
      : "all decisions within due",
    recommendation: overdue.length
      ? overdue
          .map(
            (x) =>
              `“${x.d.q}” (${x.d.owner}) is ${x.overdue}d overdue and gates downstream prep — escalate at today's exec sync with a 48h decide-by.`
          )
          .join(" ")
      : null,
  });

  // Blocker Agent — blocker age against a 7-day unblock SLA.
  const SLA = 7;
  const openBlockers = all.flatMap(({ init, s }) =>
    s.openBlockers.map((b) => ({ init, b, days: daysBetween(b.raised, asOf) }))
  );
  const overSla = openBlockers.filter((x) => x.days > SLA);
  // recommend against the OLDEST over-SLA blocker, not the first in data order
  const worstBlocker = overSla.reduce((a, b) => (b.days > (a?.days || 0) ? b : a), null);
  agents.push({
    name: "Blocker Agent",
    watches: `${openBlockers.length} open blockers against a ${SLA}d unblock SLA`,
    flagged: overSla.length > 0,
    finding: overSla.length
      ? `${overSla.length} over SLA — oldest ${worstBlocker.days}d`
      : "no blocker over SLA",
    recommendation: worstBlocker
      ? `${short(worstBlocker.init)}: waiting on ${worstBlocker.b.waitingOn.split("—")[0].trim()} for ${worstBlocker.days}d — book a working session between the two owners this week; it won't clear itself in the weekly.`
      : null,
  });

  // Adoption Agent — post-launch absorption vs. target.
  const launched = all.filter(({ init }) => init.postLaunch);
  const behind = launched.filter(
    ({ init }) => init.postLaunch.adoptionActual < init.postLaunch.adoptionTarget * 0.8
  );
  agents.push({
    name: "Adoption Agent",
    watches: `${launched.length} launched initiative through 30/60/90 absorption`,
    flagged: behind.length > 0,
    finding: behind.length
      ? behind
          .map(
            ({ init }) =>
              `${short(init)}: ${init.postLaunch.adoptionActual}% at ${init.postLaunch.measuredAt} vs ${init.postLaunch.adoptionTarget}% by ${init.postLaunch.adoptionTargetBy}`
          )
          .join(" · ")
      : "adoption tracking target",
    recommendation: behind.length
      ? behind
          .map(({ init, s }) => {
            const lever = s.openDecisions[0];
            return `Re-forecast day-60 for ${short(init)} now${lever ? ` — the open “${lever.q.split("?")[0]}” decision (due ${lever.due}) is the lever` : ""}.`;
          })
          .join(" ")
      : null,
  });

  return agents;
}

// Merged event feed, newest first.
export function recentEvents(inits, limit = 8) {
  return inits
    .flatMap((i) => (i.events || []).map((e) => ({ ...e, initiative: i })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}
