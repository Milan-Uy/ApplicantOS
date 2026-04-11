interface Props {
  company: string
  role: string
  interviewDate: string // e.g. "Monday, April 7, 2026"
  applicationUrl: string
}

export function InterviewReminderEmail({
  company,
  role,
  interviewDate,
  applicationUrl,
}: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 560, margin: "0 auto", color: "#0C4A6E" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Interview tomorrow: {role} at {company}
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#374151" }}>
        Your interview for <strong>{role}</strong> at <strong>{company}</strong> is scheduled
        for <strong>{interviewDate}</strong>.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#374151" }}>
        Make sure you&apos;re prepared — review the job description, your tailored resume, and cover letter.
      </p>
      <a
        href={applicationUrl}
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "10px 20px",
          backgroundColor: "#0369A1",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        View Application
      </a>
      <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 32 }}>
        You received this reminder because you have an interview scheduled in ApplicantOS.
      </p>
    </div>
  )
}
