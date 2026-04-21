'use client';

import { Suspense, useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function SettingsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [connectedEmail, setConnectedEmail] = useState('');

  useEffect(() => {
    if (!user) return;

    const checkGmailConnection = async () => {
      // Check if returning from OAuth callback
      const isConnected = searchParams.get('gmail_connected');
      if (isConnected === 'true') {
        const email = searchParams.get('email');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const expiryDate = searchParams.get('expiry_date');

        if (email && accessToken) {
          try {
            const integrationRef = doc(db, 'users', user.uid, 'integrations', 'gmail');
            await setDoc(integrationRef, {
              connected: true,
              email: email,
              accessToken: accessToken,
              refreshToken: refreshToken || null,
              expiryDate: expiryDate ? parseInt(expiryDate) : null,
              updatedAt: new Date().toISOString()
            }, { merge: true });

            setGmailStatus('connected');
            setConnectedEmail(email);
            
            // Clean up URL
            router.replace('/settings');
            return;
          } catch (error) {
            console.error("Error saving Gmail integration:", error);
          }
        }
      }

      // Otherwise, check Firestore
      try {
        const integrationRef = doc(db, 'users', user.uid, 'integrations', 'gmail');
        const docSnap = await getDoc(integrationRef);
        
        if (docSnap.exists() && docSnap.data().connected) {
          setGmailStatus('connected');
          setConnectedEmail(docSnap.data().email);
        } else {
          setGmailStatus('disconnected');
        }
      } catch (error) {
        console.error("Error checking Gmail connection:", error);
        setGmailStatus('disconnected');
      }
    };

    checkGmailConnection();
  }, [user, searchParams, router]);

  const handleConnectGmail = () => {
    if (!user) return;
    setIsConnecting(true);
    window.location.href = `/api/auth/google/login?uid=${user.uid}`;
  };

  const handleDisconnectGmail = async () => {
    if (!user) return;
    try {
      const integrationRef = doc(db, 'users', user.uid, 'integrations', 'gmail');
      await deleteDoc(integrationRef);
      setGmailStatus('disconnected');
      setConnectedEmail('');
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-dark-gray/60">Manage your personal preferences and integrations.</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-navy" />
              Gmail Integration
            </CardTitle>
            <CardDescription>
              Connect your Gmail account to send emails directly from the CRM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gmailStatus === 'loading' ? (
              <div className="text-sm text-dark-gray/60">Checking connection status...</div>
            ) : gmailStatus === 'connected' ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-green-50/50 border-green-100">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Connected</p>
                    <p className="text-sm text-green-700">{connectedEmail}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={handleConnectGmail} className="flex-1 sm:flex-none">
                    Reconnect
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnectGmail} className="flex-1 sm:flex-none">
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-light-gray/50">
                <div className="flex items-center gap-3">
                  <div className="bg-dark-gray/10 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-dark-gray/60" />
                  </div>
                  <div>
                    <p className="font-medium">Not Connected</p>
                    <p className="text-sm text-dark-gray/60">Connect to send emails to leads and customers.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleConnectGmail} 
                  disabled={isConnecting}
                  className="bg-royal hover:bg-royal/90 text-white w-full sm:w-auto"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Gmail'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-dark-gray/60">Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
    </AppLayout>
  );
}
