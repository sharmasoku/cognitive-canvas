import { Column, Heading, Row, Section, Text } from "@react-email/components";
import { brand, inr } from "./brand";
import { EmailLayout } from "./EmailLayout";
import type { OrderEmailPayload } from "./types";

export function OrderConfirmation(order: OrderEmailPayload) {
  const { shippingAddress: addr } = order;
  return (
    <EmailLayout preview={`Order ${order.orderId} confirmed — thank you!`}>
      <Heading style={h1}>Order confirmed 🎉</Heading>
      <Text style={intro}>
        Thanks for your order, {addr.fullName.split(" ")[0]}! Your TeleAR shipment is being
        prepared. Here are the details.
      </Text>

      <div style={pill}>
        <span style={{ color: brand.textMuted }}>Order ID</span>{" "}
        <strong style={{ fontFamily: "monospace" }}>{order.orderId}</strong>
      </div>

      {/* Items */}
      <Section style={{ marginTop: "20px" }}>
        <Text style={sectionLabel}>Items</Text>
        {order.items.map((item, i) => (
          <Row key={i} style={itemRow}>
            <Column>
              <Text style={itemName}>{item.name}</Text>
              <Text style={itemMeta}>
                Qty {item.qty} · {inr(item.unitPrice)} each
              </Text>
            </Column>
            <Column style={{ textAlign: "right", verticalAlign: "top" }}>
              <Text style={itemPrice}>{inr(item.lineTotal)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Totals */}
      <Section style={{ marginTop: "8px" }}>
        <TotalRow label="Subtotal" value={inr(order.subtotal)} />
        {order.discount > 0 && (
          <TotalRow label="Discount" value={`- ${inr(order.discount)}`} accent />
        )}
        <TotalRow label="Shipping" value={order.shipping === 0 ? "Free" : inr(order.shipping)} />
        <TotalRow label="Tax (18% GST)" value={inr(order.tax)} />
        <div style={{ borderTop: `1px solid ${brand.border}`, margin: "8px 0" }} />
        <TotalRow label="Total" value={inr(order.total)} bold />
        {order.paymentPlan === "partial" && order.amountDueLater ? (
          <>
            <TotalRow label="Paid now" value={inr(order.amountPaidNow ?? 0)} accent />
            <TotalRow label="Due on delivery" value={inr(order.amountDueLater)} bold />
          </>
        ) : null}
      </Section>

      {/* Delivery + address */}
      <Section style={deliveryBox}>
        <Text style={sectionLabel}>Estimated delivery</Text>
        <Text style={{ ...itemPrice, color: brand.accentDark, margin: 0 }}>
          {order.estimatedDate}
        </Text>
        <Text style={{ ...itemMeta, marginTop: "4px" }}>
          {order.deliverySpeed === "priority" ? "Priority" : "Standard"} shipping
        </Text>
      </Section>

      <Section style={{ marginTop: "16px" }}>
        <Text style={sectionLabel}>Shipping to</Text>
        <Text style={addressText}>
          {addr.fullName}
          <br />
          {addr.address}
          <br />
          {addr.city} {addr.postalCode}
          <br />
          {addr.phone}
        </Text>
      </Section>
    </EmailLayout>
  );
}

function TotalRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <Row style={{ padding: "3px 0" }}>
      <Column>
        <Text
          style={{
            ...totalCell,
            fontWeight: bold ? 700 : 400,
            fontSize: bold ? "16px" : "14px",
          }}
        >
          {label}
        </Text>
      </Column>
      <Column style={{ textAlign: "right" }}>
        <Text
          style={{
            ...totalCell,
            fontWeight: bold ? 700 : 500,
            fontSize: bold ? "16px" : "14px",
            color: accent ? brand.accentDark : brand.text,
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
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
const totalCell: React.CSSProperties = { color: brand.text, margin: 0 };
const deliveryBox: React.CSSProperties = {
  marginTop: "20px",
  backgroundColor: brand.surfaceGreen,
  border: `1px solid ${brand.accent}33`,
  borderRadius: "12px",
  padding: "14px 16px",
};
const addressText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "20px",
  color: brand.text,
  margin: 0,
};

export default OrderConfirmation;
