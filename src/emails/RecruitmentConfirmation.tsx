import { Heading, Section, Text } from "@react-email/components";
import { brand } from "./brand";
import { EmailLayout } from "./EmailLayout";
import type { RecruitmentEmailPayload } from "./types";

export function RecruitmentConfirmation(app: RecruitmentEmailPayload) {
  const firstName = app.fullName.split(" ")[0] || "there";
  return (
    <EmailLayout preview="We've received your TeleARGlass application">
      <Heading style={h1}>Application received ✅</Heading>
      <Text style={intro}>
        Hi {firstName}, thank you for applying to join the {brand.name} team. We've received your
        application and our recruitment team will review it shortly. If it's a match, we'll reach
        out to the contact details below.
      </Text>

      <Section style={box}>
        <Text style={label}>Summary of what you submitted</Text>
        <Field k="Name" v={app.fullName} />
        <Field k="Email" v={app.email} />
        <Field k="Contact" v={app.contact} />
        <Field k="Message" v={app.message} />
      </Section>

      <Text style={outro}>
        No action is needed from you right now. We appreciate your interest in building the future
        of augmented reality with us.
      </Text>
    </EmailLayout>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <Text style={fieldRow}>
      <span style={{ color: brand.textMuted }}>{k}: </span>
      <span style={{ color: brand.text, fontWeight: 500 }}>{v}</span>
    </Text>
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
const box: React.CSSProperties = {
  backgroundColor: brand.bg,
  border: `1px solid ${brand.border}`,
  borderRadius: "12px",
  padding: "16px 18px",
};
const label: React.CSSProperties = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: brand.textMuted,
  margin: "0 0 8px",
};
const fieldRow: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 6px",
};
const outro: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: brand.textMuted,
  margin: "16px 0 0",
};

export default RecruitmentConfirmation;
