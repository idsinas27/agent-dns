import { DashboardShell, EmptyPanel } from "../dashboard-shell";

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="border border-zinc-800 bg-black/60 p-5">
        <div>
          <EmptyPanel
            description="Traffic, discovery, and connection analytics will appear here."
            icon="analytics"
            title="Analytics pending"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
