import { Bot, HelpCircle, Search } from "lucide-react";
import { DashboardShell, EmptyPanel } from "./dashboard-shell";
import { OverviewMetrics } from "./overview-metrics";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <OverviewMetrics />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="border border-zinc-800 bg-black/60 p-5">
          <div>
            <EmptyPanel
              description="Your agents, registry status, and analytics will appear here as the dashboard evolves."
              icon="dashboard"
              title="Registry workspace ready"
            />
          </div>
        </div>

      <div className="border border-zinc-800 bg-black/60 p-5">
          <div className="grid gap-3">
            {[
              ["Register agent", Bot],
              ["Search registry", Search],
              ["Open support", HelpCircle],
            ].map(([label, Icon]) => (
              <button
                className="flex h-11 cursor-pointer items-center gap-3 border border-zinc-800 bg-black px-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition-none hover:border-cyan-300/60 hover:text-cyan-100 focus-visible:border-cyan-300/60 focus-visible:text-cyan-100"
                key={label as string}
                type="button"
              >
                <Icon className="size-4 text-cyan-200" />
                {label as string}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
