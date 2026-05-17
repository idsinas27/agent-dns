import { DashboardShell, EmptyPanel } from "../dashboard-shell";

export default function AgentsSearchPage() {
  return (
    <DashboardShell>
      <div className="border border-zinc-800 bg-black/60 p-5">
        <div>
          <EmptyPanel
            description="Search and discovery tools for public agent endpoints will live here."
            icon="search"
            title="Search workspace coming online"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
