export function isDemoUser(user: { email?: string | null }): boolean {
  const demo = process.env.DEMO_EMAIL?.trim().toLowerCase()
  return !!demo && user.email?.trim().toLowerCase() === demo
}
