import Link from "next/link";
import { redirect } from "next/navigation";

import { signupAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12 lg:flex-row lg:items-center">
      <section className="max-w-xl space-y-6">
        <p className="inline-flex rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium text-muted shadow-sm backdrop-blur">
          Start simple
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Build consistency with a tracker that stays out of the way.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted sm:text-lg">
            Log sets fast, remember your last numbers, and keep your weekly split moving with lightweight guidance.
          </p>
        </div>
        <div className="rounded-[2rem] border border-line bg-surface px-6 py-6 shadow-sm backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
            Included in this MVP
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
            <li>Workout history with expandable exercise and set detail</li>
            <li>Last-session preload for every exercise</li>
            <li>Recommendation engine that respects recent recovery</li>
          </ul>
        </div>
      </section>

      <div className="w-full max-w-md">
        <AuthForm
          action={signupAction}
          title="Create your account"
          description="Use email and password auth backed by Supabase."
          submitLabel="Sign up"
          footer={
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link className="font-medium text-accent transition hover:text-accent-strong" href="/login">
                Log in
              </Link>
            </p>
          }
        />
      </div>
    </main>
  );
}
