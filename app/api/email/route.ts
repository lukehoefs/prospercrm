import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { google } from 'googleapis';
import { decrypt, encrypt } from '@/lib/encryption';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, text, replyTo, gmailIntegration } = await request.json();

    // Check for Gmail integration
    if (gmailIntegration && gmailIntegration.connected && gmailIntegration.accessToken) {
      const accessToken = decrypt(gmailIntegration.accessToken);
      const refreshToken = gmailIntegration.refreshToken ? decrypt(gmailIntegration.refreshToken) : null;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/api/auth/google/callback`
      );

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: gmailIntegration.expiryDate
      });

      // Note: Since we are passing tokens from the client, if they refresh here, 
      // we ideally want to send the new encrypted tokens back to the client to save.
      // For simplicity in this prototype, we'll let googleapis handle the refresh in memory for this request.
      // A more robust solution would return the new tokens in the response.

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Construct email message
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        text
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      // If tokens were refreshed, we should ideally return them
      const currentCredentials = oauth2Client.credentials;
      let newTokens = null;
      if (currentCredentials.access_token !== accessToken) {
        newTokens = {
          accessToken: encrypt(currentCredentials.access_token!),
          refreshToken: currentCredentials.refresh_token ? encrypt(currentCredentials.refresh_token) : gmailIntegration.refreshToken,
          expiryDate: currentCredentials.expiry_date
        };
      }

      return NextResponse.json({ 
        success: true, 
        messageId: res.data.id, 
        provider: 'gmail',
        newTokens 
      });
    }

    // Fallback to Resend
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'No email provider configured. Please connect Gmail in Settings.' },
        { status: 500 }
      );
    }

    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';

    const data = await resend.emails.send({
      from: `Prosper Manufacturing OS <${fromAddress}>`,
      to,
      reply_to: replyTo,
      subject,
      text,
    });

    return NextResponse.json({ success: true, data, provider: 'resend' });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
