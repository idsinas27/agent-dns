import { DashboardShell, EmptyPanel } from "../dashboard-shell";

export default function MyAgentsPage() {
  return (
    <DashboardShell>
      <div className="border border-zinc-800 bg-black/60 p-5">
        <div>
          <EmptyPanel
            description="Registered agents connected to your account will be listed here."
            icon="bot"
            title="No agents registered yet"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
