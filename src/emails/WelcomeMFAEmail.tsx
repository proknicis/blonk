import * as React from 'react';
import {
  Html,
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Text,
  Preview,
  Section,
} from '@react-email/components';

interface WelcomeMFAEmailProps {
  userName: string;
  mfaCode: string;
}

export const WelcomeMFAEmail = ({
  userName = 'Client',
  mfaCode = '000000',
}: WelcomeMFAEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Blonk Authentication Setup Code</Preview>
      <Body style={main}>
        <Container style={container}>
          
          <Section style={header}>
            <Text style={logoText}>BLONK<span style={logoDot}>.</span></Text>
          </Section>

          <Heading style={heading}>Establish Identity</Heading>
          
          <Text style={paragraph}>Hello {userName},</Text>
          
          <Text style={paragraph}>
            Welcome to your Blonk Sovereign Workspace. To complete your initial setup and establish your multi-factor authentication (MFA) profile, please use the following one-time code:
          </Text>
          
          <div style={codeBox}>
            <Text style={codeText}>{mfaCode}</Text>
          </div>

          <Text style={paragraph}>
            Please enter this code on your dashboard to verify your email address. This code will expire in 15 minutes.
          </Text>

          <Hr style={hr} />
          
          <Text style={footer}>
            This is a secure communication from Blonk Architecture. <br/>
            Ref: {new Date().getTime().toString()}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeMFAEmail;

// Inline Styles mapped from Blonk Sovereign Theme
const main = {
  backgroundColor: '#fafafa',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '40px auto',
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #ebebeb',
  maxWidth: '560px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
};

const header = {
  marginBottom: '24px',
};

const logoText = {
  fontSize: '24px',
  fontWeight: '900',
  letterSpacing: '-1px',
  color: '#111',
  margin: '0',
};

const logoDot = {
  color: '#34d186',
};

const heading = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#111',
  letterSpacing: '-0.5px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#444',
  marginBottom: '16px',
};

const codeBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #ebebeb',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const codeText = {
  fontSize: '32px',
  color: '#111',
  fontWeight: '900',
  letterSpacing: '8px',
  margin: '0',
};

const hr = {
  borderColor: '#ebebeb',
  margin: '32px 0 24px',
};

const footer = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#888',
};
