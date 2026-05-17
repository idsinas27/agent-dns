"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCirclePlus,
  Search,
  Terminal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import type { UIEvent } from "react";
import { useEffect, useRef, useState } from "react";

const tags = ["FINANCE", "CODING", "WRITING", "SECURITY", "RESEARCH"];

const logs = [
  "00:00:01 / BOOTSTRAP NODE: AGENT-DNS.PRIMARY",
  "00:00:04 / SYNCING WITH GITHUB IDENTITY GRAPH...",
  "00:00:07 / NEW AGENT REGISTERED: ID-273.ALPHA",
  "00:00:10 / RESOLVING TRUST SIGNALS: 98.44%",
  "00:00:13 / INDEXING CAPABILITIES: CODE.WRITE",
  "00:00:16 / ROUTE VERIFIED: FINANCE.ORACLE-17",
  "00:00:19 / HEARTBEAT: GLOBAL NETWORK ONLINE",
];

const rollingLogs = Array.from({ length: 4 }, () => logs).flat();

const fallbackMetrics = {
  activeAgents: "TBD",
  gitAccounts: "SYNCING",
  registeredAgents: "TBD",
};

const title = "THE REGISTRY FOR THE AGENTIC WORLD";

const featureSections = [
  {
    body: "Countless AI agents are being deployed, yet they operate in isolation, unable to discover or communicate with one another. Despite their individual power, this fragmentation creates a critical bottleneck for scaling a truly collaborative AI ecosystem.",
    imageAlt: "Fragmented AI ecosystem interface preview",
    imageSrc: "/images/landing1.webp",
    title: "THE FRAGMENTED AI ECOSYSTEM",
  },
  {
    body: "Agent DNS centralizes the endpoints and protocols of decentralized agents into a single, unified registry. Seamlessly discover and instantly connect with the right agents for your tasks, enabling a true Machine-to-Machine (M2M) collaborative network.",
    imageAlt: "Unified global registry interface preview",
    imageFirst: true,
    imageSrc: "/images/landing2.webp",
    title: "A UNIFIED GLOBAL REGISTRY",
  },
  {
    body: "No complex setup required. Simply add a single manifest file defining your endpoint and schema to your existing GitHub repository. With every code push, the global registry automatically syncs, keeping your agent instantly accessible to the world.",
    imageAlt: "Frictionless integration interface preview",
    title: "FRICTIONLESS INTEGRATION",
  },
];

type IssueTemplate = {
  description: string;
  name: string;
  url: string;
};

type RegistryMetrics = {
  activeAgents: string;
  gitAccounts: string;
  registeredAgents: string;
};

function DnsMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 32 32"
      fill="none"
    >
      <path d="M4 16h24M16 4v24" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 4c4 3.6 6 7.6 6 12s-2 8.4-6 12c-4-3.6-6-7.6-6-12s2-8.4 6-12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
    </svg>
  );
}

function GitHubMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.93.85.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.97c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9l-.01 2.8c0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function DigitalClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      });
      const parts = formatter.formatToParts(new Date());
      const value = `${parts.find((part) => part.type === "hour")?.value ?? "--"}:${
        parts.find((part) => part.type === "minute")?.value ?? "--"
      }:${parts.find((part) => part.type === "second")?.value ?? "--"}`;

      setTime(value);
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <span className="text-sm font-bold tabular-nums tracking-[0.08em] text-cyan-200 xl:text-base">
        {time}
      </span>
    </div>
  );
}

function AccessButton() {
  const { data: session, status } = useSession();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "loading" || isAuthenticating;
  const username = session?.user?.name ?? session?.user?.email ?? "USER";
  const accessName =
    username.length > 18 ? `${username.slice(0, 15)}...` : username;

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeMenu = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  const handleAccess = async () => {
    if (session) {
      setIsMenuOpen((current) => !current);
      return;
    }

    setIsAuthenticating(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    setIsAuthenticating(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div ref={menuRef} className="relative h-full w-full">
      <button
        aria-expanded={session ? isMenuOpen : undefined}
        aria-haspopup={session ? "menu" : undefined}
        className="group flex h-full w-full min-w-36 cursor-pointer items-center justify-center gap-3 border border-cyan-300/70 bg-black px-4 text-[12px] font-bold tracking-[0.14em] text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.18)] outline-none transition-none hover:bg-cyan-200 hover:text-black hover:shadow-[0_0_24px_rgba(34,211,238,0.75)] focus-visible:bg-cyan-200 focus-visible:text-black disabled:cursor-wait disabled:border-zinc-700 disabled:text-zinc-500 disabled:shadow-none lg:min-w-0 lg:border-0"
        disabled={isLoading}
        onClick={handleAccess}
        type="button"
      >
        <GitHubMark className="size-6 shrink-0" />
        {isLoading ? (
          <span className="uppercase">[ AUTH_SYNC ]</span>
        ) : session ? (
          <>
            <span className="normal-case">{accessName}</span>
            <ChevronDown
              className={`size-3.5 shrink-0 transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </>
        ) : (
          <span className="uppercase">[ SIGN_IN ]</span>
        )}
      </button>

      {session && isMenuOpen ? (
        <div
          className="absolute inset-x-0 top-full z-50 border border-zinc-700/80 bg-[#0a0a0a] p-1 shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
          role="menu"
        >
          <Link
            className="flex h-10 w-full items-center gap-2.5 border border-transparent bg-black px-3 text-left text-zinc-300 transition-none hover:border-cyan-300/60 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-300/60 focus-visible:bg-cyan-200 focus-visible:text-black"
            href="/dashboard"
            onClick={() => setIsMenuOpen(false)}
            role="menuitem"
          >
            <LayoutDashboard className="size-4 text-cyan-200" />
            <span className="text-xs font-bold uppercase leading-none tracking-[0.12em]">
              MY DASHBOARD
            </span>
          </Link>
          <button
            className="mt-1 flex h-10 w-full cursor-pointer items-center gap-2.5 border border-transparent bg-black px-3 text-left text-zinc-300 transition-none hover:border-cyan-300/60 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-300/60 focus-visible:bg-cyan-200 focus-visible:text-black"
            onClick={handleSignOut}
            role="menuitem"
            type="button"
          >
            <LogOut className="size-4 text-cyan-200" />
            <span className="text-xs font-bold uppercase leading-none tracking-[0.12em]">
              LOGOUT
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FeedbackHub() {
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [issueTemplates, setIssueTemplates] = useState<IssueTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const openIssueDialog = async () => {
    setIsIssueOpen(true);
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
      setIssueError(error instanceof Error ? error.message : "Issue templates are unavailable.");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  return (
    <>
      <div className="flex h-full items-center justify-center gap-2">
        <button
          aria-label="Email Agent DNS"
          className="flex size-10 cursor-pointer items-center justify-center border border-zinc-700 bg-black text-zinc-300 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
          onClick={() => setIsEmailOpen(true)}
          title="Email"
          type="button"
        >
          <Mail className="size-4" />
        </button>
        <a
          aria-label="Open GitHub repository"
          className="flex size-10 cursor-pointer items-center justify-center border border-zinc-700 bg-black text-zinc-300 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
          href="https://github.com/idsinas27/agent-dns"
          rel="noreferrer"
          target="_blank"
          title="GitHub"
        >
          <GitHubMark className="size-4" />
        </a>
        <button
          aria-label="Create GitHub issue"
          className="flex size-10 cursor-pointer items-center justify-center border border-zinc-700 bg-black text-zinc-300 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
          onClick={openIssueDialog}
          title="Issue"
          type="button"
        >
          <MessageCirclePlus className="size-4" />
        </button>
      </div>

      {isEmailOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          role="dialog"
        >
          <div className="w-full max-w-sm border border-cyan-300/70 bg-[#0a0a0a] shadow-[0_0_32px_rgba(34,211,238,0.16)]">
            <div className="border-b border-zinc-700/80 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              Select Email App
            </div>
            <div className="space-y-3 p-4">
              <a
                className="group flex h-12 items-center gap-3 border border-zinc-700 bg-black px-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
                href="https://mail.google.com/mail/?view=cm&fs=1&to=idsinas27%40gmail.com"
                rel="noreferrer"
                target="_blank"
              >
                <Mail className="size-4 text-cyan-200 group-hover:text-black group-focus-visible:text-black" />
                Gmail
              </a>
              <a
                className="group flex h-12 items-center gap-3 border border-zinc-700 bg-black px-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
                href="mailto:idsinas27@gmail.com"
              >
                <Mail className="size-4 text-cyan-200 group-hover:text-black group-focus-visible:text-black" />
                Default Email App
              </a>
              <button
                className="flex h-11 w-full items-center justify-center border border-zinc-700 bg-black px-4 text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 hover:bg-zinc-100 hover:text-black"
                onClick={() => setIsEmailOpen(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isIssueOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          role="dialog"
        >
          <div
            className="w-full max-w-lg border border-cyan-300/70 bg-[#0a0a0a] shadow-[0_0_32px_rgba(34,211,238,0.16)]"
          >
            <div className="border-b border-zinc-700/80 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              Select Issue Type
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
                      className="group border border-zinc-700 bg-black px-3 py-3 text-left transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
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
                <p className="border border-cyan-300/60 bg-cyan-300/10 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-cyan-200">
                  {issueError}
                </p>
              ) : null}
              <button
                className="flex h-11 w-full items-center justify-center border border-zinc-700 bg-black px-4 text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 hover:bg-zinc-100 hover:text-black"
                onClick={() => setIsIssueOpen(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function RegistryTelemetry({
  metrics,
}: {
  metrics: RegistryMetrics;
}) {
  const items = [
    ["ACCOUNTS", metrics.gitAccounts],
    ["TOTAL AGENTS", metrics.registeredAgents],
    ["ACTIVE AGENTS", metrics.activeAgents],
  ];

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
        <Terminal className="size-3.5 text-cyan-200" />
        Registry Telemetry
      </div>

      <div className="grid gap-2">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="border border-zinc-800/90 bg-black/55 px-3 py-2.5"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              {label}
            </p>
            <div className="mt-1.5 flex items-baseline justify-between gap-3">
              <p className="text-base font-black tabular-nums tracking-[0.04em] text-zinc-100">
                {value}
              </p>
              <span className="h-px flex-1 bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureVisual({
  alt,
  src,
}: {
  alt: string;
  src?: string;
}) {
  const [hasImage, setHasImage] = useState(Boolean(src));

  return (
    <div className="relative min-h-72 overflow-hidden rounded-lg bg-zinc-950/35 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:min-h-80 lg:min-h-[380px]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_44%),linear-gradient(90deg,rgba(39,39,42,0.38)_1px,transparent_1px),linear-gradient(rgba(39,39,42,0.38)_1px,transparent_1px)] bg-[length:100%_100%,42px_42px,42px_42px]" />
      {src && hasImage ? (
        <Image
          alt={alt}
          className="relative z-10 h-full w-full object-cover"
          fill
          onError={() => setHasImage(false)}
          sizes="(min-width: 1024px) 48vw, 92vw"
          src={src}
        />
      ) : (
        <div className="relative z-10 flex h-full min-h-72 flex-col justify-between p-5 sm:min-h-80 lg:min-h-[380px]">
          <div className="flex items-center justify-between border-b border-cyan-300/25 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
            <span>Manifest Sync</span>
            <span>Ready</span>
          </div>
          <div className="grid gap-3">
            {["endpoint", "schema", "protocol", "registry"].map((item) => (
              <div
                className="grid grid-cols-[96px_1fr] items-center gap-3 border border-zinc-800 bg-black/80 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                key={item}
              >
                <span className="text-zinc-500">{item}</span>
                <span className="h-2 bg-cyan-200/70" />
              </div>
            ))}
          </div>
          <div className="border border-cyan-300/30 bg-cyan-300/10 p-3 text-[10px] uppercase leading-5 tracking-[0.16em] text-cyan-100">
            GitHub push detected. Agent manifest indexed and discoverable.
          </div>
        </div>
      )}
    </div>
  );
}

function HomeInterface() {
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [registryMetrics, setRegistryMetrics] =
    useState<RegistryMetrics>(fallbackMetrics);
  const introScrollRef = useRef<HTMLDivElement>(null);
  const introScrollTimeoutRef = useRef<number | null>(null);

  const handleIntroScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollElement = event.currentTarget;
    const scrollTop = scrollElement.scrollTop;

    setIsIntroActive(scrollTop > 4);

    if (introScrollTimeoutRef.current) {
      window.clearTimeout(introScrollTimeoutRef.current);
    }

    introScrollTimeoutRef.current = window.setTimeout(() => {
      setIsIntroActive(scrollElement.scrollTop > 4);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (introScrollTimeoutRef.current) {
        window.clearTimeout(introScrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRegistryMetrics() {
      try {
        const response = await fetch("/api/telemetry", {
          cache: "no-store",
        });
        const result = (await response.json().catch(() => ({}))) as {
          gitAccounts?: number | null;
        };

        if (!isMounted) {
          return;
        }

        setRegistryMetrics({
          activeAgents: "TBD",
          gitAccounts:
            typeof result.gitAccounts === "number"
              ? new Intl.NumberFormat("en-US").format(result.gitAccounts)
              : "UNAVAILABLE",
          registeredAgents: "TBD",
        });
      } catch {
        if (isMounted) {
          setRegistryMetrics({
            ...fallbackMetrics,
            gitAccounts: "UNAVAILABLE",
          });
        }
      }
    }

    loadRegistryMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBrandClick = () => {
    introScrollRef.current?.scrollTo({
      behavior: "smooth",
      top: 0,
    });
    setIsIntroActive(false);
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-black font-mono text-zinc-100 selection:bg-cyan-300 selection:text-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.22)_1px,transparent_0)] bg-[length:18px_18px]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 bg-cyan-200/10 mix-blend-screen"
        initial={{ opacity: 0.95, clipPath: "inset(0 0 0 0)" }}
        animate={{
          opacity: [0.95, 0.08, 0.22, 0],
          clipPath: [
            "inset(0 0 0 0)",
            "inset(16% 0 72% 0)",
            "inset(62% 0 24% 0)",
            "inset(100% 0 0 0)",
          ],
        }}
        transition={{ duration: 1.25, ease: "linear" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 border-y border-cyan-300/40 bg-cyan-200/10 shadow-[0_0_36px_rgba(34,211,238,0.38)]"
        initial={{ y: "-20vh", opacity: 0 }}
        animate={{ y: "115vh", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.6, ease: "linear", delay: 0.15 }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20" />

      <section className="relative z-10 grid h-dvh grid-cols-1 grid-rows-[56px_minmax(0,1fr)_122px] overflow-hidden border border-zinc-700/80 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <Link
          className="group hidden items-center justify-center gap-3 border-b border-r border-zinc-700/80 px-3 text-xl font-black uppercase tracking-[0.12em] text-cyan-200 outline-none transition-colors hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:bg-cyan-300/10 focus-visible:text-cyan-100 lg:flex"
          href="/"
          onClick={handleBrandClick}
        >
          <DnsMark className="size-7 shrink-0" />
          <span>Agent DNS</span>
        </Link>
        <div
          className={`flex items-center border-b px-3 text-xs uppercase tracking-[0.12em] transition-colors duration-500 sm:text-sm ${
            isIntroActive
              ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100 shadow-[inset_0_-1px_0_rgba(103,232,249,0.36),0_0_24px_rgba(34,211,238,0.12)]"
              : "border-zinc-700/80 text-zinc-300"
          }`}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            AGENT NEXUS: A MAGIC SPACE WHERE AGENTS FIND, SPEAK, AND WORK TOGETHER
          </motion.span>
        </div>
        <div className="absolute right-2 top-2 z-20 h-10 lg:static lg:h-auto lg:border-b lg:border-l lg:border-zinc-700/80 lg:p-0">
          <AccessButton />
        </div>

        <aside className="hidden border-r border-zinc-700/80 lg:block">
          <RegistryTelemetry metrics={registryMetrics} />
        </aside>

        <div className="relative min-h-0 overflow-hidden border-zinc-700/80 lg:border-r">
          <motion.div
            className="absolute inset-0 opacity-0"
            animate={{ opacity: [0, 0.5, 0.18] }}
            transition={{ duration: 1.4, ease: "linear", delay: 0.25 }}
          >
            <div className="h-full w-full bg-[linear-gradient(90deg,rgba(34,211,238,0.16)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.16)_1px,transparent_1px)] bg-[length:72px_72px]" />
          </motion.div>

          <div
            className={`agent-intro-scroll relative h-full w-full overflow-y-auto bg-black/70 ${
              isIntroActive ? "is-scrolling" : ""
            }`}
            onScroll={handleIntroScroll}
            ref={introScrollRef}
          >
            <div className="flex min-h-full items-center px-4 py-10 sm:px-8 lg:px-12">
              <div className="w-full">
                <h1
                  className="glitch-title mx-auto max-w-4xl text-balance text-center text-4xl font-black uppercase leading-[0.95] tracking-[-0.01em] text-zinc-50 sm:text-6xl lg:text-7xl"
                  data-text={title}
                >
                  {title.split("").map((char, index) => (
                    <motion.span
                      key={`${char}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.42 + index * 0.024,
                        duration: 0.01,
                        ease: "linear",
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </h1>
                {/* TODO: Remove this pre-launch notice when Agent DNS is ready for public launch. */}
                <p className="mx-auto mt-5 max-w-2xl text-center text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 sm:text-sm">
                  Coming Soon / Registry Access Opening Shortly
                </p>

                <div className="mx-auto mt-8 max-w-3xl">
                  <label className="group/search relative block">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200">
                      <Search className="size-5" />
                    </span>
                    <input
                      className="peer h-16 w-full border border-zinc-500 bg-black py-0 pl-12 pr-4 text-sm uppercase tracking-[0.08em] text-zinc-100 outline-none transition-none placeholder:normal-case placeholder:text-zinc-600 focus:border-cyan-300 focus:shadow-[0_0_0_1px_rgba(103,232,249,0.85),0_0_34px_rgba(34,211,238,0.48)] sm:text-base"
                      placeholder="What agent address are you looking for?"
                    />
                  </label>

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        className="cursor-pointer border border-zinc-700 bg-black px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
                      >
                        [ {tag} ]
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800/80 px-6 py-16 sm:px-10 lg:px-16 xl:px-20">
              <p className="mx-auto max-w-4xl text-balance text-center text-3xl font-black uppercase leading-tight text-zinc-50 sm:text-5xl">
                The address layer for machine-to-machine intelligence
              </p>

              <div className="mt-16 grid gap-20">
                {featureSections.map((section) => (
                  <section
                    className={`grid items-end gap-10 lg:gap-16 xl:gap-20 ${
                      section.imageFirst
                        ? "lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]"
                        : "lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]"
                    }`}
                    key={section.title}
                  >
                    <div
                      className={`self-end pb-2 lg:max-w-md ${
                        section.imageFirst ? "lg:order-2" : ""
                      }`}
                    >
                      <h2 className="text-2xl font-black uppercase leading-tight text-zinc-50 sm:text-3xl">
                        {section.title}
                      </h2>
                      <p className="mt-5 text-sm leading-7 text-zinc-300 sm:text-base">
                        {section.body}
                      </p>
                    </div>
                    <div className={section.imageFirst ? "lg:order-1" : ""}>
                      <FeatureVisual
                        alt={section.imageAlt}
                        src={section.imageSrc}
                      />
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden min-h-0 lg:block">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-zinc-700/80 p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              <Activity className="size-3.5 text-cyan-200" />
              Live Agent Updates
            </div>
            <div className="agent-feed-mask relative flex-1 overflow-hidden p-3">
              <div className="agent-feed-track space-y-3 text-[10px] uppercase leading-relaxed text-cyan-100/75">
                {[0, 1].map((group) => (
                  <div className="space-y-3" key={group}>
                    {rollingLogs.map((log, index) => (
                      <p
                        className="border-l border-cyan-300/40 pl-2"
                        key={`${group}-${log}-${index}`}
                      >
                        {log}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-700/80 p-3 text-[10px] uppercase text-zinc-500">
              <div className="flex items-center gap-2 text-cyan-200">
                <MessageCirclePlus className="size-3.5" />
                Feedback is always welcome
              </div>
            </div>
          </div>
        </aside>

        <footer className="col-span-full grid border-t border-zinc-700/80 bg-black/90 lg:grid-cols-[260px_1fr_300px]">
          <div className="hidden border-r border-zinc-700/80 px-4 py-3 lg:block">
            <DigitalClock />
          </div>
          <p className="flex items-center px-4 py-5 text-sm leading-6 text-zinc-300 sm:px-6 lg:text-base">
            Hello, pioneer. Search for any AI agent address above to start
            building, or register your own agent to the global network.
          </p>
          <div className="hidden border-l border-zinc-700/80 p-3 lg:block">
            <FeedbackHub />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeInterface />
    </SessionProvider>
  );
}
