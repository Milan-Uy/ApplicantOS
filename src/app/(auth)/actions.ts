"use server"

import { redirect } from "next/navigation"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/log"

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

// Passwordless, so a visitor changing the demo password breaks nothing. Takes no input: it can only
// ever sign in DEMO_EMAIL, and the token never leaves the server. No email is sent.
export async function signInAsDemo(): Promise<{ error: string } | void> {
  const email = process.env.DEMO_EMAIL?.trim()
  if (!email) return { error: "The demo is not available right now." }

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
  const { data, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email })
  if (linkError) {
    logError("demo-login", linkError)
    return { error: "The demo is not available right now." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash: data.properties.hashed_token, type: "email" })
  if (error) {
    logError("demo-login", error)
    return { error: "The demo is not available right now." }
  }

  redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("name") as string,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.url) {
    redirect(data.url)
  }
}


export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
