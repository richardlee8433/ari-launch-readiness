// ============================================================================
// Project ABC180 — the Blocker Agent's case file.
//
// Reconstructed from a REAL never-launched product the author managed
// (2023–2026): a video-subscription product embedded in a partner platform.
// All partners, companies, people, systems, prices and identifying details
// have been removed or generalized. Dates, durations and the shape of events
// are real — that's the point. This is the case that taught the system its
// blocker-aging tiers and its drift rule.
// ============================================================================

export const CASE = {
  code: "ABC180",
  title: "Project ABC180",
  subtitle:
    "A partner-embedded video subscription product · 2023–2026 · never launched",
  window: { from: "2023-08", to: "2026-07" },
  ownerVacantFrom: "2024-12-13", // programme driver's last day; no successor named
  terminated: "2026-07-03",
  // production-verification blocker crossed the 4x-SLA line on 2024-12-18 —
  // the date a park-or-continue decision was first overdue
  firstParkSignal: "2024-12-18",

  milestones: [
    { ym: "2023-11", label: "Partner expects go-live in weeks — doesn't happen" },
    { ym: "2024-02", label: "Delivery committed for May 2024" },
    { ym: "2024-05", label: "Customer journey declared final" },
    { ym: "2024-10", label: "Security review passed" },
    { ym: "2024-12", label: "Programme driver leaves — no successor" },
    { ym: "2026-03", label: "Force majeure: partner region offline" },
    { ym: "2026-07", label: "Formal termination" },
  ],

  blockers: [
    {
      id: "staging-gateway",
      what: "Staging payment-gateway redirect bug — payment POSTs bounced to a full-page redirect",
      waitingOn: "Partner platform team — backend configuration",
      raised: "2024-08-06",
      resolved: "2024-08-13", // 7 days — the system working as intended
    },
    {
      id: "prod-verification",
      what: "Production flow verification cannot close — partner-side payment-gateway API issue",
      waitingOn: "Partner platform team",
      raised: "2024-11-20",
      resolved: null, // never
    },
    {
      id: "stage-email",
      what: "Stage email API intercepted before reaching partner middleware — partner cannot identify which team owns the failing layer",
      waitingOn: "Partner infrastructure (owner unknown)",
      raised: "2025-01-27",
      resolved: null, // never; thread went silent 2025-06-12
    },
  ],

  events: [
    { date: "2023-08-29", type: "milestone", text: "Phase-1 integration testing begins — token validation, IP whitelisting" },
    { date: "2023-10-05", type: "milestone", text: "Phase-1 free-content flow agreed end-to-end" },
    { date: "2023-11-16", type: "decision", text: "First subscription strategy meeting — partner expects go-live by end of year, six weeks away" },
    { date: "2023-12-15", type: "scope", text: "Partner formally requests the subscription integration" },
    { date: "2024-01-19", type: "decision", text: "Costed at ~121 engineering person-days; pulled forward off the Q3 roadmap — exec flags relationship risk if late" },
    { date: "2024-02-16", type: "milestone", text: "Delivery committed for May — conditional on partner payment-gateway readiness" },
    { date: "2024-03-05", type: "readiness", text: "Design kickoff; user flows approved by programme driver" },
    { date: "2024-04-23", type: "decision", text: "Customer-journey finalization: pricing, one-month free promo, renewal parking period all settled" },
    { date: "2024-05-13", type: "milestone", text: "Partner declares the customer journey final and closed" },
    { date: "2024-08-06", type: "blocker", text: "Staging payment-gateway bug found — payment calls bounce to a redirect" },
    { date: "2024-08-13", type: "readiness", text: "Staging issue resolved by partner backend config change — raised to fixed in 7 days" },
    { date: "2024-10-11", type: "readiness", text: "Partner security review — questions answered same day, approved" },
    { date: "2024-11-15", type: "readiness", text: "Production keys exchanged; content-partner deployment complete" },
    { date: "2024-11-20", type: "blocker", text: "Production flow verification on hold — partner-side payment-gateway API issue" },
    { date: "2024-12-11", type: "milestone", text: "Programme driver announces departure — no successor named for the partnership" },
    { date: "2025-01-27", type: "blocker", text: "Partner email API stops returning valid responses on stage — investigation begins" },
    { date: "2025-02-07", type: "blocker", text: "API returns a firewall rejection page; partner middleware team sees no incoming traffic at all" },
    { date: "2025-03-11", type: "blocker", text: "Content partner's reminder — production testing still can't close — goes unanswered" },
    { date: "2025-03-14", type: "readiness", text: "Analysis: requests are intercepted upstream of partner middleware — WAF/whitelist suspected" },
    { date: "2025-04-29", type: "blocker", text: "Intermittency confirmed: the same setup passes one day and fails five days later" },
    { date: "2025-05-14", type: "blocker", text: "Whitelisting attempted — still failing; partner: “issue is not from our side”" },
    { date: "2025-06-02", type: "readiness", text: "Key finding: the production email API works — the failure is the partner's stage environment only" },
    { date: "2025-06-12", type: "blocker", text: "Partner cannot say which team owns the failing layer. All threads go silent." },
    { date: "2026-03-10", type: "milestone", text: "Force majeure: partner's cloud region permanently offline — the whole service unusable" },
    { date: "2026-04-09", type: "decision", text: "Partner notifies cancellation — accepted" },
    { date: "2026-05-05", type: "review", text: "Routine credential reset completed — operational upkeep still running a month after cancellation" },
    { date: "2026-07-03", type: "decision", text: "Formal termination for convenience — the first documented stop decision in 35 months" },
  ],

  lessons: [
    {
      title: "Severity must scale with age",
      text: "The August 2024 staging bug cleared in 7 days — a working session was the right move, and it worked. The same move applied to a 100-day blocker is denial. This case is why the agent's drafted move escalates to a continue-or-park decision past 4× SLA.",
    },
    {
      title: "The deadliest state isn't blocked — it's silent",
      text: "After June 2025 the strongest signal wasn't either open blocker; it was nine months of zero recorded activity while two blockers stayed open. Blocker tracking can't see that. This case is why the system needs a drift rule: no events + open blockers = an initiative with no driver.",
    },
    {
      title: "Stopping is also a decision",
      text: "A park-or-continue decision was first overdue in December 2024. The documented stop arrived in July 2026 — 19 months later, written by the partner, not by us. No one ever recorded a decision to stop. A decision log with owners and due dates exists precisely so that endings are chosen, not drifted into.",
    },
    {
      title: "Capture is automatable — that's the agentic difference",
      text: "Nobody registered a blocker until August 2024, but the risk was in the mail from November 2023: a six-week go-live expectation next to a list of unresolved payment questions; a commitment standing on three untracked conditions; a farewell email nobody read as a risk event. An extraction agent reading the exhaust proposes these into the backbone; deterministic rules do the ageing and alarming; a human confirms. The system doesn't wait for discipline — it reads.",
    },
  ],
};

// ============================================================================
// The full-system replay layer — a backbone reconstructed FROM the real mail
// archive (16 threads, 2023-08 → 2026-07) by an extraction pass, so all four
// agents can be replayed, not just the Blocker Agent. Methodology:
// signal categories were defined before extraction; every flag cites
// in-month evidence (paraphrased and de-identified); nothing is flagged that
// can't point at text that existed in that month.
// ============================================================================

// Commitments & expectations — the Pace Agent's inputs.
export const commitments = [
  {
    what: "Partner go-live expectation for the subscription",
    type: "expectation",
    set: "2023-11-16",
    due: "2023-12-31",
    met: false,
    resetRecorded: false,
  },
  {
    what: "Committed delivery — May 2024",
    type: "commitment",
    set: "2024-02-16",
    due: "2024-05-31",
    met: false,
    resetRecorded: false,
    conditions: [
      { what: "Partner payment-gateway ready", due: "2024-04-01", confirmed: false },
      { what: "Flows/UI confirmed by partner", due: "2024-04-01", confirmed: true },
      { what: "Content partner integration info provided", due: "2024-04-01", confirmed: true },
    ],
  },
];

// Decisions — the Decision Agent's inputs. One decided fast (the healthy
// contrast), three that aged or were never taken.
export const caseDecisions = [
  {
    q: "Funding model: partner pays for the build vs revenue share",
    owner: "Commercial — never assigned",
    raised: "2024-01-19",
    resolved: null,
  },
  {
    q: "Accelerate the subscription off the Q3 roadmap into phase 1",
    owner: "Product exec",
    raised: "2024-01-23",
    resolved: "2024-01-31", // raised, argued, decided in 8 days — the good one
  },
  {
    q: "Partner legal approval of updated terms",
    owner: "Partner legal — no due date ever set",
    raised: "2024-11-04",
    resolved: null,
  },
  {
    q: "Park or continue this initiative",
    owner: "— never assigned —",
    raised: "2024-12-18", // the date the oldest blocker crossed 4x SLA
    resolved: "2026-07-03",
    resolvedBy: "the partner, by terminating the contract",
  },
];

// Absorption — the Adoption Agent's input. Phase 1 went live in Nov 2023;
// no target was ever set and no usage was ever measured.
export const caseAdoption = {
  phase1Live: "2023-11-02",
  measured: false,
  investment: "The subscription build (~121 engineering person-days) was accelerated in Jan 2024 on partner request alone — with zero recorded phase-1 usage data.",
};

// Exhaust flags — what an extraction agent reading that month's mail would
// have proposed. Every entry paraphrases in-month evidence; de-identified.
export const exhaust = [
  {
    ym: "2023-11",
    flags: [
      { agent: "Pace", text: "Go-live expected in six weeks — while the same meeting minutes leave payment method, transaction tracking and the content list unconfirmed." },
      { agent: "Adoption", text: "Phase 1 went live this month. No thread sets a usage target or asks who is actually watching." },
    ],
  },
  {
    ym: "2023-12",
    flags: [
      { agent: "Pace", text: "The end-of-year go-live expectation lapses unmet. No message records a reset of partner expectations — the date just evaporates." },
    ],
  },
  {
    ym: "2024-01",
    flags: [
      { agent: "Decision", text: "Funding model raised and left hanging: partner wants the build funded in exchange for revenue share — “but provided no data.” No owner, no date." },
      { agent: "Pace", text: "An exec writes that missing early delivery would be a “second fail” with this partner. The relationship risk is now in writing — and in nobody's tracker." },
      { agent: "Decision", text: "Healthy contrast: the roadmap-acceleration question was raised, argued and decided in 8 days. Decisions move fast here when someone owns them." },
    ],
  },
  {
    ym: "2024-02",
    flags: [
      { agent: "Pace", text: "May delivery committed on three external conditions — partner gateway ready before April chief among them. None of the three is tracked as a gate anywhere." },
    ],
  },
  {
    ym: "2024-04",
    flags: [
      { agent: "Pace", text: "The “gateway ready before April” condition passes with no recorded confirmation. The May commitment now stands on an unverified condition." },
    ],
  },
  {
    ym: "2024-05",
    flags: [
      { agent: "Pace", text: "Design declared final — but the committed delivery month ends with no launch and no successor date anywhere in the record. The initiative is now running dateless." },
    ],
  },
  {
    ym: "2024-08",
    flags: [
      { agent: "Blocker", text: "Healthy contrast: a staging payment bug goes raised → root-caused → partner-fixed in 7 days. This pair can move when both sides engage." },
      { agent: "Drift", text: "A progress update bounces for 12 partner recipients (attachments too large) — only the core team receives it. A communication-integrity signal hiding in an automated NDR." },
    ],
  },
  {
    ym: "2024-10",
    flags: [
      { agent: "Decision", text: "A terms-of-use change heads toward partner legal — with no owner-side due date attached. (Security review, by contrast, is answered same-day.)" },
    ],
  },
  {
    ym: "2024-11",
    flags: [
      { agent: "Blocker", text: "Production verification goes on hold over a partner API issue — reported inside a reply, registered nowhere as a blocker." },
    ],
  },
  {
    ym: "2024-12",
    flags: [
      { agent: "Drift", text: "The programme driver's farewell email is in the archive. No thread names a successor for the partnership. An extraction agent reads farewell emails as risk events; humans read them as goodbyes." },
    ],
  },
  {
    ym: "2025-01",
    flags: [
      { agent: "Blocker", text: "The partner's email API stops returning valid responses on stage. Log analysis later dates the last good response to mid-January." },
    ],
  },
  {
    ym: "2025-03",
    flags: [
      { agent: "Drift", text: "The content partner's reminder — production testing still can't close — goes unanswered." },
      { agent: "Decision", text: "The terms-approval question resurfaces after five dormant months. Still no due date." },
    ],
  },
  {
    ym: "2025-05",
    flags: [
      { agent: "Blocker", text: "Partner asserts the “issue is not from our side” while its own middleware logs show nothing arriving. The debugging loop has turned adversarial." },
    ],
  },
  {
    ym: "2025-06",
    flags: [
      { agent: "Blocker", text: "Partner cannot say which internal team owns the failing layer. The remaining blocker is the partner's own test environment — and no thread proposes the obvious decision: waive stage verification, or park. Then everything goes quiet." },
    ],
  },
  {
    ym: "2026-03",
    flags: [
      { agent: "Blocker", text: "Force majeure: the hosting region is offline. Routine renewal requests now bounce off a dead environment." },
    ],
  },
  {
    ym: "2026-04",
    flags: [
      { agent: "Decision", text: "Cancellation notified. A security-closure question is asked — and answered “TBD.”" },
    ],
  },
  {
    ym: "2026-05",
    flags: [
      { agent: "Drift", text: "Credentials are still being rotated a month after cancellation — operational upkeep outliving the product it served." },
    ],
  },
  {
    ym: "2026-07",
    flags: [
      { agent: "Decision", text: "Formal termination — the first documented stop decision in 35 months, written by the partner." },
    ],
  },
];
