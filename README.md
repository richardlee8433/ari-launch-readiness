# Ari Launch Readiness — Cross-Functional Tracker

An interactive dashboard that makes one question answerable at a glance: **is the organization ready to support Ari, not just ship it?**

Built for the Adherent (formerly Compliance & Risks) *Product Delivery & Operations Lead* conversation — a working artefact of how I'd stand up a delivery system for a high-trust GA launch, rather than a slide describing one.

---

## What This Is

A single-screen implementation of **FR-1** from [`PRD_Ari_Launch_Readiness.md`](../PRD_Ari_Launch_Readiness.md): the Cross-Functional Readiness Tracker.

1. **6 workstream cards** — one per row of the PRD scope table. Each shows the owning function, a status (🔴 Not Started / 🟡 In Progress / 🚧 Blocked / ✅ Ready), and a one-line reason it's high-risk. Click any card to expand its definition of "ready," where it stands now, what it gates or is blocked by, and the user story behind it.
2. **Blockers panel** — every 🚧 item with the three things the PRD requires on a blocked item: *what's blocking it, who it's waiting on, and how long it's been raised.*
3. **Needs Decision panel** — the PRD's Open Questions, with owner and priority.

The point it's making: readiness gaps live *between* functions. Support can't write its escalation playbook until Engineering signs off the human-handoff definition; GTM can't finalize "autonomous" positioning until Legal clears the accuracy gate. A tracker that surfaces those dependencies early is the difference between a pre-launch checklist item and a customer complaint.

---

## Sourcing — public information only

This is built **entirely from public information**: [adherent.com](https://adherent.com), the agentic-AI platform GA press release, public executive bios, and C2P platform listings on Capterra / Software Advice. The PRD it implements carries the same note.

The statuses, dates, and blocker text are **illustrative** — chosen to demonstrate how a cross-functional readiness system behaves under real dependencies. They are **not** a claim of internal knowledge about Adherent's actual launch state. The brand colours in the appendix were captured from public computed styles on adherent.com for visual consistency in the demo, not for production use.

---

## How It Was Made

- **Stack:** React 19 + Vite + Tailwind CSS v4 (`@tailwindcss/vite`). Same Vite/React skeleton, `netlify.toml`, and `vite.config.js` shape as my prior [HALOS PM OS](https://hlaipmos.netlify.app) demo — reused deliberately so the tooling wasn't re-litigated.
- **No backend.** All content is hard-coded in [`src/data.js`](src/data.js), keyed straight off the PRD's scope table, Blocked logic, and Open Questions. One source file to read, one screen to render.
- **Not a chatbot.** A deliberate contrast with the HALOS demo: this one is a static-but-polished operational dashboard, because the artefact *is* the point — a delivery lead's weekly snapshot, not a conversation.
- **Brand-native styling.** Adherent's palette is wired into Tailwind as named theme tokens (`bg-navy`, `text-teal`, …): dark navy `#162D3C` header/nav, teal `#369A9C` for status accents and CTAs, lime `#AACF42` as a sparing highlight (the "New" badge only), pale-blue `#E7F1FF` page background instead of pure white.

---

## Run It

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the build locally
```

Deploys to Netlify as-is (`netlify.toml`: `npm run build` → `dist`).

---

*Richard Lee · richardlee8433@gmail.com · Dublin*
