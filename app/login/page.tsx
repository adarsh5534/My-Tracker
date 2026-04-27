import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12 lg:flex-row lg:items-center">
      <section className="max-w-xl space-y-6">
        <p className="inline-flex rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium text-muted shadow-sm backdrop-blur">
          LiftLog MVP
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Faster than scribbling sets in a notebook.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted sm:text-lg">
            Track workouts, preload your last performance, and get a clear next-session suggestion without extra clutter.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-line bg-surface px-4 py-5 shadow-sm backdrop-blur">
            <p className="text-sm text-muted">Quick logging</p>
            <p className="mt-2 text-lg font-semibold">Repeat last set</p>
          </div>
          <div className="rounded-3xl border border-line bg-surface px-4 py-5 shadow-sm backdrop-blur">
            <p className="text-sm text-muted">Smarter training</p>
            <p className="mt-2 text-lg font-semibold">Next muscle pick</p>
          </div>
          <div className="rounded-3xl border border-line bg-surface px-4 py-5 shadow-sm backdrop-blur">
            <p className="text-sm text-muted">Progress at a glance</p>
            <p className="mt-2 text-lg font-semibold">PRs and deltas</p>
          </div>
        </div>
      </section>

      <div className="w-full max-w-md">
        <AuthForm
          action={loginAction}
          title="Welcome back"
          description="Use your email and password to jump back into your training log."
          submitLabel="Log in"
          footer={
            <p className="text-sm text-muted">
              New here?{" "}
              <Link className="font-medium text-accent transition hover:text-accent-strong" href="/signup">
                Create an account
              </Link>
            </p>
          }
        />
      </div>
    </main>
  );
}
