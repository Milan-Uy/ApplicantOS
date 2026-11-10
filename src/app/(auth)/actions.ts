"use server"

import { redirect } from "next/navigation"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/log"

const DEMO_UNAVAILABLE = "The demo is not available right now."

// Passwordless, so a visitor changing the demo password breaks nothing. Takes no input: the token it
// returns can only ever sign in DEMO_EMAIL, which is what every caller gets anyway. The browser
// verifies it, because Supabase rate-limits /verify per client IP and from here every visitor would
// share the server's. No email is sent.
export async function signInAsDemo(): Promise<{ error: string } | { tokenHash: string }> {
  const email = process.env.DEMO_EMAIL?.trim()
  if (!email) return { error: DEMO_UNAVAILABLE }

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email })
  if (error) {
    logError("demo-login", error)
    return { error: DEMO_UNAVAILABLE }
  }
  return { tokenHash: data.properties.hashed_token }
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
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
  // With "Confirm email" on there is no session until the link is clicked; /dashboard would bounce to /login.
  if (!data.session) {
    return { notice: "Check your email for a confirmation link, then sign in." }
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
