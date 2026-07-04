import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { brand, logoUrl } from "./brand";

interface EmailLayoutProps {
  /** Inbox preview snippet (hidden in the body). */
  preview: string;
  children: ReactNode;
}

/**
 * Shared shell for every transactional email: branded logo header, white card
 * body, and footer. Uses inline styles only (email-client safe).
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={logoUrl()}
              alt={brand.name}
              height={40}
              style={{ margin: "0 auto", display: "block" }}
            />
          </Section>

          <Section style={card}>{children}</Section>

          <Hr style={{ borderColor: brand.border, margin: "24px 0 12px" }} />
          <Text style={footer}>
            {brand.name} · Augmented reality eyewear
            <br />
            This is an automated message — please do not reply.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: brand.bg,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "0 16px",
};

const header: React.CSSProperties = {
  background: brand.gradient,
  borderRadius: "16px 16px 0 0",
  padding: "24px 0",
  textAlign: "center",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: `1px solid ${brand.border}`,
  borderTop: "none",
  borderRadius: "0 0 16px 16px",
  padding: "28px 28px 20px",
};

const footer: React.CSSProperties = {
  color: brand.textMuted,
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center",
  margin: 0,
};
