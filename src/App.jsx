import { useState } from "react";
import { meta, ASOF, initiatives } from "./data.js";
import Portfolio from "./components/Portfolio.jsx";
import Cockpit from "./components/Cockpit.jsx";

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const selected = initiatives.find((i) => i.id === selectedId);

  return (
    <div className="min-h-full">
      <header className="bg-navy">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-lg font-bold tracking-tight text-white hover:text-pale-blue"
                >
                  {meta.company} {meta.system}
                </button>
                <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                  Demo
                </span>
              </div>
              <p className="mt-1 text-sm text-pale-blue/80">{meta.tagline}</p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-teal-green">As of</div>
              <div className="text-sm font-semibold text-white">{ASOF}</div>
            </div>
          </div>
          <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-pale-blue/70">
            {meta.cadence}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        {selected ? (
          <Cockpit init={selected} asOf={ASOF} onBack={() => setSelectedId(null)} />
        ) : (
          <Portfolio initiatives={initiatives} asOf={ASOF} onOpen={setSelectedId} />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <p className="border-t border-line pt-4 text-xs leading-relaxed text-mid">
          <span className="font-semibold text-navy-2">Clearline is a fictional company.</span> All
          initiatives, people, dates and metrics are invented to demonstrate how a cross-functional
          delivery operating system behaves — one initiative backbone, read through six lenses:
          charter, rhythm, readiness, decisions, early warnings, and the post-launch learning loop.
          Built with Claude Code. · Richard Lee · richardlee8433@gmail.com
        </p>
      </footer>
    </div>
  );
}
