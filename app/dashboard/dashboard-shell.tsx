"use client";

import {
  BarChart3,
  Bot,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { ReactNode, useEffect, useRef, useState } from "react";

const primaryNavItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Overview",
  },
  {
    href: "/dashboard/my-agents",
    icon: Bot,
    label: "My Agents",
  },
  {
    href: "/dashboard/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
];

const secondaryNavItems = [
  {
    href: "/dashboard/agents-search",
    icon: Search,
    label: "Agents search",
  },
];

const supportNavItems = [
  {
    href: "/dashboard/support",
    icon: HelpCircle,
    label: "Support",
  },
];

const dashboardTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/agents-search": "Agents search",
  "/dashboard/analytics": "Analytics",
  "/dashboard/my-agents": "My Agents",
  "/dashboard/support": "Support",
};

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

function DnsMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
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
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.93.85.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.97c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9l-.01 2.8c0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function NavGroup({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            className={`flex h-10 items-center gap-3 px-2.5 text-left text-sm font-bold transition-colors ${
              isActive
                ? "rounded-md bg-zinc-800/90 text-cyan-100"
                : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100 focus-visible:bg-zinc-900/80 focus-visible:text-zinc-100"
            }`}
            href={item.href}
            key={item.href}
          >
            <Icon
              className={`size-[18px] shrink-0 ${
                isActive ? "text-cyan-200" : "text-zinc-400"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function UserPanel() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div ref={menuRef} className="relative h-full w-full">
      <button
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        className="flex h-full w-full cursor-pointer items-center justify-center gap-3 border-l border-zinc-700/80 bg-black px-4 text-[12px] font-bold tracking-[0.12em] text-cyan-200 outline-none transition-none hover:bg-cyan-300/10 focus-visible:bg-cyan-300/10"
        disabled={status === "loading"}
        onClick={() => setIsMenuOpen((current) => !current)}
        type="button"
      >
        <GitHubMark className="size-6 shrink-0" />
        <span className="min-w-0 truncate normal-case">{accessName}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform ${
            isMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isMenuOpen ? (
        <div
          className="absolute inset-x-0 top-full z-50 border border-zinc-700/80 bg-[#0a0a0a] p-1 shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
          role="menu"
        >
          <button
            className="flex h-10 w-full cursor-pointer items-center gap-2.5 border border-transparent bg-black px-3 text-left text-zinc-300 transition-none hover:border-cyan-300/60 hover:bg-cyan-200 hover:text-black focus-visible:border-cyan-300/60 focus-visible:bg-cyan-200 focus-visible:text-black"
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

function DashboardFrame({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = dashboardTitles[pathname] ?? "My dashboard";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

  return (
    <main className="relative h-dvh overflow-hidden bg-black font-mono text-zinc-100 selection:bg-cyan-300 selection:text-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.18)_1px,transparent_0)] bg-[length:18px_18px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20" />

      <section className="relative z-10 grid h-dvh grid-cols-1 grid-rows-[56px_minmax(0,1fr)] overflow-hidden border border-zinc-700/80 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <Link
          className="group hidden items-center justify-center gap-3 border-b border-r border-zinc-700/80 px-3 text-xl font-black uppercase tracking-[0.12em] text-cyan-200 outline-none transition-colors hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:bg-cyan-300/10 focus-visible:text-cyan-100 lg:flex"
          href="/"
        >
          <DnsMark className="size-7 shrink-0" />
          <span>Agent DNS</span>
        </Link>

        <div className="flex items-center justify-center border-b border-zinc-700/80 px-3 text-center text-sm font-bold leading-none tracking-[0.1em] text-cyan-200">
          {pageTitle}
        </div>

        <div className="absolute right-2 top-2 z-20 h-10 lg:static lg:h-auto lg:border-b lg:border-zinc-700/80">
          <UserPanel />
        </div>

        <aside className="hidden border-r border-zinc-700/80 px-3 py-4 lg:block">
          <NavGroup items={primaryNavItems} />
          <div className="my-1 border-t border-zinc-800/90" />
          <NavGroup items={secondaryNavItems} />
          <div className="my-1 border-t border-zinc-800/90" />
          <NavGroup items={supportNavItems} />
        </aside>

        <section className="min-h-0 overflow-hidden lg:col-span-2">
          <div className="h-full overflow-y-auto px-5 py-6 sm:px-8 lg:px-10">
            {children}
          </div>
        </section>
      </section>
    </main>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DashboardFrame>{children}</DashboardFrame>
    </SessionProvider>
  );
}

export function EmptyPanel({
  description,
  icon,
  title,
}: {
  description: string;
  icon: "analytics" | "bot" | "dashboard" | "search" | "support";
  title: string;
}) {
  const icons = {
    analytics: BarChart3,
    bot: Bot,
    dashboard: LayoutDashboard,
    search: Search,
    support: HelpCircle,
  };
  const Icon = icons[icon];

  return (
    <div className="grid min-h-[360px] place-items-center border border-dashed border-zinc-800 text-center">
      <div>
        <Icon className="mx-auto size-8 text-cyan-200" />
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-zinc-300">
          {title}
        </p>
        <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}
