# ApplicantOS — UI/Visual Design Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a complete, consistent visual design system for ApplicantOS and implement it across all pages (auth, dashboard, kanban, application detail, resume library, AI results).

**Architecture:** Minimalism + Swiss Style with Flat Design micro-interactions. Single font (Plus Jakarta Sans), professional blue primary palette, semantic CSS variables via Tailwind CSS 4, dark mode supported via class strategy. All design decisions live in `globals.css` and `tailwind.config.ts` — components import tokens, never raw hex values.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (base-nova), Lucide icons, Sonner toasts

**Spec Reference:** `.superpowers/brainstorm/2269-1775183573`

---

## Design System Summary

| Token | Value |
|-------|-------|
| Primary | `#0369A1` (sky-700) |
| Secondary | `#0EA5E9` (sky-500) |
| Accent/CTA | `#16A34A` (green-600) |
| Background | `#F0F9FF` (sky-50) |
| Foreground | `#0C4A6E` (sky-950) |
| Muted | `#E7EFF5` |
| Border | `#BAE6FD` (sky-200) |
| Destructive | `#DC2626` (red-600) |
| Heading font | Plus Jakarta Sans 600–700 |
| Body font | Plus Jakarta Sans 400 |
| Label font | Plus Jakarta Sans 500 |
| Base size | 16px |
| Type scale | 12 / 14 / 16 / 18 / 24 / 32 / 48px |
| Spacing unit | 4px base (4/8/12/16/24/32/48/64px) |
| Border radius | sm=4px, md=8px, lg=12px, xl=16px |
| Shadow | `0 1px 3px rgba(3,105,161,0.08), 0 1px 2px rgba(3,105,161,0.05)` |
| Transition | `150ms ease-out` (micro), `250ms ease-out` (layout) |

### Status Badge Colors

| Status | Bg | Text |
|--------|----|------|
| `wishlist` | `#EFF6FF` | `#1D4ED8` |
| `applied` | `#F0F9FF` | `#0369A1` |
| `phone_screen` | `#FEF3C7` | `#B45309` |
| `interview` | `#FFF7ED` | `#C2410C` |
| `offer` | `#F0FDF4` | `#16A34A` |
| `rejected` | `#FEF2F2` | `#DC2626` |
| `ghosted` | `#F9FAFB` | `#6B7280` |

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/app/globals.css` | CSS custom properties (color tokens, dark mode), font import, base styles |
| `tailwind.config.ts` | Extend theme with semantic tokens, font family, keyframes |
| `src/components/ui/badge.tsx` | Status badge with variant per application status |
| `src/components/ui/button.tsx` | shadcn Button with ApplicantOS variants (primary, secondary, ghost, destructive) |
| `src/components/ui/card.tsx` | Card base used throughout (applications, resume cards) |
| `src/components/navigation/Sidebar.tsx` | Desktop sidebar with nav items + active state |
| `src/components/navigation/TopBar.tsx` | Mobile top bar with page title + actions |
| `src/app/(app)/layout.tsx` | App shell — sidebar on desktop, top bar on mobile |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/signup/page.tsx` | Signup page |
| `src/app/(app)/dashboard/page.tsx` | Stats overview + upcoming interviews |
| `src/app/(app)/applications/page.tsx` | Kanban board (default) + list view toggle |
| `src/app/(app)/applications/[id]/page.tsx` | Application detail |
| `src/app/(app)/resumes/page.tsx` | Resume library |
| `src/app/(app)/applications/[id]/resume/page.tsx` | AI optimizer results |
| `src/app/(app)/applications/[id]/cover-letter/page.tsx` | AI cover letter |

---

## Task 0: Landing Page

**Files:**
- Create: `src/app/page.tsx`
- Modify: `src/middleware.ts` — allow `/` for unauthed users (render landing page), redirect authed users to `/dashboard`

A minimal, clean landing page for unauthenticated visitors. Consistent with the design system (dark theme, blue primary, Plus Jakarta Sans, shadcn/ui).

- [ ] **Step 1: Create the landing page**

```tsx
// src/app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Kanban, FileText, Sparkles, Mail } from 'lucide-react'

const features = [
  {
    icon: Kanban,
    title: 'Application Tracker',
    description: 'Organize every application with a drag-and-drop Kanban board and list view.',
  },
  {
    icon: FileText,
    title: 'Resume Library',
    description: 'Upload and manage multiple resume versions — pick the right one for each role.',
  },
  {
    icon: Sparkles,
    title: 'AI Resume Optimizer',
    description: 'Get a match score, missing keywords, and AI-rewritten bullet points tailored to the job.',
  },
  {
    icon: Mail,
    title: 'AI Cover Letters',
    description: 'Generate tailored cover letters from your resume and the job description in seconds.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-lg font-bold tracking-tight text-primary">ApplicantOS</span>
        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
          Land your next role,<br className="hidden sm:block" /> not lost in spreadsheets
        </h1>
        <p className="mt-4 text-lg text-muted-fg max-w-xl text-balance">
          Track every application, optimize your resume with AI, and generate tailored cover letters — all in one place.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started — it's free</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card p-6 shadow-card"
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-card-fg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-fg">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-border px-6 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to get organized?</h2>
        <p className="mt-2 text-muted-fg">Start tracking your job search in under a minute.</p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/signup">Create free account</Link>
        </Button>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Update middleware to allow landing page for unauthed users**

In `src/middleware.ts`, ensure the root `/` path is excluded from auth redirect logic so it renders the landing page. Authed users visiting `/` should redirect to `/dashboard`.

- [ ] **Step 3: Verify**

- `npm run dev` — visit `localhost:3000` unauthenticated → see landing page
- Click "Get Started" → navigates to `/signup`
- Click "Log in" → navigates to `/login`
- Log in → visiting `/` redirects to `/dashboard`
- Check responsive layout at 375px and 1440px

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/middleware.ts
git commit -m "feat: add minimal landing page with hero, features, and CTA"
```

---

## Task 1: Design Tokens — globals.css + Tailwind Config

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add Google Font import and CSS variables to globals.css**

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 3 105 161;           /* #0369A1 */
    --color-primary-fg: 255 255 255;
    --color-secondary: 14 165 233;        /* #0EA5E9 */
    --color-secondary-fg: 255 255 255;
    --color-accent: 22 163 74;            /* #16A34A */
    --color-accent-fg: 255 255 255;
    --color-background: 240 249 255;      /* #F0F9FF */
    --color-foreground: 12 74 110;        /* #0C4A6E */
    --color-muted: 231 239 245;           /* #E7EFF5 */
    --color-muted-fg: 100 116 139;
    --color-border: 186 230 253;          /* #BAE6FD */
    --color-ring: 3 105 161;
    --color-destructive: 220 38 38;       /* #DC2626 */
    --color-destructive-fg: 255 255 255;
    --color-card: 255 255 255;
    --color-card-fg: 12 74 110;
    --color-input: 186 230 253;
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
  }

  .dark {
    --color-primary: 14 165 233;
    --color-primary-fg: 255 255 255;
    --color-secondary: 3 105 161;
    --color-secondary-fg: 255 255 255;
    --color-accent: 34 197 94;
    --color-accent-fg: 255 255 255;
    --color-background: 2 6 23;
    --color-foreground: 226 232 240;
    --color-muted: 15 23 42;
    --color-muted-fg: 148 163 184;
    --color-border: 30 41 59;
    --color-ring: 14 165 233;
    --color-destructive: 239 68 68;
    --color-destructive-fg: 255 255 255;
    --color-card: 15 23 42;
    --color-card-fg: 226 232 240;
    --color-input: 30 41 59;
  }

  * {
    border-color: rgb(var(--color-border));
  }

  body {
    background-color: rgb(var(--color-background));
    color: rgb(var(--color-foreground));
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.25;
    color: rgb(var(--color-foreground));
  }
}

@layer utilities {
  .text-balance { text-wrap: balance; }
}
```

- [ ] **Step 2: Extend Tailwind config with semantic tokens**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          fg: 'rgb(var(--color-primary-fg) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          fg: 'rgb(var(--color-secondary-fg) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          fg: 'rgb(var(--color-accent-fg) / <alpha-value>)',
        },
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          fg: 'rgb(var(--color-muted-fg) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
        destructive: {
          DEFAULT: 'rgb(var(--color-destructive) / <alpha-value>)',
          fg: 'rgb(var(--color-destructive-fg) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          fg: 'rgb(var(--color-card-fg) / <alpha-value>)',
        },
        input: 'rgb(var(--color-input) / <alpha-value>)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(3,105,161,0.08), 0 1px 2px rgba(3,105,161,0.05)',
        'card-hover': '0 4px 12px rgba(3,105,161,0.12), 0 2px 4px rgba(3,105,161,0.08)',
        'modal': '0 20px 60px rgba(3,105,161,0.15)',
      },
      transitionDuration: {
        micro: '150ms',
        layout: '250ms',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'fade-in': 'fade-in 200ms ease-out',
      },
    },
  },
}

export default config
```

- [ ] **Step 3: Verify build compiles cleanly**

Run: `npm run build`
Expected: Build succeeds, no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "design: add ApplicantOS design tokens and typography"
```

---

## Task 2: Status Badge Component

**Files:**
- Modify: `src/components/ui/badge.tsx`

The badge must handle all 7 application statuses with distinct colors. It is used in kanban cards, the list view, and the application detail header.

- [ ] **Step 1: Implement StatusBadge**

```tsx
// src/components/ui/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        wishlist:     'bg-blue-50   text-blue-700   dark:bg-blue-950  dark:text-blue-300',
        applied:      'bg-sky-50    text-sky-700    dark:bg-sky-950   dark:text-sky-300',
        phone_screen: 'bg-amber-50  text-amber-700  dark:bg-amber-950 dark:text-amber-300',
        interview:    'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
        offer:        'bg-green-50  text-green-700  dark:bg-green-950 dark:text-green-300',
        rejected:     'bg-red-50    text-red-700    dark:bg-red-950   dark:text-red-300',
        ghosted:      'bg-gray-100  text-gray-500   dark:bg-gray-800  dark:text-gray-400',
        outline: 'border border-border text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const STATUS_LABELS: Record<string, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status as BadgeVariant}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "design: add StatusBadge with all application status variants"
```

---

## Task 3: App Shell — Sidebar + Layout

**Files:**
- Create: `src/components/navigation/Sidebar.tsx`
- Modify: `src/app/(app)/layout.tsx`

The sidebar is 240px wide on desktop (≥1024px). On mobile, it collapses — a sticky top bar replaces it (already handled by the existing navigation). Each nav item has an icon + label. Active item gets a filled background (`bg-primary/10 text-primary font-semibold`).

- [ ] **Step 1: Build the Sidebar component**

```tsx
// src/components/navigation/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  Cpu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: Briefcase },
  { href: '/resumes',      label: 'Resumes',      icon: FileText },
  { href: '/settings',     label: 'Settings',     icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r border-border bg-card shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary-fg" />
        </div>
        <span className="text-base font-700 tracking-tight text-foreground">
          Applicant<span className="text-primary">OS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-fg hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            U
          </div>
          <span className="text-sm font-medium text-muted-fg truncate">Account</span>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Update app layout to include sidebar**

```tsx
// src/app/(app)/layout.tsx
import { Sidebar } from '@/components/navigation/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verify sidebar renders on desktop, hidden on mobile**

Run: `npm run dev`
Expected: 240px sidebar on ≥1024px viewport, hidden below 1024px.

- [ ] **Step 4: Commit**

```bash
git add src/components/navigation/Sidebar.tsx src/app/(app)/layout.tsx
git commit -m "design: add sidebar navigation with ApplicantOS branding"
```

---

## Task 4: Auth Pages (Login + Signup)

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/signup/page.tsx`

Auth pages are centered, full-height. Split layout on desktop: left panel (brand hero, sky-900 bg), right panel (white card with form). Mobile: single-column white card centered.

- [ ] **Step 1: Implement Login page layout**

```tsx
// src/app/(auth)/login/page.tsx
import Link from 'next/link'
import { Cpu } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-sky-900 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ApplicantOS</span>
        </div>
        <div>
          <blockquote className="text-2xl font-semibold leading-snug text-white/90 text-balance">
            "Stop losing track of opportunities. Start landing the role you deserve."
          </blockquote>
          <p className="mt-4 text-sm text-white/50">AI-powered job application tracking</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary-fg" />
            </div>
            <span className="text-base font-semibold">Applicant<span className="text-primary">OS</span></span>
          </div>

          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-fg">Sign in to your account</p>

          {/* Form — wire up to Supabase auth actions */}
          <form className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>
            <button
              type="submit"
              className="h-10 w-full rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-fg">
              <span className="bg-background px-2">or continue with</span>
            </div>
          </div>

          {/* OAuth */}
          <button
            type="button"
            className="h-10 w-full rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            {/* Google SVG icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-fg">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Apply same layout shell to signup page**

`src/app/(auth)/signup/page.tsx` uses identical split-panel shell. Change:
- `<h1>` → "Create your account"
- `<p>` → "Start tracking your job search"
- Add "Name" field above email
- Change button label → "Create account"
- Footer link → `href="/login"` "Already have an account? Sign in"
- `autoComplete="new-password"` on password

- [ ] **Step 3: Verify at 375px and 1440px widths**

Run: `npm run dev`, check at both viewport widths.
Expected: Single-column centered on mobile, split-panel on desktop.

- [ ] **Step 4: Commit**

```bash
git add src/app/(auth)/login/page.tsx src/app/(auth)/signup/page.tsx
git commit -m "design: implement auth pages with split-panel layout"
```

---

## Task 5: Dashboard Page

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`

Grid of stat cards at the top. Below: upcoming interviews list, recent activity list. All cards use `bg-card shadow-card rounded-xl`.

- [ ] **Step 1: Implement stat card component inline**

```tsx
// src/app/(app)/dashboard/page.tsx
// Stat card pattern — use for all 4 stats
function StatCard({ label, value, sub, color }: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border flex flex-col gap-1 animate-fade-in">
      <span className="text-xs font-medium text-muted-fg uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold tabular-nums ${color ?? 'text-foreground'}`}>{value}</span>
      {sub && <span className="text-xs text-muted-fg">{sub}</span>}
    </div>
  )
}
```

- [ ] **Step 2: Dashboard grid layout**

```tsx
// inside page.tsx — layout skeleton (wire up data in implementation plan)
export default async function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col gap-8 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-fg mt-0.5">Your job search at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={0} sub="all time" />
        <StatCard label="Response Rate" value="0%" sub="applied → response" color="text-primary" />
        <StatCard label="Interviews" value={0} sub="scheduled or completed" color="text-orange-600" />
        <StatCard label="Offers" value={0} sub="active" color="text-accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming interviews */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming Interviews</h2>
          <div className="bg-card rounded-xl border border-border shadow-card divide-y divide-border">
            {/* Map interview items here */}
            <div className="px-4 py-8 text-center text-sm text-muted-fg">
              No upcoming interviews
            </div>
          </div>
        </section>

        {/* Source breakdown */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">Source Breakdown</h2>
          <div className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col gap-3">
            {/* Source bars rendered here */}
            <div className="py-4 text-center text-sm text-muted-fg">
              Add applications to see source data
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/dashboard/page.tsx
git commit -m "design: implement dashboard layout with stat cards and sections"
```

---

## Task 6: Applications Page — Kanban + List View

**Files:**
- Modify: `src/app/(app)/applications/page.tsx`

**Kanban columns:** Each status is a column (240px min-width). Column header has status badge + count. Cards drag between columns via `@hello-pangea/dnd`. List view uses a table with `overflow-x-auto`.

- [ ] **Step 1: Define kanban column + card visual styles**

```tsx
// Kanban column header pattern
function KanbanColumn({ status, count, children }: {
  status: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 min-w-[240px] w-[240px]">
      <div className="flex items-center justify-between px-1">
        <StatusBadge status={status} />
        <span className="text-xs font-medium text-muted-fg tabular-nums">{count}</span>
      </div>
      <div className="flex flex-col gap-2 min-h-[120px]">
        {children}
      </div>
    </div>
  )
}

// Application kanban card
function AppCard({ app }: { app: Application }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-shadow duration-150">
      <p className="text-sm font-semibold text-foreground truncate">{app.role}</p>
      <p className="text-xs text-muted-fg mt-0.5 truncate">{app.company}</p>
      {app.salary_min && (
        <p className="text-xs text-accent font-medium mt-2">
          ${app.salary_min.toLocaleString()}
          {app.salary_max ? `–$${app.salary_max.toLocaleString()}` : '+'}
        </p>
      )}
      {app.interview_date && (
        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
          <span>📅</span>
          <span>{new Date(app.interview_date).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Page header with view toggle**

```tsx
// View toggle — Kanban | List
<div className="flex items-center gap-2">
  <button
    onClick={() => setView('kanban')}
    className={cn(
      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
      view === 'kanban' ? 'bg-primary text-primary-fg' : 'text-muted-fg hover:text-foreground hover:bg-muted'
    )}
  >
    Kanban
  </button>
  <button
    onClick={() => setView('list')}
    className={cn(
      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
      view === 'list' ? 'bg-primary text-primary-fg' : 'text-muted-fg hover:text-foreground hover:bg-muted'
    )}
  >
    List
  </button>
</div>
```

- [ ] **Step 3: Horizontal scroll kanban board container**

```tsx
// Kanban board — horizontally scrollable on all screens
<div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 lg:-mx-8 lg:px-8">
  {STATUSES.map(status => (
    <KanbanColumn key={status} status={status} count={...}>
      {/* DnD droppable + cards */}
    </KanbanColumn>
  ))}
</div>
```

- [ ] **Step 4: List view table**

```tsx
// List view — card wrapper with overflow-x-auto
<div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border">
        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">Company</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">Role</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">Status</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">Applied</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">Follow-up</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">Source</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      {/* Map rows here */}
    </tbody>
  </table>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/applications/page.tsx
git commit -m "design: implement applications page kanban and list view layouts"
```

---

## Task 7: Application Detail Page

**Files:**
- Modify: `src/app/(app)/applications/[id]/page.tsx`

Two-column layout on desktop: main content (left, 2/3) + sidebar (right, 1/3). Mobile: single column stack.

- [ ] **Step 1: Page header with status badge + action buttons**

```tsx
// Application detail header
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
  <div>
    <div className="flex items-center gap-2 mb-1">
      <StatusBadge status={app.status} />
      {app.source && (
        <span className="text-xs text-muted-fg capitalize">{app.source.replace('_', ' ')}</span>
      )}
    </div>
    <h1 className="text-2xl font-bold text-foreground">{app.role}</h1>
    <p className="text-base text-muted-fg mt-0.5">{app.company}</p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    <a
      href={`/applications/${app.id}/resume`}
      className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
    >
      Optimize Resume
    </a>
    <a
      href={`/applications/${app.id}/cover-letter`}
      className="px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors"
    >
      Cover Letter
    </a>
  </div>
</div>
```

- [ ] **Step 2: Two-column layout**

```tsx
<div className="grid lg:grid-cols-3 gap-6">
  {/* Main — left 2 columns */}
  <div className="lg:col-span-2 flex flex-col gap-6">
    {/* Job Description */}
    <section className="bg-card rounded-xl border border-border shadow-card p-5">
      <h2 className="text-sm font-semibold text-foreground mb-3">Job Description</h2>
      <p className="text-sm text-muted-fg whitespace-pre-wrap leading-relaxed">{app.job_description ?? 'No job description added.'}</p>
    </section>
    {/* Notes */}
    <section className="bg-card rounded-xl border border-border shadow-card p-5">
      <h2 className="text-sm font-semibold text-foreground mb-3">Notes</h2>
      {/* Editable textarea */}
    </section>
  </div>

  {/* Sidebar — right 1 column */}
  <div className="flex flex-col gap-4">
    {/* Details card */}
    <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3 text-sm">
      <h2 className="font-semibold text-foreground">Details</h2>
      <DetailRow label="Location" value={app.location} />
      <DetailRow label="Salary" value={app.salary_min ? `$${app.salary_min.toLocaleString()}–$${app.salary_max?.toLocaleString()}` : '—'} />
      <DetailRow label="Applied" value={app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'} />
      <DetailRow label="Interview" value={app.interview_date ? new Date(app.interview_date).toLocaleDateString() : '—'} color={app.interview_date ? 'text-orange-600' : undefined} />
      <DetailRow label="Follow-up" value={app.follow_up_at ? new Date(app.follow_up_at).toLocaleDateString() : '—'} />
    </div>
    {/* Contact card */}
    <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3 text-sm">
      <h2 className="font-semibold text-foreground">Contact</h2>
      <DetailRow label="Name" value={app.contact_name ?? '—'} />
      <DetailRow label="Email" value={app.contact_email ?? '—'} />
    </div>
  </div>
</div>

// Helper
function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-fg shrink-0">{label}</span>
      <span className={cn('text-right font-medium truncate', color ?? 'text-foreground')}>{value}</span>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/applications/[id]/page.tsx
git commit -m "design: implement application detail page with two-column layout"
```

---

## Task 8: Resume Library Page

**Files:**
- Modify: `src/app/(app)/resumes/page.tsx`

Grid of resume cards (2 cols on mobile, 3 on desktop). Upload button triggers file picker. Each card shows filename, label, upload date, and action buttons.

- [ ] **Step 1: Resume card design**

```tsx
function ResumeCard({ doc }: { doc: Document }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow duration-150">
      {/* Icon + label */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs text-muted-fg">{new Date(doc.created_at).toLocaleDateString()}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground truncate">{doc.label ?? 'Untitled Resume'}</p>
        <p className="text-xs text-muted-fg truncate mt-0.5">{doc.filename}</p>
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <button className="text-xs font-medium text-primary hover:underline cursor-pointer">View</button>
        <span className="text-border">·</span>
        <button className="text-xs font-medium text-destructive hover:underline cursor-pointer">Delete</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Upload drop zone**

```tsx
// Upload zone — above the grid
<div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors duration-150 cursor-pointer">
  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
    <Upload className="w-5 h-5 text-muted-fg" />
  </div>
  <div className="text-center">
    <p className="text-sm font-medium text-foreground">Upload resume</p>
    <p className="text-xs text-muted-fg mt-0.5">PDF or DOCX up to 10MB</p>
  </div>
  <input type="file" accept=".pdf,.docx" className="hidden" />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/resumes/page.tsx
git commit -m "design: implement resume library with upload zone and card grid"
```

---

## Task 9: AI Results Pages

**Files:**
- Modify: `src/app/(app)/applications/[id]/resume/page.tsx`
- Modify: `src/app/(app)/applications/[id]/cover-letter/page.tsx`

### Resume Optimizer

Match score displayed as a large circle gauge (CSS-only, no chart library). Missing keywords as pill badges. Suggestions as accordion or card list.

- [ ] **Step 1: Match score ring + missing keywords layout**

```tsx
// Match score visual — CSS ring
function MatchScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? 'text-accent' : score >= 40 ? 'text-amber-500' : 'text-destructive'
  return (
    <div className="flex flex-col items-center gap-2 p-6 bg-card rounded-xl border border-border shadow-card">
      <div className={`text-5xl font-bold tabular-nums ${color}`}>{score}</div>
      <div className="text-xs text-muted-fg uppercase tracking-wide font-medium">Match Score</div>
      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-muted mt-1">
        <div
          className={`h-full rounded-full transition-all duration-500 ${score >= 70 ? 'bg-accent' : score >= 40 ? 'bg-amber-500' : 'bg-destructive'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

// Missing keywords
function MissingKeywords({ keywords }: { keywords: string[] }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">Missing Keywords</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map(kw => (
          <span key={kw} className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
            {kw}
          </span>
        ))}
        {keywords.length === 0 && <span className="text-sm text-muted-fg">None — great match!</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Bullet suggestions card list**

```tsx
// Each suggestion — original vs rewritten
function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-fg uppercase tracking-wide">Original</span>
        <p className="text-sm text-muted-fg line-through">{suggestion.original}</p>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-accent uppercase tracking-wide">Suggested</span>
        <p className="text-sm text-foreground">{suggestion.rewritten}</p>
      </div>
      <p className="text-xs text-muted-fg italic border-t border-border pt-2">{suggestion.reason}</p>
    </div>
  )
}
```

- [ ] **Step 3: Cover Letter page layout**

```tsx
// Cover letter generate + edit page
<div className="max-w-3xl mx-auto flex flex-col gap-6">
  {/* Tone + options */}
  <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
    <h2 className="text-sm font-semibold text-foreground">Generate Cover Letter</h2>
    <div className="flex gap-3">
      <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Formal</button>
      <button className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium">Conversational</button>
    </div>
    <textarea
      placeholder="Why do you want this role? (optional)"
      className="w-full h-20 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
    />
    <button className="self-start px-5 py-2.5 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors">
      Generate Cover Letter
    </button>
  </div>

  {/* Result */}
  <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">Cover Letter</h2>
      <button className="text-xs font-medium text-primary hover:underline">Copy text</button>
    </div>
    <textarea
      className="w-full h-64 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
      placeholder="Your generated cover letter will appear here..."
    />
  </div>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/applications/[id]/resume/page.tsx src/app/(app)/applications/[id]/cover-letter/page.tsx
git commit -m "design: implement AI results pages (resume optimizer + cover letter)"
```

---

## Task 10: Loading States + Empty States

**Files:**
- Create: `src/components/ui/skeleton.tsx`

Every async page must show skeletons while data loads (>300ms). Every empty list must show an actionable empty state.

- [ ] **Step 1: Skeleton component**

```tsx
// src/components/ui/skeleton.tsx
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer',
        className
      )}
      aria-hidden="true"
    />
  )
}

// Pre-built card skeleton
export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}
```

- [ ] **Step 2: Empty state pattern (use inline wherever needed)**

```tsx
// Empty state — used on applications page, resumes page, dashboard sections
function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-fg" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-fg mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/skeleton.tsx
git commit -m "design: add Skeleton and EmptyState components"
```

---

## Verification

After all tasks:

- [ ] `npm run build` — zero type errors, zero lint warnings
- [ ] `npm run lint` — passes clean
- [ ] Manual: auth pages at 375px (single column) and 1440px (split panel)
- [ ] Manual: sidebar visible on ≥1024px, hidden below
- [ ] Manual: kanban board scrolls horizontally on mobile without breaking layout
- [ ] Manual: all 7 status badges render with correct colors in light mode
- [ ] Manual: match score ring renders correct color for <40, 40–70, ≥70 scores
- [ ] Manual: dark mode toggle — all text ≥4.5:1 contrast against dark surfaces
- [ ] Manual: all interactive elements show focus ring when keyboard-navigated
- [ ] Check: no emojis used as structural icons (Lucide only)
- [ ] Check: no hardcoded hex values in component files (tokens only)
