"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SupportCase = {
  state: string;
};

export function OverviewMetrics() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const caseCounts = useMemo(
    () => ({
      closed: cases.filter((supportCase) => supportCase.state === "closed").length,
      open: cases.filter((supportCase) => supportCase.state === "open").length,
    }),
    [cases],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCases() {
      setIsLoadingCases(true);

      try {
        const response = await fetch("/api/support/cases", {
          cache: "no-store",
        });
        const result = (await response.json().catch(() => ({}))) as {
          cases?: SupportCase[];
        };

        if (isMounted) {
          setCases(result.cases ?? []);
        }
      } catch {
        if (isMounted) {
          setCases([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCases(false);
        }
      }
    }

    loadCases();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="border border-zinc-800 bg-black/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          Agents
        </p>
        <p className="mt-3 text-2xl font-black tabular-nums text-zinc-100">
          TBD
        </p>
      </div>
      <div className="border border-zinc-800 bg-black/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          Active
        </p>
        <p className="mt-3 text-2xl font-black tabular-nums text-zinc-100">
          TBD
        </p>
      </div>
      <div className="border border-zinc-800 bg-black/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          Cases
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold">
          <Link
            className="cursor-pointer text-cyan-100 hover:text-cyan-50 focus-visible:text-cyan-50"
            href="/dashboard/support?status=open"
          >
            Open:{" "}
            {isLoadingCases ? "..." : caseCounts.open}
          </Link>
          <span className="text-zinc-700">/</span>
          <Link
            className="cursor-pointer text-zinc-300 hover:text-cyan-50 focus-visible:text-cyan-50"
            href="/dashboard/support?status=closed"
          >
            Close:{" "}
            {isLoadingCases ? "..." : caseCounts.closed}
          </Link>
        </div>
      </div>
    </div>
  );
}
