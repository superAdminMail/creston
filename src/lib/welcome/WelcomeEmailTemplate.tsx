import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type WelcomeEmailTemplateProps = {
  firstName: string;
  onboardingUrl: string;
  siteName?: string;
  siteLogoUrl?: string | null;
};

export default function WelcomeEmailTemplate({
  firstName,
  onboardingUrl,
  siteName = "Company",
  siteLogoUrl,
}: WelcomeEmailTemplateProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to {siteName} - let&apos;s get you started</Preview>

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

            <Text style={heading}>Welcome to {siteName}</Text>

            <Text style={paragraph}>Hi {firstName},</Text>

            <Text style={paragraph}>
              Welcome to {siteName} - your account has been successfully
              verified.
            </Text>

            <Text style={paragraph}>
              We&apos;re glad to have you on board.
            </Text>

            <Text style={paragraph}>
              To start using your account and unlock all features, please
              complete your onboarding. This helps us tailor your experience
              and ensures your account is fully ready for funding and
              investments.
            </Text>

            <Section style={buttonRow}>
              <Button href={onboardingUrl} style={button}>
                Complete your onboarding
              </Button>
            </Section>

            <Text style={sectionHeading}>What to expect next:</Text>

            <Text style={bullet}>- Set up your investment profile</Text>
            <Text style={bullet}>- Provide basic verification details (KYC)</Text>
            <Text style={bullet}>
              - Get access to your dashboard and available investment options
            </Text>

            <Text style={paragraph}>
              Your security and data protection remain a top priority. All
              information is handled securely and in compliance with regulatory
              standards.
            </Text>

            <Text style={paragraph}>
              If you have any questions, our support team is always available.
            </Text>

            <Text style={paragraph}>
              Welcome again - we look forward to helping you grow with
              confidence.
            </Text>

            <Text style={paragraph}>- The {siteName} Team</Text>

            <Text style={small}>
              If the button does not work, copy and paste this link into your
              browser:
            </Text>

            <Link href={onboardingUrl} style={link}>
              {onboardingUrl}
            </Link>
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
  margin: "0 0 18px",
  textAlign: "center",
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "30px",
  color: "#F8FAFC",
};

const paragraph: React.CSSProperties = {
  margin: "0 0 16px",
  textAlign: "left",
  fontSize: "14px",
  lineHeight: "24px",
  color: "#94A3B8",
};

const sectionHeading: React.CSSProperties = {
  margin: "12px 0 10px",
  textAlign: "left",
  fontSize: "14px",
  lineHeight: "22px",
  fontWeight: 600,
  color: "#E2E8F0",
};

const bullet: React.CSSProperties = {
  margin: "0 0 10px",
  textAlign: "left",
  fontSize: "14px",
  lineHeight: "24px",
  color: "#CBD5E1",
};

const buttonRow: React.CSSProperties = {
  textAlign: "center",
  padding: "12px 0 24px",
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

const small: React.CSSProperties = {
  margin: "14px 0 8px",
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

const copyright: React.CSSProperties = {
  margin: "24px 0 0",
  textAlign: "center",
  fontSize: "11px",
  lineHeight: "16px",
  color: "#334155",
};
