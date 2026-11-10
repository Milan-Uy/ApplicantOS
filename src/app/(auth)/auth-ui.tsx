import { Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "./actions"

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      {/* Mobile logo — the brand panel carries it from lg up */}
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Cpu className="h-4 w-4 text-primary-fg" />
        </div>
        <span className="text-base font-semibold">
          Applicant<span className="text-accent">OS</span>
        </span>
      </div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-fg">{subtitle}</p>
    </>
  )
}

export function AuthError({ message }: { message: string }) {
  return (
    <div role="alert" className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  )
}

export function GoogleSignIn() {
  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs text-muted-fg">
          <span className="bg-background px-2">or continue with</span>
        </div>
      </div>
      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="h-10 w-full">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </form>
    </>
  )
}
