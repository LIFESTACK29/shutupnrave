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

interface OrderItemRow {
  name: string;
  quantity: number;
  totalPrice: number;
}

export interface AdminOrderNotificationEmailProps {
  appUrl: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItemRow[];
  subtotal: number;
  discountCode?: string | null;
  discountAmount?: number;
  processingFee: number;
  total: number;
  affiliateAttributed?: boolean;
}

export default function AdminOrderNotificationEmail(props: AdminOrderNotificationEmailProps) {
  const {
    appUrl,
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    subtotal,
    discountCode,
    discountAmount,
    processingFee,
    total,
    affiliateAttributed,
  } = props;

  return (
    <Html>
      <Head />
      <Preview>New ticket order {orderId}</Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          <Section style={styles.header}>
            <Img src={`${appUrl}/shutupnrave-wb.png`} alt="ShutUpNRave" width="140" height="42" />
            <Text style={styles.badge}>New Order</Text>
          </Section>

          <Section style={styles.section}>
            <Heading style={styles.h2}>Order {orderId}</Heading>
            <Text style={styles.text}><strong>Customer:</strong> {customerName} ({customerEmail}, {customerPhone})</Text>
            {affiliateAttributed ? (
              <Text style={styles.text}><strong>Affiliate:</strong> Attributed</Text>
            ) : null}
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
            <Text style={styles.text}><strong>Subtotal:</strong> ₦{subtotal.toLocaleString()}</Text>
            {typeof discountAmount === 'number' && discountAmount > 0 && (
              <Text style={styles.text}>
                <strong>Discount{discountCode ? ` (${discountCode})` : ''}:</strong> -₦{discountAmount.toLocaleString()}
              </Text>
            )}
            <Text style={styles.text}><strong>Processing Fee:</strong> ₦{processingFee.toLocaleString()}</Text>
            <Text style={styles.text}><strong>Total:</strong> ₦{total.toLocaleString()}</Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>Generated automatically by ShutUpNRave system.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { background: "#0b0b0b", padding: "24px 0" },
  card: { maxWidth: "640px", margin: "0 auto", background: "#111827", borderRadius: 12, border: "1px solid rgba(253,199,0,0.2)", overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, background: "#0f1222", borderBottom: "1px solid rgba(253,199,0,0.15)" },
  badge: { display: "inline-block", padding: "6px 10px", background: "#FDC700", color: "#0b0b0b", fontWeight: 700 as const, borderRadius: 999, fontSize: 12 },
  section: { padding: "16px 24px" },
  h2: { margin: "0 0 8px 0", fontSize: 18, lineHeight: 1.3, color: "#ffffff" },
  text: { margin: 0, color: "#e5e7eb", fontSize: 14 },
  panel: { margin: "8px 24px", padding: 16, background: "#0f1629", border: "1px solid rgba(253,199,0,0.25)", borderRadius: 10 },
  label: { color: "#cbd5e1", fontSize: 12, margin: "0 0 6px 0" },
  footer: { padding: "14px 24px 20px 24px", borderTop: "1px solid rgba(253,199,0,0.15)", background: "#0f1222" },
  footerText: { margin: 0, color: "#94a3b8", fontSize: 12 },
};




