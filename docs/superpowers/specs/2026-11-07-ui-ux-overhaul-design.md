# UI/UX Overhaul — Design

Decided in a grilling session on 2026-11-07. Implementation plan: `docs/superpowers/plans/2026-11-07-ui-ux-overhaul.md`.

## Purpose

ApplicantOS is a personal portfolio project, shown live in job interviews. Optimise for a smooth, credible live demo and a strong first impression, not first-run onboarding. Pain, ranked: (1) core flows are slow/clunky, (2) inconsistency across pages.

## Decisions

| # | Decision |
|---|----------|
| Identity | Keep the dark Linear-inspired identity: indigo `#5e6ad2` primary, Inter Variable `cv01`/`ss03`. Refine and apply consistently; no rebrand. |
| Theme | Dark-only. Light mode out of scope. |
| Mobile | Usable but secondary for app pages. Landing must work at phone width (interviewers open links on phones). |
| Shape | Small shippable increments, one PR each, foundations first. |
| Primitives | Adopt real shadcn/ui (Radix) as the single source of Button, Input, Textarea, Select, Card, Dialog, AlertDialog, Switch, Tabs, Label, Tooltip — mapped onto existing tokens. |
| Feedback | Sonner toast on every in-place mutation; `error.tsx` + `not-found.tsx` (root and `(app)`); AlertDialog replaces `confirm()`; job dismiss becomes undo toast; `loading.tsx` for every `(app)` route. |
| Demo story | Discovered job or new application → optimise resume → generate cover letter → drag on kanban → dashboard. These flows get the deepest polish. |
| AI wait | Resume optimise: staged progress skeleton (structured output unchanged). Cover letter: streamed via `streamText`. |
| Behaviour fixes | After create, land on the new record. Resume picker on both AI pages. Cover-letter edits persist. Copy actions on resume results. Login success delay cut from 2.8 s. Remove fake job-discovery status. Fix AI pages' "Edit application" link. |
| Storage | AWS S3 trial expired: move to Supabase Storage (private bucket, server-signed URLs, same `resumes/{user_id}/` prefix guard). Documents whose files are gone show a "file unavailable" state. |
| Job discovery | n8n trial expired: keep the page with seeded results and an honest "Automation paused" state. Rebuilding the pipeline is a separate later project. |
| Landing | Make responsive, cut infinite animations to at most two, move inline styles to tokens/Tailwind. Copy and structure unchanged. Add "Try the demo". |
| Demo account | Seeded demo user (applications across all statuses, resumes with real PDFs, AI results, discovered jobs), one-click demo login, daily reset cron plus manual `npm run demo:reset`. |
| Verification | Playwright screenshots of every route at 1440 px and 390 px before/after each increment, axe check per route, `npm run build` + `npm run lint`. Final screenshots double as portfolio assets. |

## Out of scope

Light mode · forgot-password · AI result history · rebuilding the job-discovery pipeline · DB schema changes (column `documents.s3_key` keeps its name).

## Done when

Every page has loading, empty and error states; uses shared primitives with no one-off styling; the add-application flow and the AI flows each take fewer clicks; axe reports no serious/critical violations on any route; before/after screenshots exist for every page.
