import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { decrypt, encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  let uid: string;
  try {
    const decryptedState = decrypt(state);
    const parsedState = JSON.parse(decryptedState);
    uid = parsedState.uid;
    // Optional: check timestamp to prevent replay attacks
    if (Date.now() - parsedState.timestamp > 1000 * 60 * 10) { // 10 minutes
      return NextResponse.json({ error: 'State expired' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/api/auth/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    // Encrypt tokens before storing
    const encryptedAccessToken = tokens.access_token ? encrypt(tokens.access_token) : '';
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : '';

    // Redirect back to settings page with encrypted tokens
    const redirectUrl = new URL('/settings', request.url);
    redirectUrl.searchParams.set('gmail_connected', 'true');
    redirectUrl.searchParams.set('email', email || '');
    redirectUrl.searchParams.set('access_token', encryptedAccessToken);
    redirectUrl.searchParams.set('refresh_token', encryptedRefreshToken);
    redirectUrl.searchParams.set('expiry_date', tokens.expiry_date?.toString() || '');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.redirect(new URL('/settings?error=auth_failed', request.url));
  }
}

