import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    marginBottom: 24,
  },
  paragraph: {
    marginBottom: 12,
  },
})

interface CoverLetterPDFProps {
  coverLetter: string
  company: string
  role: string
}

export function CoverLetterPDF({ coverLetter, company, role }: CoverLetterPDFProps) {
  const paragraphs = coverLetter.split(/\n\n+/).filter(Boolean)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Cover Letter</Text>
          <Text style={styles.subtitle}>
            {role} at {company}
          </Text>
        </View>
        <View style={styles.divider} />
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p.trim()}
          </Text>
        ))}
      </Page>
    </Document>
  )
}
