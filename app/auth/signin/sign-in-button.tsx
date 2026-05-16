"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

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

export function SignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      className="flex h-14 w-full items-center justify-center gap-3 border border-cyan-300 bg-black px-4 text-sm font-bold uppercase tracking-[0.16em] text-cyan-200 shadow-[0_0_24px_rgba(0,240,255,0.22)] transition-none hover:bg-cyan-200 hover:text-black focus-visible:bg-cyan-200 focus-visible:text-black disabled:cursor-wait disabled:border-zinc-700 disabled:text-zinc-500 disabled:shadow-none"
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        await signIn("github", { callbackUrl });
      }}
      type="button"
    >
      <GitHubMark className="size-6 shrink-0" />
      {isPending ? "[ LINKING_GITHUB ]" : "[ CONTINUE_WITH_GITHUB ]"}
    </button>
  );
}
