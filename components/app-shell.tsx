import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plans", label: "Plans" },
  { href: "/workout/new", label: "New Workout" },
  { href: "/history", label: "History" },
];

type AppShellProps = {
  children: React.ReactNode;
  userEmail: string;
};

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-[rgba(251,248,242,0.88)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-white shadow-sm">
                LL
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-foreground">
                  LiftLog
                </p>
                <p className="text-xs text-muted">Simple strength tracking</p>
              </div>
            </Link>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted sm:block">
                {userEmail}
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
