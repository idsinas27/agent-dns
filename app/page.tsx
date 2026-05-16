"use client";

import { motion } from "framer-motion";
import { Mail, MessageCirclePlus, Search, ShieldCheck, Terminal } from "lucide-react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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

const metrics = [
  ["GIT ACCOUNTS", "12,908"],
  ["REGISTERED AGENTS", "18,402"],
];

const title = "THE REGISTRY FOR THE AGENTIC WORLD";

type IssueTemplate = {
  description: string;
  name: string;
  url: string;
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
  const isLoading = status === "loading" || isAuthenticating;
  const username = session?.user?.name ?? session?.user?.email ?? "USER";
  const accessName =
    username.length > 18 ? `${username.slice(0, 15)}...` : username;

  const handleAccess = async () => {
    setIsAuthenticating(true);

    if (session) {
      await signOut({ callbackUrl: "/" });
      return;
    }

    await signIn("github", { callbackUrl: "/" });
  };

  return (
    <button
      className="group flex h-full w-full min-w-36 items-center justify-center gap-3 border border-cyan-300/70 bg-black px-4 text-[12px] font-bold tracking-[0.14em] text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.18)] outline-none transition-none hover:bg-cyan-200 hover:text-black hover:shadow-[0_0_24px_rgba(34,211,238,0.75)] focus-visible:bg-cyan-200 focus-visible:text-black disabled:cursor-wait disabled:border-zinc-700 disabled:text-zinc-500 disabled:shadow-none lg:min-w-0 lg:border-0"
      disabled={isLoading}
      onClick={handleAccess}
      type="button"
    >
      <GitHubMark className="size-6 shrink-0" />
      {isLoading ? (
        <span className="uppercase">[ AUTH_SYNC ]</span>
      ) : session ? (
        <span className="normal-case">{accessName}</span>
      ) : (
        <span className="uppercase">[ SIGN_IN ]</span>
      )}
    </button>
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
          className="flex size-10 items-center justify-center border border-zinc-700 bg-black text-zinc-300 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
          onClick={() => setIsEmailOpen(true)}
          title="Email"
          type="button"
        >
          <Mail className="size-4" />
        </button>
        <a
          aria-label="Open GitHub repository"
          className="flex size-10 items-center justify-center border border-zinc-700 bg-black text-zinc-300 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
          href="https://github.com/idsinas27/agent-dns"
          rel="noreferrer"
          target="_blank"
          title="GitHub"
        >
          <GitHubMark className="size-4" />
        </a>
        <button
          aria-label="Create GitHub issue"
          className="flex size-10 items-center justify-center border border-zinc-700 bg-black text-zinc-300 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
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

function HomeInterface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black font-mono text-zinc-100 selection:bg-cyan-300 selection:text-black">
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

      <section className="relative z-10 grid min-h-screen grid-cols-1 grid-rows-[56px_1fr_122px] border border-zinc-700/80 lg:grid-cols-[260px_1fr_300px]">
        <div className="hidden items-center justify-center gap-3 border-b border-r border-zinc-700/80 px-3 text-xl font-black uppercase tracking-[0.12em] text-cyan-200 lg:flex">
          <DnsMark className="size-7 shrink-0" />
          <span>Agent DNS</span>
        </div>
        <div className="flex items-center border-b border-zinc-700/80 px-3 text-xs uppercase tracking-[0.12em] text-zinc-300 sm:text-sm">
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
          <div className="border-b border-zinc-700/80 p-3">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              <Terminal className="size-3.5 text-cyan-200" />
              Registry Telemetry
            </div>
            <div className="grid border border-zinc-800">
              {metrics.map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-zinc-800 p-3 last:border-b-0"
                >
                  <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-black tabular-nums text-zinc-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 p-3 text-[10px] uppercase leading-relaxed text-zinc-500">
            <p>Resolver: Global Agent Address Namespace</p>
            <p>Protocol: Github-linked Trust Manifest</p>
            <p>Mode: Cold Machine / Friendly Guidance</p>
          </div>
        </aside>

        <div className="relative flex min-h-0 items-center justify-center border-zinc-700/80 px-3 py-10 sm:px-6 lg:border-r">
          <motion.div
            className="absolute inset-0 opacity-0"
            animate={{ opacity: [0, 0.5, 0.18] }}
            transition={{ duration: 1.4, ease: "linear", delay: 0.25 }}
          >
            <div className="h-full w-full bg-[linear-gradient(90deg,rgba(34,211,238,0.16)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.16)_1px,transparent_1px)] bg-[length:72px_72px]" />
          </motion.div>

          <div className="relative w-full max-w-5xl">
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
                  className="peer h-16 w-full border border-zinc-500 bg-black px-12 text-sm uppercase tracking-[0.08em] text-zinc-100 outline-none transition-none placeholder:normal-case placeholder:text-zinc-600 focus:border-cyan-300 focus:shadow-[0_0_0_1px_rgba(103,232,249,0.85),0_0_34px_rgba(34,211,238,0.48)] sm:text-base"
                  placeholder="What agent address are you looking for?"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase text-zinc-600 peer-focus:text-cyan-200">
                  ENTER_QUERY
                </span>
              </label>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className="border border-zinc-700 bg-black px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-none hover:border-cyan-200 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-200 focus-visible:bg-cyan-200 focus-visible:text-black"
                  >
                    [ {tag} ]
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden min-h-0 lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-zinc-700/80 p-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Live Data Feed
            </div>
            <div className="relative flex-1 overflow-hidden p-3">
              <motion.div
                className="space-y-3 text-[10px] uppercase leading-relaxed text-cyan-100/75"
                animate={{ y: [42, -124] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                {[...logs, ...logs].map((log, index) => (
                  <p key={`${log}-${index}`} className="border-l border-cyan-300/40 pl-2">
                    {log}
                  </p>
                ))}
              </motion.div>
            </div>
            <div className="border-t border-zinc-700/80 p-3 text-[10px] uppercase text-zinc-500">
              <div className="flex items-center gap-2 text-cyan-200">
                <ShieldCheck className="size-3.5" />
                AUTH ROUTE: GITHUB OAUTH READY
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
