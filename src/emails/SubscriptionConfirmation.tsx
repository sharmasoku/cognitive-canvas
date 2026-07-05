import { Column, Row, Section, Text, Heading } from "@react-email/components";
import { brand, inr } from "./brand";
import { EmailLayout } from "./EmailLayout";
import type { SubscriptionEmailPayload } from "./types";

export function SubscriptionConfirmation(sub: SubscriptionEmailPayload) {
  return (
    <EmailLayout preview={`Your ${brand.name} license subscription is active`}>
      <Heading style={h1}>License activated 🎉</Heading>
      <Text style={intro}>
        Thanks, {sub.customerName.split(" ")[0]}! Your {brand.name} enterprise license is now active.
      </Text>

      <div style={pill}>
        <span style={{ color: brand.textMuted }}>Subscription ID</span>{" "}
        <strong style={{ fontFamily: "monospace" }}>{sub.subscriptionId}</strong>
      </div>

      <Section style={{ marginTop: "20px" }}>
        <Text style={sectionLabel}>Plan</Text>
        <Row style={itemRow}>
          <Column>
            <Text style={itemName}>{sub.planName}</Text>
            <Text style={itemMeta}>Billed every {sub.billingPeriod}</Text>
          </Column>
          <Column style={{ textAlign: "right", verticalAlign: "top" }}>
            <Text style={itemPrice}>{inr(sub.priceInr)}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={deliveryBox}>
        <Text style={sectionLabel}>Renews on</Text>
        <Text style={{ ...itemPrice, color: brand.accentDark, margin: 0 }}>{sub.renewalDate}</Text>
        <Text style={{ ...itemMeta, marginTop: "4px" }}>Started {sub.startedDate}</Text>
      </Section>

      <Text style={{ ...itemMeta, marginTop: "20px" }}>
        You can view your subscription details, including days remaining until renewal, anytime from your account.
      </Text>
    </EmailLayout>
  );
}

const h1: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: brand.text,
  margin: "0 0 6px",
};
const intro: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: brand.textMuted,
  margin: "0 0 16px",
};
const pill: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: brand.bg,
  border: `1px solid ${brand.border}`,
  borderRadius: "999px",
  padding: "6px 14px",
  fontSize: "13px",
};
const sectionLabel: React.CSSProperties = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: brand.textMuted,
  margin: "0 0 8px",
};
const itemRow: React.CSSProperties = {
  borderBottom: `1px solid ${brand.border}`,
  padding: "8px 0",
};
const itemName: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: brand.text,
  margin: 0,
};
const itemMeta: React.CSSProperties = {
  fontSize: "12px",
  color: brand.textMuted,
  margin: "2px 0 0",
};
const itemPrice: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: brand.text,
  margin: 0,
};
const deliveryBox: React.CSSProperties = {
  marginTop: "20px",
  backgroundColor: brand.surfaceGreen,
  border: `1px solid ${brand.accent}33`,
  borderRadius: "12px",
  padding: "14px 16px",
};

export default SubscriptionConfirmation;
