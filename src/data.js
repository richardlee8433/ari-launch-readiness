// ============================================================================
// Clearline Delivery OS — data backbone.
//
// Clearline is a FICTIONAL B2B product-compliance SaaS company (mature core
// platform, 250+ enterprise customers, now shipping its first net-new AI
// products). All initiatives, people, dates and metrics below are invented to
// demonstrate how a cross-functional delivery operating system behaves. No
// real company's internal data appears here.
//
// Design principle: ONE data object — the Initiative — read through six
// lenses: charter, rhythm stage, launch readiness, decisions & blockers,
// derived early-warning signals, and the post-launch learning loop. The
// schema itself is the "standardized initiative framework": every initiative
// carries the same fields, so nothing enters the system without scope, an
// owner, dependencies, milestones and risks.
// ============================================================================

export const ASOF = "2026-07-04";

export const meta = {
  company: "Clearline",
  system: "Delivery OS",
  tagline: "One initiative backbone · six lenses",
  cadence:
    "Weekly delivery sync · mid-quarter re-plan · readiness gate before every launch · 30/60/90 post-launch reviews",
};

// Company goals — the "how does it line up" layer. Every initiative exists
// because a goal needs it; goal status is rolled up live from the health of
// its linked initiatives (see derive.js), never set by hand.
// Numbers are fictional but benchmark-anchored (see Clearline_Company_Goals_Reference.md).
export const goals = [
  {
    id: "g1",
    code: "G1",
    name: "Make the AI line commercially real",
    fy: "20% of installed base actively using the AI agent by year-end",
    q3: "Wave-1: 40 accounts live, ≥50% running weekly workflows",
    initiatives: ["atlas", "aiact"],
  },
  {
    id: "g2",
    code: "G2",
    name: "NRR ≥ 112%",
    fy: "Premium vertical-SaaS retention band, via AI attach + repackaging",
    q3: "≥50% of renewal accounts on new packaging by day-60",
    initiatives: ["pricing"],
  },
  {
    id: "g3",
    code: "G3",
    name: "Efficient growth",
    fy: "~25% ARR growth at PE-grade cost discipline (Rule-of-40)",
    q3: "PS hours per standard onboarding −30% (pilot)",
    initiatives: ["onboarding"],
  },
  {
    id: "g4",
    code: "G4",
    name: "Zero trust incidents",
    fy: "No material AI-accuracy incident at a regulated customer",
    q3: "Day-30 accuracy review passed → 'autonomous' language cleared",
    initiatives: ["atlas"],
  },
];

// Rhythm stages — the operating rhythm every initiative moves through.
export const STAGES = [
  { key: "planning", label: "Plan" },
  { key: "kickoff", label: "Kickoff" },
  { key: "build", label: "Build" },
  { key: "readiness", label: "Readiness Gate" },
  { key: "launch", label: "Launch" },
  { key: "post_launch", label: "30 / 60 / 90" },
];

export const initiatives = [
  // ==========================================================================
  // A — the hard case: net-new AI product approaching its readiness gate.
  // ==========================================================================
  {
    id: "atlas",
    name: "Atlas AI Review — GA Launch",
    owner: "M. Doyle (Product)",
    stage: "readiness",
    targetLaunch: "2026-07-24",
    charter: {
      problem:
        "Customers want compliance gap-checks to run continuously instead of quarterly. Atlas is Clearline's first net-new AI product for its existing base: an agent that reviews product specs against regulatory requirements and flags gaps with citations. Trust in its judgment — not uptime — is the launch risk.",
      scope: [
        "Agent reviews product specs against tracked regulations, flags gaps with citations",
        "Human-approve mode at GA — every flag confirmed by a reviewer before customer sees it",
        "Wave 1: 40 existing enterprise accounts, EU + US markets",
      ],
      outOfScope: [
        "Fully autonomous approval (no human in the loop)",
        "Markets not already covered by the core platform",
      ],
      milestones: [
        { label: "Model evaluation complete", due: "2026-06-12", done: true },
        { label: "Beta with 8 accounts", due: "2026-06-26", done: true },
        { label: "Cross-functional readiness gate", due: "2026-07-17", done: false },
        { label: "GA — wave 1", due: "2026-07-24", done: false },
      ],
      risks: [
        {
          risk: "One wrong autonomous flag at a regulated customer is a brand event, not a bug ticket",
          severity: "High",
          mitigation: "Human-approve default at GA + escalation SLA to compliance SME",
        },
        {
          risk: "AI-eng and SWE teams merged mid-launch — two estimation cultures, one cadence needed",
          severity: "Medium",
          mitigation: "Joint planning unit agreed at kickoff; tracked as its own readiness item",
        },
      ],
    },
    dependencies: [
      {
        on: "Human-handoff / override definition (Engineering)",
        why: "Single source of truth Support, CS and GTM all build from — gates the escalation playbook and all 'autonomous' language",
        status: "in_progress",
      },
      {
        on: "Legal accuracy-sample review framework",
        why: "Binary gate on external 'autonomous' claims",
        status: "in_progress",
      },
    ],
    readiness: [
      { fn: "Product", item: "Beta exit criteria met (8/8 accounts)", status: "ready" },
      { fn: "Product", item: "GA pricing approved", status: "ready" },
      { fn: "Engineering", item: "Human-handoff / override definition signed", status: "in_progress" },
      { fn: "Engineering", item: "Rollback & pause thresholds defined", status: "in_progress" },
      { fn: "Engineering", item: "Unified AI-eng / SWE release cadence", status: "ready" },
      { fn: "Support", item: "Wrong-flag escalation playbook", status: "blocked" },
      { fn: "Support", item: "Triage SLA + comms template", status: "not_started" },
      { fn: "CS", item: "Day-30 account-health definition", status: "in_progress" },
      { fn: "Onboarding / PS", item: "Guided setup for wave-1 accounts", status: "ready" },
      { fn: "GTM", item: "Positioning vs. generic AI compliance tools", status: "blocked" },
      { fn: "Sales Enablement", item: "Battlecard + demo script", status: "in_progress" },
      { fn: "Marketing", item: "Launch comms plan (post-legal-gate)", status: "ready" },
    ],
    decisions: [
      {
        q: "Is Atlas opt-in or default-on for wave-1 existing accounts?",
        owner: "CPO",
        raised: "2026-06-13",
        due: "2026-06-27",
        status: "open",
      },
      {
        q: "Rollback / pause threshold if the 30-day accuracy review finds a material issue?",
        owner: "Engineering + Legal",
        raised: "2026-06-20",
        due: "2026-07-10",
        status: "open",
      },
      {
        q: "Dedicated CS playbook, or fold Atlas into existing onboarding?",
        owner: "CS Lead",
        raised: "2026-06-24",
        due: "2026-07-08",
        status: "open",
      },
    ],
    blockers: [
      {
        what: "Support escalation playbook can't be authored — triage steps depend on the human-handoff definition, which is unsigned",
        waitingOn: "Engineering — sign-off on handoff/override condition matrix",
        raised: "2026-06-16",
      },
      {
        what: "GTM 'autonomous' positioning held — would oversell behavior Legal hasn't cleared",
        waitingOn: "Legal — accuracy-gate decision on the beta sample",
        raised: "2026-06-23",
      },
    ],
    scopeChanges: [
      {
        date: "2026-06-20",
        change: "Salesforce export added to GA scope (sales request from beta account)",
        approved: true,
      },
    ],
    postLaunch: null, // opens at launch
    events: [
      { date: "2026-07-02", type: "readiness", text: "Beta exit criteria confirmed — 8/8 accounts passed" },
      { date: "2026-07-01", type: "decision", text: "Opt-in vs default-on decision past due — escalated to exec sync" },
      { date: "2026-06-30", type: "blocker", text: "GTM positioning flipped to Blocked pending legal accuracy gate" },
      { date: "2026-06-26", type: "milestone", text: "Beta milestone closed (8 accounts, 4 weeks)" },
      { date: "2026-06-20", type: "scope", text: "Scope change approved: Salesforce export in GA" },
    ],
  },

  // ==========================================================================
  // B — the healthy contrast: mid-build, on pace, nothing on fire.
  // ==========================================================================
  {
    id: "onboarding",
    name: "Self-Serve Onboarding Revamp",
    owner: "K. Nolan (Product)",
    stage: "build",
    targetLaunch: "2026-09-04",
    charter: {
      problem:
        "Enterprise onboarding takes 6–8 weeks of PS time per account. A guided self-serve flow for standard configurations frees PS for complex accounts and shortens time-to-value.",
      scope: [
        "Guided setup wizard for the 5 most common configurations",
        "In-product checklist with progress tracking",
        "PS handoff path for non-standard accounts",
      ],
      outOfScope: ["Custom integrations", "Migration of existing accounts"],
      milestones: [
        { label: "Design validated (12 customer sessions)", due: "2026-06-05", done: true },
        { label: "Build — sprint 2 of 4", due: "2026-07-10", done: false },
        { label: "Readiness gate", due: "2026-08-21", done: false },
        { label: "Launch", due: "2026-09-04", done: false },
      ],
      risks: [
        {
          risk: "Self-serve accounts churn faster if setup quality drops without PS oversight",
          severity: "Medium",
          mitigation: "Setup-quality score tracked as launch KPI; PS spot-checks first 50 accounts",
        },
      ],
    },
    dependencies: [
      {
        on: "Design-system component library v2",
        why: "Wizard uses new form components",
        status: "ready",
      },
    ],
    readiness: [
      { fn: "Product", item: "Success metrics + setup-quality score defined", status: "ready" },
      { fn: "Engineering", item: "Wizard framework + checklist API", status: "in_progress" },
      { fn: "Design/UX", item: "Final flows for 5 configurations", status: "ready" },
      { fn: "Support", item: "Self-serve FAQ + deflection paths", status: "in_progress" },
      { fn: "CS", item: "Playbook update for self-serve accounts", status: "not_started" },
      { fn: "PS", item: "Handoff criteria for non-standard accounts", status: "in_progress" },
      { fn: "GTM", item: "Packaging note (self-serve tier)", status: "not_started" },
      { fn: "Marketing", item: "Launch announcement", status: "not_started" },
    ],
    decisions: [
      {
        q: "Does the self-serve tier get its own pricing page section?",
        owner: "GTM Lead",
        raised: "2026-06-30",
        due: "2026-07-15",
        status: "open",
      },
    ],
    blockers: [],
    scopeChanges: [],
    postLaunch: null,
    events: [
      { date: "2026-07-02", type: "milestone", text: "Sprint 2 review — checklist builder shipped to staging" },
      { date: "2026-06-27", type: "readiness", text: "Design/UX flows signed off for all 5 configurations" },
    ],
  },

  // ==========================================================================
  // C — the learning loop: launched, day-30 review done, adoption below
  // target, findings feeding back into the roadmap.
  // ==========================================================================
  {
    id: "pricing",
    name: "Pricing & Packaging 2.0",
    owner: "S. Brennan (GTM)",
    stage: "post_launch",
    targetLaunch: "2026-06-05",
    launchedOn: "2026-06-05",
    charter: {
      problem:
        "Legacy per-seat pricing blocked expansion into mid-market and made AI add-ons unpriceable. New module-based packaging launched June 5 to all renewal accounts.",
      scope: [
        "Module-based packaging across 3 tiers",
        "Migration calculator for existing accounts",
        "Renewal-cycle rollout (no forced migration)",
      ],
      outOfScope: ["Grandfathered enterprise contracts (renegotiated individually)"],
      milestones: [
        { label: "Launch to renewal accounts", due: "2026-06-05", done: true },
        { label: "30-day review", due: "2026-07-03", done: true },
        { label: "60-day review", due: "2026-08-04", done: false },
        { label: "90-day review", due: "2026-09-03", done: false },
      ],
      risks: [
        {
          risk: "Renewal accounts stall on the new packaging and churn instead of migrating",
          severity: "High",
          mitigation: "Migration calculator + CS-assisted path for accounts >$50k",
        },
      ],
    },
    dependencies: [],
    readiness: [
      { fn: "Product", item: "Packaging live in billing system", status: "ready" },
      { fn: "GTM", item: "Sales enablement complete", status: "ready" },
      { fn: "Support", item: "Pricing FAQ live", status: "ready" },
      { fn: "CS", item: "Migration playbook", status: "ready" },
    ],
    decisions: [
      {
        q: "Extend legacy pricing grace period from 60 to 90 days for accounts >$50k?",
        owner: "CPO + GTM",
        raised: "2026-07-03",
        due: "2026-07-11",
        status: "open",
      },
    ],
    blockers: [],
    scopeChanges: [],
    postLaunch: {
      adoptionMetric: "% of renewal accounts choosing new packaging",
      adoptionTarget: 50,
      adoptionTargetBy: "day 60",
      adoptionActual: 34,
      measuredAt: "day 30",
      reviews: [
        {
          day: 30,
          held: "2026-07-03",
          findings: [
            "Adoption 34% vs 50% day-60 target — below pace",
            "Migration calculator is the #1 CS-reported friction: output confuses multi-module accounts",
            "2 enterprise accounts stalled on legal terms addendum, not pricing",
          ],
          actions: [
            {
              what: "Calculator rework: per-module breakdown view",
              owner: "Product (M. Doyle)",
              due: "2026-07-25",
              fedInto: "Roadmap",
            },
            {
              what: "Standard terms addendum template",
              owner: "Legal",
              due: "2026-07-18",
              fedInto: "Process",
            },
            {
              what: "Grace-period decision raised to CPO + GTM",
              owner: "Delivery",
              due: "2026-07-11",
              fedInto: "Decision log",
            },
          ],
        },
        { day: 60, held: null, scheduled: "2026-08-04" },
        { day: 90, held: null, scheduled: "2026-09-03" },
      ],
    },
    events: [
      { date: "2026-07-03", type: "review", text: "30-day review held — adoption 34% vs 50% target; 3 actions fed back" },
      { date: "2026-07-03", type: "decision", text: "Grace-period extension raised as a decision (due 7/11)" },
    ],
  },

  // ==========================================================================
  // D — the pipeline: entering the system at Plan. Shows initiatives are
  // born inside the rhythm, not bolted on later.
  // ==========================================================================
  {
    id: "aiact",
    name: "EU AI Act Readiness Module",
    owner: "TBD — enters kickoff 2026-07-14",
    stage: "planning",
    targetLaunch: null,
    charter: {
      problem:
        "Customers deploying AI features face phased EU AI Act obligations through 2026–27. A module tracking their exposure by product line is the most-requested roadmap item from the last 2 QBR cycles. Proposed for Q4; scope and owner to be confirmed at the July 14 planning review.",
      scope: [],
      outOfScope: [],
      milestones: [{ label: "Planning review", due: "2026-07-14", done: false }],
      risks: [],
    },
    dependencies: [],
    readiness: [],
    decisions: [],
    blockers: [],
    scopeChanges: [],
    postLaunch: null,
    events: [
      { date: "2026-07-01", type: "milestone", text: "Accepted into planning — review scheduled 7/14" },
    ],
  },
];
