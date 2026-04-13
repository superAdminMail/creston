import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type VerifyEmailTemplateProps = {
  verifyUrl: string;
  expiresInMinutes: number;
  siteName?: string;
  siteLogoUrl?: string | null;
};

export default function VerifyEmailTemplate({
  verifyUrl,
  expiresInMinutes,
  siteName = "Company",
  siteLogoUrl,
}: VerifyEmailTemplateProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Verify your email for {siteName}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            {siteLogoUrl ? (
              <Img
                src={siteLogoUrl}
                alt={siteName}
                width="96"
                height="96"
                style={logo}
              />
            ) : (
              <Text style={brand}>{siteName}</Text>
            )}

            <Text style={heading}>Verify your email</Text>

            <Text style={paragraph}>
              Confirm your email address to secure your account and continue
              using {siteName}.
            </Text>

            <Section style={buttonRow}>
              <Button href={verifyUrl} style={button}>
                Verify Email
              </Button>
            </Section>

            <Text style={muted}>
              This link will expire in {expiresInMinutes} minutes.
            </Text>

            <Text style={small}>
              If the button does not work, copy and paste this link into your
              browser:
            </Text>

            <Link href={verifyUrl} style={link}>
              {verifyUrl}
            </Link>

            <Text style={footer}>
              If you did not create this account, you can safely ignore this
              email.
            </Text>
          </Section>

          <Text style={copyright}>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  margin: 0,
  padding: "40px 16px",
  backgroundColor: "#050B1F",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "480px",
  margin: "0 auto",
};

const card: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(5,11,31,0.99))",
  borderRadius: "16px",
  padding: "32px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
};

const brand: React.CSSProperties = {
  margin: "0 0 20px",
  textAlign: "center",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: "28px",
  color: "#F8FAFC",
  letterSpacing: "0.5px",
};

const logo: React.CSSProperties = {
  display: "block",
  margin: "0 auto 20px",
  borderRadius: "18px",
  objectFit: "cover",
};

const heading: React.CSSProperties = {
  margin: "0 0 12px",
  textAlign: "center",
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "30px",
  color: "#F8FAFC",
};

const paragraph: React.CSSProperties = {
  margin: "0 0 20px",
  textAlign: "center",
  fontSize: "14px",
  lineHeight: "24px",
  color: "#94A3B8",
};

const buttonRow: React.CSSProperties = {
  textAlign: "center",
  padding: "8px 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#2563EB",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: 500,
  textDecoration: "none",
  borderRadius: "10px",
  padding: "12px 24px",
  display: "inline-block",
};

const muted: React.CSSProperties = {
  margin: "0 0 20px",
  textAlign: "center",
  fontSize: "13px",
  lineHeight: "20px",
  color: "#64748B",
};

const small: React.CSSProperties = {
  margin: "0 0 8px",
  textAlign: "center",
  fontSize: "12px",
  lineHeight: "20px",
  color: "#475569",
};

const link: React.CSSProperties = {
  display: "block",
  textAlign: "center",
  fontSize: "12px",
  lineHeight: "20px",
  color: "#3B82F6",
  wordBreak: "break-all",
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  margin: "24px 0 0",
  textAlign: "center",
  fontSize: "12px",
  lineHeight: "20px",
  color: "#475569",
};

const copyright: React.CSSProperties = {
  margin: "24px 0 0",
  textAlign: "center",
  fontSize: "11px",
  lineHeight: "16px",
  color: "#334155",
};
