/**
 * Order Confirmation Email Template
 *
 * This React Email template is sent to customers after successful payment.
 *
 * Features:
 * 1. Professional branding with Cloudinary-hosted logo
 * 2. Complete order details and ticket information
 * 3. QR code for event verification (hosted on Cloudinary)
 * 4. Event details (date, time, location)
 * 5. Pricing breakdown with Nigerian Naira formatting
 * 6. Social media links and contact information
 * 7. Mobile-responsive design for all email clients
 * 8. Clear next steps for attendees
 *
 * The template is rendered to HTML server-side and sent via Resend.
 */

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
  Row,
  Column,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { OrderConfirmationEmailProps } from "@/types";

export const OrderConfirmationEmail = ({
  customerName,
  orderId,
  ticketDetails,
  subtotal,
  processingFee,
  total,
  eventDate,
  eventTime,
  eventLocation,
  qrCodeDataUrl, // Cloudinary-hosted QR code URL for email compatibility
}: OrderConfirmationEmailProps) => {
  /**
   * Formats price values to Nigerian Naira currency
   * Same formatting as used throughout the application
   *
   * @param {number} price - Price in kobo (NGN * 100)
   * @returns {string} Formatted currency string (e.g., "₦50")
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN", // Nigerian Naira
      minimumFractionDigits: 0, // No decimal places for whole numbers
    }).format(price);
  };

  // Email preview text shown in email client preview panes
  const previewText = `Your shutupnraveee 2025 tickets are confirmed! Order ${orderId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src={`https://res.cloudinary.com/dpesanzkk/image/upload/v1751798669/shutupnrave-wb_gla49b.png`}
              alt="shutupnraveee Logo"
              style={logo}
            />
          </Section>

          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🎉 Tickets Confirmed!</Heading>
            <Text style={headerSubtitle}>
              Get ready to lose your mind to the beats!
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={greeting}>Hi {customerName},</Heading>
            <Text style={paragraph}>
              Your payment has been confirmed and your tickets for{" "}
              <strong>shutupnraveee 2025</strong> are now secured! Here are your
              order details:
            </Text>

            {/* Order Information */}
            <Section style={infoBox}>
              <Heading style={infoTitle}>Order Information</Heading>
              <Text style={infoText}>
                <strong>Order ID:</strong> {orderId}
              </Text>
              <Text style={infoText}>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </Text>
            </Section>

            {/* Event Details */}
            <Section style={infoBox}>
              <Heading style={infoTitle}>Event Details</Heading>
              <Text style={infoText}>
                <strong>📅 Date:</strong> {eventDate}
              </Text>
              <Text style={infoText}>
                <strong>⏰ Time:</strong> {eventTime}
              </Text>
              <Text style={infoText}>
                <strong>📍 Location:</strong> {eventLocation}
              </Text>
            </Section>

            {/* Ticket Details */}
            <Section style={ticketBox}>
              <Heading style={infoTitle}>Ticket Details</Heading>
              {ticketDetails.map((ticket, index) => (
                <Row key={index} style={ticketRow}>
                  <Column style={ticketLeft}>
                    <Text style={ticketText}>
                      {ticket.type} × {ticket.quantity}
                    </Text>
                  </Column>
                  <Column style={ticketRight}>
                    <Text style={ticketPrice}>
                      <strong>{formatPrice(ticket.totalPrice)}</strong>
                    </Text>
                  </Column>
                </Row>
              ))}

              <Hr style={divider} />

              <Row style={ticketRow}>
                <Column style={ticketLeft}>
                  <Text style={ticketText}>Subtotal:</Text>
                </Column>
                <Column style={ticketRight}>
                  <Text style={ticketText}>{formatPrice(subtotal)}</Text>
                </Column>
              </Row>

              <Row style={ticketRow}>
                <Column style={ticketLeft}>
                  <Text style={ticketText}>Processing Fee:</Text>
                </Column>
                <Column style={ticketRight}>
                  <Text style={ticketText}>{formatPrice(processingFee)}</Text>
                </Column>
              </Row>

              <Row style={totalRow}>
                <Column style={ticketLeft}>
                  <Text style={totalText}>Total Paid:</Text>
                </Column>
                <Column style={ticketRight}>
                  <Text style={totalAmount}>{formatPrice(total)}</Text>
                </Column>
              </Row>
            </Section>

            {/* QR Code Section */}
            <Section style={qrCodeBox}>
              <Heading style={qrCodeTitle}>📱 Your Digital Ticket</Heading>
              <Text style={qrCodeText}>
                Scan this QR code at the entrance for instant verification and
                order details
              </Text>
              <Section style={qrCodeContainer}>
                <Img
                  src={qrCodeDataUrl}
                  alt={`QR Code linking to admin verification for Order ${orderId}`}
                  style={qrCodeImage}
                />
                <Text style={qrCodeOrderId}>Order ID: {orderId}</Text>
                {/* <Text style={qrCodeUrl}>
                  QR code links to admin verification system
                </Text> */}
              </Section>
            </Section>

            {/* What's Next */}
            <Section style={nextStepsBox}>
              <Heading style={nextStepsTitle}>📱 What's Next?</Heading>
              <ul style={nextStepsList}>
                <li style={nextStepsItem}>
                  Save this email - it's your proof of purchase
                </li>
                <li style={nextStepsItem}>
                  Show your QR code at the entrance for quick entry
                </li>
                <li style={nextStepsItem}>Arrive 30 minutes early for entry</li>
                <li style={nextStepsItem}>
                  <strong>Join our WhatsApp channel</strong> for exclusive updates, lineup announcements, and behind-the-scenes content!
                  <br />
                  <Button
                    style={whatsappInlineButton}
                    href="https://whatsapp.com/channel/0029VbB4q2eEFeXq2H1ZCt12"
                  >
                    📱 Join WhatsApp Channel
                  </Button>
                </li>
                <li style={nextStepsItem}>
                  Get ready for an unforgettable night!
                </li>
              </ul>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Heading style={footerTitle}>
              Can't wait to see you there! 🎵
            </Heading>
            <Text style={footerText}>
              Follow us on social media and join our WhatsApp channel for exclusive updates, 
              lineup announcements, and behind-the-scenes content
            </Text>
            <Section style={socialLinks}>
              <Button
                style={socialButton}
                href="https://www.instagram.com/shutupnraveee"
              >
                Instagram
              </Button>
              <Button style={socialButton} href="https://x.com/shutupnraveee">
                X
              </Button>
              <Button style={socialButton} href="#">
                TikTok
              </Button>
              {/* <Button
                style={whatsappButton}
                href="https://whatsapp.com/channel/0029VbB4q2eEFeXq2H1ZCt12"
              >
                📱 WhatsApp Channel
              </Button> */}
            </Section>
          </Section>

          {/* Contact */}
          <Section style={contact}>
            <Text style={contactText}>
              shutupnraveee Team
              <br />
              Questions? Contact us at support@shutupnrave.com.ng
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily: "Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const logo = {
  width: "200px",
  height: "auto",
  margin: "0 auto",
};

const header = {
  background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
  padding: "30px",
  borderRadius: "15px",
  marginBottom: "30px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#FFD700",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const headerSubtitle = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "10px 0 0 0",
};

const content = {
  backgroundColor: "#f9f9f9",
  padding: "25px",
  borderRadius: "10px",
  marginBottom: "25px",
};

const greeting = {
  color: "#333",
  fontSize: "20px",
  marginTop: "0",
};

const paragraph = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "15px 0",
};

const infoBox = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  borderLeft: "4px solid #FFD700",
  margin: "20px 0",
};

const infoTitle = {
  color: "#333",
  fontSize: "18px",
  margin: "0 0 15px 0",
};

const infoText = {
  color: "#333",
  fontSize: "14px",
  margin: "5px 0",
};

const ticketBox = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
};

const ticketRow = {
  width: "100%",
  margin: "10px 0",
};

const ticketLeft = {
  textAlign: "left" as const,
  width: "70%",
};

const ticketRight = {
  textAlign: "right" as const,
  width: "30%",
};

const ticketText = {
  color: "#333",
  fontSize: "14px",
  margin: "0",
};

const ticketPrice = {
  color: "#333",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
};

const divider = {
  borderColor: "#FFD700",
  opacity: 0.3,
  margin: "15px 0",
};

const totalRow = {
  width: "100%",
  margin: "15px 0 0 0",
};

const totalText = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
};

const totalAmount = {
  color: "#FFD700",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
};

const nextStepsBox = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
};

const nextStepsTitle = {
  color: "#8e6a00",
  fontSize: "16px",
  margin: "0 0 10px 0",
};

const nextStepsList = {
  margin: "10px 0",
  paddingLeft: "20px",
  color: "#8e6a00",
};

const nextStepsItem = {
  margin: "5px 0",
  fontSize: "14px",
};

const qrCodeBox = {
  backgroundColor: "#fff",
  border: "2px solid #FFD700",
  padding: "25px",
  borderRadius: "12px",
  margin: "25px 0",
  textAlign: "center" as const,
};

const qrCodeTitle = {
  color: "#333",
  fontSize: "20px",
  margin: "0 0 10px 0",
  fontWeight: "bold",
};

const qrCodeText = {
  color: "#666",
  fontSize: "14px",
  margin: "0 0 20px 0",
};

const qrCodeContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const qrCodeImage = {
  width: "200px",
  height: "200px",
  border: "3px solid #FFD700",
  borderRadius: "8px",
  margin: "0 auto 15px auto",
};

const qrCodeOrderId = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
  fontFamily: "monospace",
};

const qrCodeUrl = {
  color: "#666",
  fontSize: "12px",
  margin: "5px 0 0 0",
  fontStyle: "italic",
};

const footer = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "25px",
  borderRadius: "10px",
  textAlign: "center" as const,
};

const footerTitle = {
  color: "#FFD700",
  fontSize: "18px",
  margin: "0 0 15px 0",
};

const footerText = {
  color: "#fff",
  fontSize: "14px",
  margin: "10px 0",
};

const socialLinks = {
  margin: "20px 0",
  textAlign: "center" as const,
};

const socialButton = {
  backgroundColor: "transparent",
  color: "#FFD700",
  textDecoration: "none",
  margin: "0 10px",
  fontSize: "14px",
};

const whatsappButton = {
  backgroundColor: "#25D366",
  color: "#ffffff",
  textDecoration: "none",
  margin: "10px 5px",
  padding: "8px 16px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "bold",
  border: "none",
  display: "inline-block",
};

const whatsappInlineButton = {
  backgroundColor: "#25D366",
  color: "#ffffff",
  textDecoration: "none",
  margin: "8px 0 5px 0",
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "bold",
  border: "none",
  display: "inline-block",
  textAlign: "center" as const,
};

const contact = {
  textAlign: "center" as const,
  marginTop: "30px",
};

const contactText = {
  color: "#666",
  fontSize: "12px",
  lineHeight: "1.4",
};

export default OrderConfirmationEmail;
