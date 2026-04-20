import { Resend } from 'resend';
import * as React from 'react';

// Initialize the Resend client with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Utility to send a standard email using Resend
 * 
 * @param to recipient email address (can be an array of strings for multiple)
 * @param subject Email subject
 * @param Component React component containing the email template
 * @param from (optional) Sender email address. Must be a verified domain in Resend.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  Component: React.ReactElement,
  from: string = 'Blonk Alerts <alerts@manadavana.lv>'
): Promise<EmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react: Component,
    });

    if (error) {
      console.error('Resend encountered an error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to send email:', err);
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}
