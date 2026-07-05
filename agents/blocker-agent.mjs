#!/usr/bin/env node
// ============================================================================
// Blocker Agent — the one of the four promoted to a real agent.
// (It earned it: the real-data stress tests caught it wrong twice — wrong
// target, judgment that didn't scale with severity — and it was fixed.)
//
//   sensing:   deterministic — same derive layer the dashboard uses
//   judgment:  LLM drafts the unblock move (via Claude Code CLI, `claude -p`)
//   action:    writes an unblock brief for a human to review and send
//
// The agent never acts on its own findings. It drafts; a person decides.
//
// Usage:
//   node agents/blocker-agent.mjs                 # Clearline demo data
//   node agents/blocker-agent.mjs <data-file.mjs> # any data module with
//                                                 # { initiatives, ASOF? }
// Output: agents/briefs/unblock-brief-<date>.md
// ============================================================================

import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { daysBetween } from "../src/derive.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(process.argv[2] || join(here, "..", "src", "data.js"));
const { initiatives, ASOF } = await import(pathToFileURL(dataPath).href);

// Demo data carries a frozen ASOF so numbers match the dashboard; live data
// (no ASOF) ages against the real clock.
const asOf = ASOF || new Date().toISOString().slice(0, 10);

const SLA = 7; // days — same SLA the dashboard's Blocker Agent watches
const PARK_THRESHOLD = SLA * 4; // past this, a working session is the wrong move

// --- sensing (deterministic, auditable) -------------------------------------
const short = (name) => name.split("—")[0].trim();
const watched = initiatives.flatMap((init) =>
  (init.blockers || [])
    .filter((b) => !b.resolved)
    .map((b) => {
      const age = daysBetween(b.raised, asOf);
      return {
        initiative: short(init.name),
        what: b.what,
        waitingOn: b.waitingOn,
        raised: b.raised,
        ageDays: age,
        tier: age > PARK_THRESHOLD ? "continue-or-park" : age > SLA ? "working-session" : "within-sla",
      };
    })
);
const flagged = watched.filter((b) => b.tier !== "within-sla");

// --- judgment (LLM drafts; nothing here is a decision) -----------------------
function draftMoves(blockers) {
  const prompt = `You are the Blocker Agent inside a delivery operating system. Today is ${asOf}. The unblock SLA is ${SLA} days.

For each blocker in the JSON below, draft the unblock move according to its tier:

- tier "working-session" (over SLA): draft (a) a 30-minute working-session agenda between the waiting party and the blocked side — the exact question to settle, what each side brings, and the decision criterion; (b) a two-line invite message ready to paste into chat.
- tier "continue-or-park" (long past SLA): draft a short memo — situation in two lines, then three options (1. continue with a specific forcing move, 2. park with explicit re-entry criteria, 3. stop), one-line trade-off for each, a recommendation, and a decide-by date within 5 working days of today.

Rules: be concrete and terse. Use ONLY the facts given — do not invent names, dates, amounts, or stakes. Address people by the role/name in "waitingOn" only. Format as Markdown with one "## <initiative>: <first 8 words of blocker>" section per blocker, in the given order. End every section with: "*— drafted by Blocker Agent; the decision stays human.*"

Blockers:
${JSON.stringify(blockers, null, 2)}`;

  const res = spawnSync("claude", ["-p"], {
    input: prompt,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 300000,
    shell: true,
  });
  // CLI plugins' lifecycle hooks can fail and flip the exit code even when
  // the draft printed fine — trust non-empty stdout over the exit code.
  const out = (res.stdout || "").trim();
  if (out) return out;
  const firstErr =
    ((res.stderr || "") + "\n" + (res.error?.message || ""))
      .split("\n")
      .map((l) => l.trim())
      .find(Boolean) || "no output from claude -p";
  throw new Error(firstErr);
}

// --- action (write the brief; sending it stays with the human) ---------------
const lines = [];
lines.push(`# Unblock Brief — ${asOf}`);
lines.push(`_sensing: deterministic (derive layer) · drafting: Claude · decision: human_`);
lines.push("");
lines.push(`**Watching ${watched.length} open blockers · ${flagged.length} over the ${SLA}d SLA**`);
lines.push("");
lines.push("| Initiative | Blocker | Waiting on | Age | Tier |");
lines.push("|---|---|---|---|---|");
for (const b of watched) {
  lines.push(
    `| ${b.initiative} | ${b.what.slice(0, 70)}${b.what.length > 70 ? "…" : ""} | ${b.waitingOn.split("—")[0].trim()} | ${b.ageDays}d | ${b.tier} |`
  );
}
lines.push("");

if (flagged.length === 0) {
  lines.push("No blocker is over SLA. Nothing to draft — the agent stays quiet.");
} else {
  lines.push("---");
  lines.push("");
  try {
    lines.push(draftMoves(flagged));
  } catch (err) {
    lines.push("_LLM drafting unavailable (" + (err.message || "unknown error").split("\n")[0] + ")._");
    lines.push("_The deterministic findings above still stand; draft the moves manually._");
  }
}

const outDir = join(here, "briefs");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `unblock-brief-${asOf}.md`);
writeFileSync(outFile, lines.join("\n") + "\n");

console.log(`Blocker Agent: ${watched.length} watched, ${flagged.length} flagged.`);
console.log(`Brief written: ${outFile}`);
