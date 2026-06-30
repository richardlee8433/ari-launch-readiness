// All content below is derived from PRD_Ari_Launch_Readiness.md (v1, 2026-06-30),
// which was itself built from public information (adherent.com, the agentic AI
// platform GA press release, public exec bios, C2P listings). Nothing here is
// internal or confidential. Statuses/dates are illustrative to demonstrate how
// the FR-1 tracker behaves, not a claim about Adherent's real internal state.

export const meta = {
  project: "Ari GA Launch Readiness",
  subtitle: "Cross-Functional Readiness Tracker — FR-1",
  asOf: "2026-06-30",
  cadence: "Reviewed weekly · Engineering · Support · CS · GTM — no proxy attendance",
};

// 🔴 Not Started / 🟡 In Progress / 🚧 Blocked / ✅ Ready
export const STATUS = {
  not_started: { key: "not_started", label: "Not Started", icon: "🔴", chip: "bg-line text-mid" },
  in_progress: { key: "in_progress", label: "In Progress", icon: "🟡", chip: "bg-pale-lime text-navy" },
  blocked:     { key: "blocked",     label: "Blocked",     icon: "🚧", chip: "bg-[#FBE3D6] text-[#9A3C12]" },
  ready:       { key: "ready",       label: "Ready",       icon: "✅", chip: "bg-teal/15 text-teal-deep" },
};

// 6 workstreams — one row per PRD "Scope: Readiness Workstreams" entry.
export const workstreams = [
  {
    id: "ws-handoff",
    name: "Human-handoff / override behavior definition",
    fn: "Engineering",
    status: "in_progress",
    fr: "FR-2",
    risk: "Gates everything downstream — until Engineering defines when Ari escalates vs. acts alone, Support, CS and GTM are each guessing at the same behavior.",
    detail: {
      ready: "Documented, Engineering-signed conditions for when Ari escalates to a human reviewer vs. acts autonomously — the single source of truth the other three functions build from.",
      now: "Drafting the escalation-condition matrix. Not yet signed, so it cannot be referenced by Support (FR-3) or GTM (FR-4) language yet.",
      gates: ["FR-3 Support Escalation Playbook", "FR-4 Regulatory Accuracy Gate"],
      story: "US-2 — Support wants an Engineering-confirmed handoff definition before the first wrong-flag escalation, not after.",
    },
  },
  {
    id: "ws-support",
    name: "Support escalation playbook",
    fn: "Support",
    status: "blocked",
    fr: "FR-3",
    risk: "Front line for “Ari got it wrong.” The first 30 days of triage quality will set customer confidence in the product more than uptime will.",
    detail: {
      ready: "A playbook covering: customer reports questionable Ari output → escalation path to a compliance SME → approved customer-communication template.",
      now: "Cannot start in earnest — by design it is built only after the FR-2 handoff definition is confirmed. Outline exists; substance is waiting on Engineering.",
      blockedBy: "ws-handoff",
      story: "US-2 — “so my team can build a triage playbook before the first wrong-flag escalation.”",
    },
  },
  {
    id: "ws-cs",
    name: "CS onboarding & account health definition",
    fn: "Customer Success",
    status: "not_started",
    fr: null,
    risk: "No precedent exists for what a “healthy” Ari account looks like 30 days in — CS has no baseline to intervene against.",
    detail: {
      ready: "A defined picture of a healthy Ari account at day 30 + an onboarding path, resolved against Open Question #3 (dedicated playbook vs. folded into existing onboarding).",
      now: "Not started. Sequencing decision (Q#3) still open, so scope is undefined.",
      story: "US-1 — executive sponsor needs account-health signal to make the wave-2 go/no-go call on real information.",
    },
  },
  {
    id: "ws-gtm",
    name: "Sales/partner positioning vs. generic AI compliance tools",
    fn: "GTM",
    status: "blocked",
    fr: null,
    risk: "300+ existing accounts will ask “why trust this?” Wrong framing oversells autonomy — a brand event in a regulated market, not a messaging tweak.",
    detail: {
      ready: "Positioning language for Ari that has been checked against what the product actually does autonomously, and cleared by the FR-4 regulatory gate.",
      now: "Held. “Autonomous” language cannot be finalized until Legal/Compliance clears the FR-4 accuracy gate — no informal workaround.",
      blockedBy: "ws-reg",
      story: "US-3 — GTM wants positioning checked against reality “so I'm not promising more than Engineering and Legal will stand behind.”",
    },
  },
  {
    id: "ws-reg",
    name: "Regulatory accuracy review (Legal/Compliance SME sign-off)",
    fn: "Legal/Compliance",
    status: "in_progress",
    fr: "FR-4",
    risk: "Binary gate on all external “autonomous” language. One bad autonomous call in a regulated industry is a brand event, not a bug ticket.",
    detail: {
      ready: "Legal/Compliance SME reviews a defined sample of Ari's autonomous decisions from the first 30 days live; result approves or holds “autonomous” marketing language.",
      now: "Sample collection underway against the live wave-1 cohort. Approve/hold decision pending — and it gates GTM positioning (FR-4 → ws-gtm).",
      gates: ["GTM positioning (ws-gtm)"],
      story: "US-1 — feeds the executive go/no-go for wave 2 with real accuracy data, not assumptions.",
    },
  },
  {
    id: "ws-rhythm",
    name: "Joint delivery rhythm for unified Engineering org",
    fn: "Engineering leadership",
    status: "in_progress",
    fr: "FR-5",
    risk: "9 AI engineers + 20 SWEs are merging mid-launch. Two incompatible delivery cadences can't carry a launch that needs a predictable release rhythm.",
    detail: {
      ready: "One estimation + planning method that works for both AI-eng (model-eval, experiment cycles) and SWE (story points, sprints) — not two parallel systems pretending to be one.",
      now: "Reconciling estimation units across the two groups (Open Question #4). Tracked as its own readiness item rather than assumed to be working.",
      story: "US-1 — gives Engineering leadership one place to see whether the AI-eng/SWE unification is actually working.",
    },
  },
];

// Blockers panel — every 🚧 item, with blocker / waiting-on / date-raised (FR-1 rule).
export const blockers = [
  {
    wsId: "ws-support",
    blocker: "Support escalation playbook can't be authored — its triage steps depend on the FR-2 human-handoff definition, which is unsigned.",
    waitingOn: "Engineering — sign-off on the handoff/override condition matrix (FR-2).",
    raised: "2026-06-16",
  },
  {
    wsId: "ws-gtm",
    blocker: "GTM can't finalize “autonomous” positioning language — it would oversell behavior Legal hasn't yet cleared.",
    waitingOn: "Legal/Compliance — FR-4 accuracy gate decision on the first-30-day sample.",
    raised: "2026-06-23",
  },
];

// Needs Decision panel — PRD "Open Questions" table.
export const decisions = [
  {
    n: 1,
    q: "Is Ari access opt-in or default-on for wave 1 existing C2P accounts?",
    owner: "VP Engineering / CPO",
    priority: "High",
  },
  {
    n: 2,
    q: "What's the rollback or pause threshold if the 30-day accuracy review finds a material issue?",
    owner: "Engineering + Legal",
    priority: "High",
  },
  {
    n: 3,
    q: "Does CS get a dedicated Ari playbook, or fold it into existing onboarding?",
    owner: "CS Lead",
    priority: "Medium",
  },
  {
    n: 4,
    q: "What shared estimation unit reconciles AI-eng and SWE planning?",
    owner: "Engineering leadership",
    priority: "Medium",
  },
];
