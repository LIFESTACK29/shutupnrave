import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface AffiliateWelcomeEmailProps {
  appUrl: string;
  fullName: string;
  refCode: string;
  link: string;
  email: string;
  temporaryPassword?: string;
}

export function AffiliateWelcomeEmail({
  appUrl,
  fullName,
  refCode,
  link,
  email,
  temporaryPassword,
}: AffiliateWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your ShutUpNRave affiliate link is ready</Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          <Section style={styles.header}>
            <Img
              src={`${appUrl}/shutupnrave-wb.png`}
              alt="ShutUpNRave"
              width="140"
              height="42"
            />
            <Text style={styles.badge}>Affiliate Program</Text>
          </Section>

          <Section style={styles.section}>
            <Heading style={styles.h2}>Your Affiliate Link is Ready</Heading>
            <Text style={styles.muted}>
              Hello {fullName}, your unique affiliate link has been created.
              Share it and earn commissions on eligible ticket sales.
            </Text>
          </Section>

          <Section style={styles.panel}>
            <Text style={styles.label}>Your referral link</Text>
            <Button href={link} style={styles.primaryBtn}>
              Copy / Open Link
            </Button>
            <Text style={styles.url}>{link}</Text>
          </Section>

          <Section style={styles.panel}>
            <Text style={styles.label}>Your referral code</Text>
            <Text style={styles.code}>{refCode}</Text>
          </Section>

          {temporaryPassword ? (
            <Section style={styles.panel}>
              <Text style={styles.label}>Affiliate Portal Credentials</Text>
              <Text style={styles.text}>
                Email: <strong>{email}</strong>
              </Text>
              <Text style={styles.text}>
                Password: <strong>{temporaryPassword}</strong>
              </Text>
            </Section>
          ) : null}

          <Section style={styles.ctaRow}>
            <Button
              href={`${appUrl}/affiliate/login`}
              style={styles.primaryBtn}
            >
              Affiliate Login
            </Button>
            {/* <Button href={`${appUrl}/affiliate`} style={styles.ghostBtn}>Open Dashboard</Button> */}
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You&apos;re receiving this because an admin created your affiliate
              access on ShutUpNRave. If this wasn&apos;t you, please ignore.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { background: "#0b0b0b", padding: "24px 0" },
  card: {
    maxWidth: "640px",
    margin: "0 auto",
    background: "#111827",
    borderRadius: 12,
    border: "1px solid rgba(253,199,0,0.2)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    background: "#0f1222",
    borderBottom: "1px solid rgba(253,199,0,0.15)",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    background: "#FDC700",
    color: "#0b0b0b",
    fontWeight: 700 as const,
    borderRadius: 999,
    fontSize: 12,
  },
  section: { padding: "24px 24px 8px 24px" },
  h2: { margin: "0 0 8px 0", fontSize: 22, lineHeight: 1.3, color: "#ffffff" },
  muted: { margin: 0, color: "#cbd5e1", fontSize: 14 },
  panel: {
    margin: "8px 24px",
    padding: 16,
    background: "#0f1629",
    border: "1px solid rgba(253,199,0,0.25)",
    borderRadius: 10,
  },
  label: { color: "#cbd5e1", fontSize: 12, margin: "0 0 6px 0" },
  primaryBtn: {
    display: "inline-block",
    background: "#FDC700",
    color: "#0b0b0b",
    fontWeight: 700 as const,
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 14,
  },
  ghostBtn: {
    display: "inline-block",
    color: "#FDC700",
    border: "1px solid rgba(253,199,0,0.6)",
    background: "transparent",
    fontWeight: 700 as const,
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 14,
  },
  url: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 10,
    wordBreak: "break-all" as const,
  },
  code: {
    color: "#FDC700",
    fontWeight: 800 as const,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  text: { color: "#e5e7eb", fontSize: 14, margin: 0 },
  ctaRow: { display: "flex", gap: 8, padding: "8px 24px 24px 24px" },
  footer: {
    padding: "14px 24px 20px 24px",
    borderTop: "1px solid rgba(253,199,0,0.15)",
    background: "#0f1222",
  },
  footerText: { margin: 0, color: "#94a3b8", fontSize: 12 },
};

export default AffiliateWelcomeEmail;


