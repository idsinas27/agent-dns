import Link from "next/link";
import { SignInButton } from "./sign-in-button";

type AuthSearchParams = Promise<{
  callbackUrl?: string | string[];
  error?: string | string[];
}>;

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

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeCallbackUrl(value: string | undefined) {
  if (!value) {
    return "/";
  }

  try {
    const url = new URL(value, "http://localhost");
    return url.origin === "http://localhost" ? `${url.pathname}${url.search}` : "/";
  } catch {
    return value.startsWith("/") ? value : "/";
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: AuthSearchParams;
}) {
  const query = await searchParams;
  const callbackUrl = safeCallbackUrl(firstParam(query.callbackUrl));
  const error = firstParam(query.error);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black font-mono text-zinc-100 selection:bg-cyan-300 selection:text-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,240,255,0.18)_1px,transparent_0)] bg-[length:18px_18px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20" />

      <section className="relative z-10 grid min-h-screen grid-rows-[56px_1fr_88px] border border-zinc-700/80">
        <header className="grid border-b border-zinc-700/80 md:grid-cols-[260px_1fr]">
          <Link
            className="flex items-center justify-center gap-3 border-zinc-700/80 px-4 text-lg font-black uppercase tracking-[0.12em] text-cyan-200 hover:bg-cyan-200 hover:text-black md:border-r"
            href="/"
          >
            <DnsMark className="size-7 shrink-0" />
            Agent DNS
          </Link>
          <div className="hidden items-center px-4 text-xs uppercase tracking-[0.16em] text-zinc-400 md:flex">
            AUTH_GATEWAY: VERIFY GITHUB IDENTITY / ISSUE REGISTRY ACCESS
          </div>
        </header>

        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-xl border border-zinc-700/80 bg-[#0a0a0a]/80">
            <div className="border-b border-zinc-700/80 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[#00ff41]">
              ACCESS REQUEST / GITHUB PROVIDER
            </div>
            <div className="space-y-6 p-5 sm:p-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Identity Link
                </p>
                <h1 className="mt-3 text-3xl font-black uppercase leading-none tracking-[0.04em] text-zinc-50 sm:text-5xl">
                  System Access
                </h1>
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  Connect your GitHub account to enter the Agent DNS registry.
                  Your registry identity will be synced with the global agent
                  network.
                </p>
              </div>

              {error ? (
                <div className="border border-[#00ff41]/70 bg-[#00ff41]/10 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-[#00ff41]">
                  AUTH_ERROR: {error}
                </div>
              ) : null}

              <SignInButton callbackUrl={callbackUrl} />

              <div className="grid grid-cols-2 border border-zinc-800 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                <div className="border-r border-zinc-800 p-3">
                  Provider
                  <p className="mt-1 text-cyan-200">GitHub</p>
                </div>
                <div className="p-3">
                  Mode
                  <p className="mt-1 text-cyan-200">OAuth Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center border-t border-zinc-700/80 px-4 text-xs leading-5 text-zinc-500 sm:px-6">
          No soft lobby. No marketing layer. One verified identity, one registry
          route.
        </footer>
      </section>
    </main>
  );
}
