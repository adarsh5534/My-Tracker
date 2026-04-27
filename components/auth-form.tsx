"use client";

import { useActionState } from "react";

import { INITIAL_FORM_STATE, type FormState } from "@/lib/utils";

import { SubmitButton } from "./submit-button";

type AuthFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  description: string;
  footer: React.ReactNode;
  submitLabel: string;
  title: string;
};

export function AuthForm({
  action,
  description,
  footer,
  submitLabel,
  title,
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_FORM_STATE);

  return (
    <div className="rounded-[2rem] border border-line bg-surface-strong p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>

      <form action={formAction} className="mt-8 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-foreground outline-none transition focus:border-accent"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-foreground outline-none transition focus:border-accent"
            required
          />
        </label>

        {state.error ? (
          <p className="rounded-2xl border border-[rgba(185,28,28,0.14)] bg-[rgba(254,242,242,0.8)] px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <SubmitButton className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
          {submitLabel}
        </SubmitButton>
      </form>

      <div className="mt-6">{footer}</div>
    </div>
  );
}
