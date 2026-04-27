"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type FormState, getFormString } from "@/lib/utils";

export async function loginAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signupAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
