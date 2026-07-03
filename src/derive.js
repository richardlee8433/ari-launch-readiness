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

// Merged event feed, newest first.
export function recentEvents(inits, limit = 8) {
  return inits
    .flatMap((i) => (i.events || []).map((e) => ({ ...e, initiative: i })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}
