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

export interface AffiliateSaleNotificationEmailProps {
  appUrl: string;
  fullName: string;
  refCode: string;
  orderId: string;
  items: Array<{ name: string; quantity: number; totalPrice: number }>;
  subtotal: number;
  commissionAmount: number;
}

export default function AffiliateSaleNotificationEmail(
  props: AffiliateSaleNotificationEmailProps
) {
  const {
    appUrl,
    fullName,
    refCode,
    orderId,
    items,
    subtotal,
    commissionAmount,
  } = props;
  return (
    <Html>
      <Head />
      <Preview>You earned a commission from order {orderId}</Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          <Section style={styles.header}>
            <Img
              src={`${appUrl}/shutupnrave-wb.png`}
              alt="ShutUpNRave"
              width="140"
              height="42"
            />
            <Text style={styles.badge}>Affiliate Update</Text>
          </Section>

          <Section style={styles.section}>
            <Heading style={styles.h2}>You just earned a commission 🎉</Heading>
            <Text style={styles.text}>
              Hi {fullName}, your referral code <strong>{refCode}</strong> was
              used to purchase tickets.
            </Text>
            <Text style={styles.text}>
              Order ID: <strong>{orderId}</strong>
            </Text>
          </Section>

          <Section style={styles.panel}>
            <Text style={styles.label}>Items</Text>
            {items.map((i, idx) => (
              <Text key={idx} style={styles.text}>
                {i.name} ×{i.quantity} — ₦{i.totalPrice.toLocaleString()}
              </Text>
            ))}
          </Section>

          <Section style={styles.panel}>
            <Text style={styles.text}>
              <strong>Subtotal:</strong> ₦{subtotal.toLocaleString()}
            </Text>
            <Text style={styles.text}>
              <strong>Your Commission (10%):</strong> ₦
              {commissionAmount.toLocaleString()}
            </Text>
          </Section>

          <Section style={styles.ctaRow}>
            <Button href={`${appUrl}/affiliate`} style={styles.primaryBtn}>
              View Affiliate Dashboard
            </Button>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Thank you for being part of ShutUpNRave Affiliate Program.
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
  section: { padding: "16px 24px" },
  h2: { margin: "0 0 8px 0", fontSize: 18, lineHeight: 1.3, color: "#ffffff" },
  text: { margin: 0, color: "#e5e7eb", fontSize: 14 },
  panel: {
    margin: "8px 24px",
    padding: 16,
    background: "#0f1629",
    border: "1px solid rgba(253,199,0,0.25)",
    borderRadius: 10,
  },
  label: { color: "#cbd5e1", fontSize: 12, margin: "0 0 6px 0" },
  ctaRow: { display: "flex", gap: 8, padding: "8px 24px 24px 24px" },
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
  footer: {
    padding: "14px 24px 20px 24px",
    borderTop: "1px solid rgba(253,199,0,0.15)",
    background: "#0f1222",
  },
  footerText: { margin: 0, color: "#94a3b8", fontSize: 12 },
};


