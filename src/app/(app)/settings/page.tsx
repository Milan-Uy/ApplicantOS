import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/app/(auth)/actions"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name ?? "—"
  const email = user?.email ?? "—"

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-fg mt-0.5">Manage your account</p>
      </div>

      {/* Profile */}
      <section className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-fg">Name</span>
            <span className="font-medium text-foreground">{name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-fg">Email</span>
            <span className="font-medium text-foreground">{email}</span>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <section className="bg-card rounded-xl border border-border shadow-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Account</h2>
        <form action={signOut}>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  )
}
