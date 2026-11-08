import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 56, fontFamily: "Helvetica", fontSize: 10.5, lineHeight: 1.5, color: "#1a1a1a" },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 16 },
  paragraph: { marginBottom: 8 },
})

/** Plain text document that flows across as many pages as it needs. */
export function TextDocumentPDF({ title, body }: { title: string; body: string }) {
  return (
    <Document title={title}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {body.split(/\n\n+/).map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p.trim()}
          </Text>
        ))}
      </Page>
    </Document>
  )
}
