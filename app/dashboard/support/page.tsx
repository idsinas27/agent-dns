"use client";

import {
  ChevronDown,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  ArrowDownUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardShell } from "../dashboard-shell";

type SortKey = "comments" | "createdAt" | "no" | "title";
type SortDirection = "asc" | "desc";

type IssueTemplate = {
  description: string;
  name: string;
  url: string;
};

type SupportCase = {
  comments: number;
  createdAt: string;
  labels: string[];
  number: number;
  state: string;
  title: string;
  updatedAt: string;
  url: string;
};

function typeBadgeClass(label: string) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("bug")) {
    return "border-rose-300/35 bg-rose-300/10 text-rose-200";
  }

  if (normalizedLabel.includes("question")) {
    return "border-violet-300/35 bg-violet-300/10 text-violet-200";
  }

  if (normalizedLabel.includes("enhancement")) {
    return "border-sky-300/35 bg-sky-300/10 text-sky-200";
  }

  return "border-zinc-700 bg-zinc-900/70 text-zinc-300";
}

function stateBadgeClass(state: string) {
  return state === "closed"
    ? "border-zinc-600 bg-zinc-800/70 text-zinc-300"
    : "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

export default function SupportPage() {
  const initialStatusFilter =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("status");
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [casesError, setCasesError] = useState("");
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [issueTemplates, setIssueTemplates] = useState<IssueTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState(
    initialStatusFilter === "open" || initialStatusFilter === "closed"
      ? initialStatusFilter
      : "all",
  );
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const hasCases = cases.length > 0;
  const filteredCases = useMemo(
    () => {
      const filtered = cases.filter((supportCase) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !normalizedQuery ||
          supportCase.title.toLowerCase().includes(normalizedQuery) ||
          String(supportCase.number).includes(normalizedQuery);
        const matchesState =
          stateFilter === "all" || supportCase.state === stateFilter;
        const matchesType =
          typeFilter === "all" ||
          supportCase.labels.some((label) =>
            label.toLowerCase().includes(typeFilter),
          );

        return matchesSearch && matchesState && matchesType;
      });

      return [...filtered].sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;

        if (sortKey === "comments") {
          return (a.comments - b.comments) * direction;
        }

        if (sortKey === "createdAt") {
          return (
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            direction
          );
        }

        if (sortKey === "title") {
          return a.title.localeCompare(b.title) * direction;
        }

        return (a.number - b.number) * direction;
      });
    },
    [cases, searchQuery, sortDirection, sortKey, stateFilter, typeFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredCases.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleCases = useMemo(
    () =>
      filteredCases.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [filteredCases, currentPage, pageSize],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCases() {
      setIsLoadingCases(true);
      setCasesError("");

      try {
        const response = await fetch("/api/support/cases", {
          cache: "no-store",
        });
        const result = (await response.json().catch(() => ({}))) as {
          cases?: SupportCase[];
          error?: string;
        };

        if (!isMounted) {
          return;
        }

        setCases(result.cases ?? []);
        setCasesError(result.error ?? "");
      } catch {
        if (isMounted) {
          setCases([]);
          setCasesError("Unable to load support cases.");
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

  useEffect(() => {
    if (!isSortMenuOpen) {
      return;
    }

    const closeSortMenu = (event: MouseEvent) => {
      if (
        sortMenuRef.current &&
        event.target instanceof Node &&
        !sortMenuRef.current.contains(event.target)
      ) {
        setIsSortMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeSortMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeSortMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSortMenuOpen]);

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  };

  const goToNextPage = () => {
    setPage((currentPage) => Math.min(pageCount, currentPage + 1));
  };

  const openCaseDialog = async () => {
    setIsCaseDialogOpen(true);
    setIssueError("");

    if (issueTemplates.length > 0 || isLoadingTemplates) {
      return;
    }

    setIsLoadingTemplates(true);

    try {
      const response = await fetch("/api/github/issues");
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        templates?: IssueTemplate[];
      };

      if (!response.ok || !result.templates?.length) {
        throw new Error(result.error ?? "Issue templates are unavailable.");
      }

      setIssueTemplates(result.templates);
    } catch (error) {
      setIssueError(
        error instanceof Error ? error.message : "Issue templates are unavailable.",
      );
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
            <input
              className={`h-11 w-full rounded-md border border-zinc-800 bg-zinc-950/70 pl-10 pr-3 text-sm outline-none placeholder:text-zinc-600 ${
                hasCases
                  ? "text-zinc-200 transition-none focus:border-cyan-300 focus:shadow-[0_0_0_1px_rgba(103,232,249,0.85),0_0_26px_rgba(34,211,238,0.32)]"
                  : "cursor-not-allowed text-zinc-500"
              }`}
              disabled={!hasCases}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search cases..."
              value={searchQuery}
            />
          </label>
          <div className="relative" ref={sortMenuRef}>
            <button
              aria-expanded={isSortMenuOpen}
              aria-haspopup="menu"
              aria-label="Sort cases"
              className={`flex h-11 w-11 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/70 ${
                hasCases
                  ? "cursor-pointer text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-100"
                  : "cursor-not-allowed text-zinc-500"
              }`}
              disabled={!hasCases}
              onClick={() => setIsSortMenuOpen((current) => !current)}
              type="button"
            >
              <ArrowDownUp className="size-4" />
            </button>

            {hasCases && isSortMenuOpen ? (
              <div
                className="absolute right-0 top-full z-30 mt-2 w-56 rounded-md border border-zinc-800 bg-[#0a0a0a] p-1 shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
                role="menu"
              >
                {[
                  ["Ascending", "asc"],
                  ["Descending", "desc"],
                ].map(([label, direction]) => {
                  const isActive = sortDirection === direction;

                  return (
                    <button
                      className={`flex h-9 w-full cursor-pointer items-center justify-between rounded-sm px-3 text-left text-xs font-bold transition-none ${
                        isActive
                          ? "bg-cyan-300/10 text-cyan-100"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-cyan-100"
                      }`}
                      key={direction}
                      onClick={() => {
                        setPage(1);
                        setSortDirection(direction as SortDirection);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      {label}
                      {isActive ? <span className="text-cyan-200">●</span> : null}
                    </button>
                  );
                })}
                <div className="my-1 border-t border-zinc-800" />
                {[
                  ["No", "no"],
                  ["Title", "title"],
                  ["Comments", "comments"],
                  ["Create date", "createdAt"],
                ].map(([label, key]) => {
                  const isActive = sortKey === key;

                  return (
                    <button
                      className={`flex h-9 w-full cursor-pointer items-center justify-between rounded-sm px-3 text-left text-xs font-bold transition-none ${
                        isActive
                          ? "bg-cyan-300/10 text-cyan-100"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-cyan-100"
                      }`}
                      key={key}
                      onClick={() => {
                        setPage(1);
                        setSortKey(key as SortKey);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      {label}
                      {isActive ? <span className="text-cyan-200">●</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <button
            className="flex h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-700 bg-black px-4 text-sm font-bold text-zinc-100 transition-none hover:border-cyan-300/60 hover:text-cyan-100 focus-visible:border-cyan-300/60 focus-visible:text-cyan-100"
            onClick={openCaseDialog}
            type="button"
          >
            <Plus className="size-4" />
            New Case
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="relative">
            <select
              className={`h-9 appearance-none rounded-md border border-zinc-800 bg-zinc-950/70 py-0 pl-3 pr-8 text-xs font-bold outline-none ${
                hasCases
                  ? "cursor-pointer text-zinc-300 hover:border-cyan-300/60 focus-visible:border-cyan-300/60"
                  : "cursor-not-allowed text-zinc-500"
              }`}
              disabled={!hasCases}
              onChange={(event) => {
                setStateFilter(event.target.value);
                setPage(1);
              }}
              value={stateFilter}
            >
              <option className="bg-zinc-950 text-zinc-200" value="all">
                All Statuses
              </option>
              <option className="bg-zinc-950 text-zinc-200" value="open">
                Open
              </option>
              <option className="bg-zinc-950 text-zinc-200" value="closed">
                Close
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
          </label>
          <label className="relative">
            <select
              className={`h-9 appearance-none rounded-md border border-zinc-800 bg-zinc-950/70 py-0 pl-3 pr-8 text-xs font-bold outline-none ${
                hasCases
                  ? "cursor-pointer text-zinc-300 hover:border-cyan-300/60 focus-visible:border-cyan-300/60"
                  : "cursor-not-allowed text-zinc-500"
              }`}
              disabled={!hasCases}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              value={typeFilter}
            >
              <option className="bg-zinc-950 text-zinc-200" value="all">
                All Type
              </option>
              <option className="bg-zinc-950 text-rose-200" value="bug">
                Bug
              </option>
              <option className="bg-zinc-950 text-violet-200" value="question">
                Question
              </option>
              <option className="bg-zinc-950 text-sky-200" value="enhancement">
                Enhancement
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
          </label>
        </div>

        <div className="min-h-[298px]">
          {isLoadingCases ? (
            <div className="grid min-h-[298px] place-items-center rounded-md border border-zinc-800 bg-black/45 px-4 py-12 text-center text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Loading cases
            </div>
          ) : hasCases ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                  <span>Total {filteredCases.length}</span>
                  <button
                    aria-label="Previous cases page"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-zinc-800 bg-black text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-100 disabled:cursor-not-allowed disabled:text-zinc-600"
                    disabled={currentPage === 1}
                    onClick={goToPreviousPage}
                    type="button"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="rounded-md border border-cyan-300/40 bg-cyan-300/10 px-2.5 py-1.5 text-cyan-100">
                    {currentPage}
                  </span>
                  <button
                    aria-label="Next cases page"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-zinc-800 bg-black text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-100 disabled:cursor-not-allowed disabled:text-zinc-600"
                    disabled={currentPage === pageCount}
                    onClick={goToNextPage}
                    type="button"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <label className="relative">
                    <select
                      className="h-8 cursor-pointer appearance-none rounded-md border border-zinc-800 bg-black py-0 pl-3 pr-8 text-sm font-bold text-zinc-300 outline-none hover:border-cyan-300/60 focus-visible:border-cyan-300/60"
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                      value={pageSize}
                    >
                      {[10, 15, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}/page
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                  </label>
                </div>
              </div>
              {casesError ? (
                <p className="border-b border-zinc-800 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200">
                  {casesError}
                </p>
              ) : null}
              <div className="overflow-hidden rounded-md border border-zinc-800 bg-black/45">
                {visibleCases.length === 0 ? (
                  <div className="grid min-h-[240px] place-items-center px-4 py-12 text-center">
                    <div>
                      <div className="mx-auto flex size-14 items-center justify-center rounded-md border border-zinc-800 bg-black text-zinc-300">
                        <HelpCircle className="size-5" />
                      </div>
                      <h2 className="mt-7 text-base font-bold text-zinc-50">
                        No Matching Cases
                      </h2>
                      <p className="mt-3 text-sm text-zinc-400">
                        Adjust your search or filters to find a case.
                      </p>
                    </div>
                  </div>
                ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-cyan-300/20 bg-cyan-300/5 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
                      <th className="w-16 px-4 py-3.5">No</th>
                      <th className="w-28 px-4 py-3.5">State</th>
                      <th className="w-40 px-4 py-3.5">Type</th>
                      <th className="px-4 py-3.5">Title</th>
                      <th className="w-24 px-4 py-3.5">Comments</th>
                      <th className="w-48 px-4 py-3.5">Create date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {visibleCases.map((supportCase, index) => (
                      <tr
                        className="text-sm text-zinc-300 hover:bg-zinc-900/60"
                        key={supportCase.number}
                      >
                        <td className="px-4 py-4 text-xs tabular-nums text-zinc-500">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${stateBadgeClass(supportCase.state)}`}>
                            {supportCase.state}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {supportCase.labels.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {supportCase.labels.map((label) => (
                                <span
                                  className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${typeBadgeClass(label)}`}
                                  key={label}
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <a
                            className="font-bold text-zinc-100 hover:text-cyan-100 focus-visible:text-cyan-100"
                            href={supportCase.url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            #{supportCase.number} {supportCase.title}
                          </a>
                        </td>
                        <td className="px-4 py-4 text-xs tabular-nums text-zinc-400">
                          {supportCase.comments}
                        </td>
                        <td className="px-4 py-4 text-xs text-zinc-400">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(supportCase.createdAt))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid min-h-[298px] place-items-center rounded-md border border-zinc-800 bg-black/45 px-4 py-12 text-center">
              <div>
                <div className="mx-auto flex size-14 items-center justify-center rounded-md border border-zinc-800 bg-black text-zinc-300">
                  <HelpCircle className="size-5" />
                </div>
                <h2 className="mt-7 text-base font-bold text-zinc-50">
                  No Cases
                </h2>
                <p className="mt-3 text-sm text-zinc-400">
                  Create a new case to get assistance.
                </p>
                <button
                  className="mt-7 h-11 cursor-pointer rounded-md border border-zinc-700 bg-black px-5 text-sm font-bold text-zinc-100 transition-none hover:border-cyan-300/60 hover:text-cyan-100 focus-visible:border-cyan-300/60 focus-visible:text-cyan-100"
                  onClick={openCaseDialog}
                  type="button"
                >
                  New Case
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCaseDialogOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          role="dialog"
        >
          <div className="w-full max-w-lg rounded-md border border-cyan-300/70 bg-[#0a0a0a] shadow-[0_0_32px_rgba(34,211,238,0.16)]">
            <div className="flex items-center justify-between border-b border-zinc-700/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
                Select Case Type
              </p>
              <button
                aria-label="Close case type dialog"
                className="flex size-8 cursor-pointer items-center justify-center text-zinc-400 hover:text-cyan-100 focus-visible:text-cyan-100"
                onClick={() => setIsCaseDialogOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4 p-4">
              {isLoadingTemplates ? (
                <div className="border border-zinc-800 px-3 py-6 text-center text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  Loading templates
                </div>
              ) : null}

              {!isLoadingTemplates && issueTemplates.length > 0 ? (
                <div className="grid gap-3">
                  {issueTemplates.map((template) => (
                    <a
                      className="group rounded-md border border-zinc-700 bg-black px-3 py-3 text-left transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
                      href={template.url}
                      key={template.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="block text-xs font-bold uppercase tracking-[0.16em] text-cyan-200 group-hover:text-black">
                        {template.name}
                      </span>
                      <span className="mt-2 block text-xs leading-5 text-zinc-500 group-hover:text-black group-focus-visible:text-black">
                        {template.description}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}

              {issueError ? (
                <p className="rounded-md border border-cyan-300/60 bg-cyan-300/10 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-cyan-200">
                  {issueError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
