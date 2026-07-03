# Clearline Delivery OS

**Live:** https://ari-launch-readiness.netlify.app/
**Repo:** https://github.com/richardlee8433/ari-launch-readiness

An interactive demo of a **delivery operating system** — not a project tracker. It answers the question a VP of Engineering actually has: *is the organization ready to launch, are decisions moving, and will I hear about problems while they're still cheap?*

Built as a working artefact of how I design delivery systems for cross-functional product launches.

---

## The design idea: one backbone, six lenses

A delivery OS is not six tools. It is **one data object — the Initiative — read through six lenses**:

| # | Lens | Where it lives in the demo |
|---|------|---------------------------|
| ① | **Initiative framework** — same charter for every initiative: scope, single owner, dependencies, milestones, risks | The `Initiative` schema in [`src/data.js`](src/data.js); the Charter tab |
| ② | **Operating rhythm** — Plan → Kickoff → Build → Readiness Gate → Launch → 30/60/90 | The lifecycle axis on the home screen; every initiative sits somewhere on it |
| ③ | **Launch readiness** — "ready to ship" means the *organization* is ready: pricing, positioning, onboarding, support, enablement — engineering-done is one row, not the definition | The Readiness Gate tab, grouped by function, with a computed go/no-go verdict |
| ④ | **Decisions & blockers** — every decision has one owner and one due date; past-due items escalate automatically | The Decisions & Blockers tab; overdue items are flagged in red with aging |
| ⑤ | **Early warnings** — leading indicators, not post-hoc reports | The warning strip: readiness-vs-pace, decision debt, blocker age — all **computed in [`src/derive.js`](src/derive.js)**, nothing typed in |
| ⑥ | **Learning loop** — 30/60/90 reviews measure whether the product was *absorbed*, and findings feed back into roadmap/process | The Post-Launch tab: adoption vs target, review findings, actions with owners |

The four initiatives are staged deliberately: one approaching a hard readiness gate (at risk), one healthy mid-build (the contrast), one post-launch with adoption below target (the learning loop working), and one entering at Plan (initiatives are born inside the rhythm, not bolted on).

## Everything red is derived

The system's health signals are **computed from the backbone data, not hand-set**: readiness %, pace-vs-launch-date gap, decision aging, blocker age, adoption gap. That's the core argument of the design — leading indicators should fall out of the data teams already maintain, not require a second reporting system someone has to feed.

---

## Clearline is fictional

Clearline is an invented B2B product-compliance SaaS company (mature platform, 250+ enterprise customers, shipping its first net-new AI products). **All initiatives, people, dates and metrics are invented** to demonstrate system behavior. No real company's internal information appears anywhere in this demo.

## How it was made

- **Stack:** React 19 + Vite + Tailwind CSS v4. No backend — the point of the demo is the *system design*, so the backbone is a single readable data file and a derivation module.
- **Built with Claude Code**, in the same working session that produced the PRD thinking behind it.
- ~600 lines of source across a data backbone, a derivation layer, and three components.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

Deploys to Netlify as-is (`netlify.toml`: `npm run build` → `dist`).

---

*Richard Lee · richardlee8433@gmail.com · Dublin*
