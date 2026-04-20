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
  Button,
} from '@react-email/components';

interface ActionRequiredEmailProps {
  userName: string;
  workflowName: string;
  actionMessage: string;
  actionUrl: string;
}

// A highly professional, institutional-grade email template matching Blonk UI.
export const ActionRequiredEmail = ({
  userName = 'Client',
  workflowName = 'Intake Automation',
  actionMessage = 'A document requires your counter-signature before the workflow can proceed.',
  actionUrl = 'https://manadavana.lv/dashboard',
}: ActionRequiredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Blonk Workflow Alert: Action Required</Preview>
      <Body style={main}>
        <Container style={container}>
          
          <Section style={header}>
            <Text style={logoText}>BLONK<span style={logoDot}>.</span></Text>
          </Section>

          <Heading style={heading}>Action Required</Heading>
          
          <Text style={paragraph}>Hello {userName},</Text>
          
          <Text style={paragraph}>
            Your automated workflow <strong>"{workflowName}"</strong> is currently paused and awaiting your input.
          </Text>
          
          <div style={alertBox}>
            <Text style={alertMessage}>{actionMessage}</Text>
          </div>

          <Section style={btnContainer}>
            <Button style={button} href={actionUrl}>
              Complete Action
            </Button>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            This is an automated notification from Blonk Workspace. <br/>
            Ref: {new Date().getTime().toString()}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ActionRequiredEmail;

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

const alertBox = {
  backgroundColor: '#f8fafc',
  borderLeft: '4px solid #34d186',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const alertMessage = {
  fontSize: '15px',
  color: '#111',
  fontWeight: '600',
  margin: '0',
};

const btnContainer = {
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#111111',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '14px',
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
