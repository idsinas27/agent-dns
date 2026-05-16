import Link from "next/link";

type AuthErrorSearchParams = Promise<{
  error?: string | string[];
}>;

const errorCopy: Record<string, string> = {
  AccessDenied: "The provider rejected this access request.",
  Callback: "The callback route returned an invalid auth signal.",
  Configuration: "The auth gateway is missing a required configuration value.",
  OAuthCallback: "GitHub returned an OAuth callback error.",
  OAuthSignin: "The GitHub authorization route failed to initialize.",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: AuthErrorSearchParams;
}) {
  const query = await searchParams;
  const error = firstParam(query.error) ?? "Unknown";
  const message =
    errorCopy[error] ?? "The access route failed. Return to the registry and retry.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-black font-mono text-zinc-100 selection:bg-cyan-300 selection:text-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,240,255,0.18)_1px,transparent_0)] bg-[length:18px_18px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20" />

      <section className="relative z-10 flex min-h-screen items-center justify-center border border-zinc-700/80 px-4 py-10">
        <div className="w-full max-w-xl border border-[#00ff41]/80 bg-[#0a0a0a]/90">
          <div className="border-b border-[#00ff41]/60 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[#00ff41]">
            AUTH_GATEWAY / ERROR SIGNAL
          </div>
          <div className="space-y-6 p-5 sm:p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Failure Code
              </p>
              <h1 className="mt-3 text-3xl font-black uppercase leading-none tracking-[0.04em] text-zinc-50 sm:text-5xl">
                Access Denied
              </h1>
            </div>

            <div className="border border-zinc-800 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Error
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.12em] text-[#00ff41]">
                {error}
              </p>
              <p className="mt-4 text-sm leading-6 text-zinc-400">{message}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                className="flex h-12 items-center justify-center border border-cyan-300 bg-black px-4 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200 hover:bg-cyan-200 hover:text-black"
                href="/auth/signin"
              >
                [ RETRY_AUTH ]
              </Link>
              <Link
                className="flex h-12 items-center justify-center border border-zinc-700 bg-black px-4 text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 hover:bg-zinc-100 hover:text-black"
                href="/"
              >
                [ RETURN_HOME ]
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
