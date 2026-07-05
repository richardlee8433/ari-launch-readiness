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
      text: "A park-or-continue decision was first overdue in December 2024. The documented stop arrived in July 2026 — 18 months later, written by the partner, not by us. No one ever recorded a decision to stop. A decision log with owners and due dates exists precisely so that endings are chosen, not drifted into.",
    },
  ],
};
