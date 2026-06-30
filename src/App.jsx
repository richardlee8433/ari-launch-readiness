import { useState } from "react";
import { meta, STATUS, workstreams, blockers, decisions } from "./data.js";

const wsById = Object.fromEntries(workstreams.map((w) => [w.id, w]));

function StatusChip({ statusKey, size = "sm" }) {
  const s = STATUS[statusKey];
  const pad = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad} ${s.chip}`}>
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </span>
  );
}

function Summary() {
  const counts = workstreams.reduce((acc, w) => {
    acc[w.status] = (acc[w.status] || 0) + 1;
    return acc;
  }, {});
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.values(STATUS).map((s) => (
        <div
          key={s.key}
          className="rounded-xl border border-line bg-white px-4 py-3 shadow-sm"
        >
          <div className="text-2xl font-bold text-navy">{counts[s.key] || 0}</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-mid">
            <span aria-hidden>{s.icon}</span>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[120px_1fr] sm:gap-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-mid">{label}</div>
      <div className="text-sm leading-relaxed text-navy-2">{children}</div>
    </div>
  );
}

function WorkstreamCard({ ws }) {
  const [open, setOpen] = useState(false);
  const d = ws.detail;
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-white shadow-sm transition hover:shadow-md">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-col gap-3 rounded-2xl p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-pale-blue px-2 py-0.5 text-xs font-semibold text-teal-deep">
              {ws.fn}
            </span>
            {ws.fr && (
              <span className="text-xs font-medium text-mid">{ws.fr}</span>
            )}
          </div>
          <StatusChip statusKey={ws.status} />
        </div>

        <h3 className="text-base font-bold leading-snug text-navy">{ws.name}</h3>
        <p className="text-sm leading-relaxed text-mid">{ws.risk}</p>

        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-teal">
          {open ? "Hide detail" : "View detail"}
          <span className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>▾</span>
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-line bg-pale-blue/40 px-5 py-4">
          <DetailRow label="Definition of ready">{d.ready}</DetailRow>
          <DetailRow label="Where it is now">{d.now}</DetailRow>
          {d.blockedBy && (
            <DetailRow label="Blocked by">
              <span className="font-semibold text-[#9A3C12]">
                {wsById[d.blockedBy].name}
              </span>{" "}
              ({wsById[d.blockedBy].fr || wsById[d.blockedBy].fn})
            </DetailRow>
          )}
          {d.gates && (
            <DetailRow label="Gates">{d.gates.join(" · ")}</DetailRow>
          )}
          {d.story && <DetailRow label="User story">{d.story}</DetailRow>}
        </div>
      )}
    </div>
  );
}

function Panel({ title, accent, count, children }) {
  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="flex items-center justify-between rounded-t-2xl border-b border-line px-5 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy">
          <span className={`h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden />
          {title}
        </h2>
        <span className="rounded-full bg-pale-blue px-2.5 py-0.5 text-xs font-semibold text-teal-deep">
          {count}
        </span>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function BlockersPanel() {
  return (
    <Panel title="Blockers" accent="bg-[#D9663A]" count={blockers.length}>
      <ul className="space-y-3">
        {blockers.map((b) => {
          const ws = wsById[b.wsId];
          const days = Math.round(
            (new Date(meta.asOf) - new Date(b.raised)) / 86400000
          );
          return (
            <li
              key={b.wsId}
              className="rounded-xl border border-line bg-[#FBE3D6]/40 p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-navy">{ws.name}</h3>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#9A3C12]">
                  {days}d blocked
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-2">{b.blocker}</p>
              <dl className="mt-2 space-y-0.5 text-xs text-mid">
                <div className="flex gap-1.5">
                  <dt className="font-semibold">Waiting on:</dt>
                  <dd>{b.waitingOn}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="font-semibold">Raised:</dt>
                  <dd>{b.raised}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function DecisionsPanel() {
  return (
    <Panel title="Needs Decision" accent="bg-teal" count={decisions.length}>
      <ul className="space-y-2.5">
        {decisions.map((d) => (
          <li key={d.n} className="rounded-xl border border-line bg-white p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                {d.n}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-relaxed text-navy-2">{d.q}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-mid">Owner: <span className="font-semibold text-navy">{d.owner}</span></span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      d.priority === "High"
                        ? "bg-[#FBE3D6] text-[#9A3C12]"
                        : "bg-pale-blue text-teal-deep"
                    }`}
                  >
                    {d.priority}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function App() {
  return (
    <div className="min-h-full">
      {/* Header / nav — navy */}
      <header className="bg-navy">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold tracking-tight text-white">{meta.project}</span>
                <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                  New
                </span>
              </div>
              <p className="mt-1 text-sm text-pale-blue/80">{meta.subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-teal-green">As of</div>
              <div className="text-sm font-semibold text-white">{meta.asOf}</div>
            </div>
          </div>
          <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-pale-blue/70">
            {meta.cadence}
          </p>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        <div className="mb-6">
          <Summary />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Workstream board */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-mid">
              Readiness Workstreams
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {workstreams.map((ws) => (
                <WorkstreamCard key={ws.id} ws={ws} />
              ))}
            </div>
          </div>

          {/* Right rail */}
          <aside className="space-y-6">
            <BlockersPanel />
            <DecisionsPanel />
          </aside>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <p className="border-t border-line pt-4 text-xs leading-relaxed text-mid">
          Demo built from <span className="font-semibold text-navy-2">public information only</span> (adherent.com,
          the agentic-AI GA press release, public exec bios, C2P platform listings). Statuses and
          dates are illustrative — this shows how a cross-functional readiness system behaves, not
          internal Adherent data. · Richard Lee · richardlee8433@gmail.com
        </p>
      </footer>
    </div>
  );
}
