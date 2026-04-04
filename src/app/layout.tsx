import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "ApplicantOS — AI Job Application Tracker",
  description:
    "Track every application, optimize your resume with AI, and generate tailored cover letters.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
