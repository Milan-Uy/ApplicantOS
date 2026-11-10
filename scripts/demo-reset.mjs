// Manual demo reset: `npm run demo:reset` asks the deployed app (NEXT_PUBLIC_APP_URL) to reset DEMO_EMAIL.
const secret = process.env.CRON_SECRET?.trim()
if (!secret) {
  console.error("CRON_SECRET is blank; set it in .env.local")
  process.exit(1)
}
const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/demo-reset`, {
  headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
})
console.log(res.status, await res.text())
if (res.status !== 200) process.exit(1)
