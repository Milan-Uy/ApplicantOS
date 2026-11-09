import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "./profile-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name ?? ""
  const email = user?.email ?? ""

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-fg mt-0.5">
          Manage your account preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm defaultName={name} defaultEmail={email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="destructive">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
