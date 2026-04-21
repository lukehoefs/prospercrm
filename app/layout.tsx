import type {Metadata} from 'next';
import { Blinker, Inter } from 'next/font/google';
import './globals.css'; // Global styles
import { AuthProvider } from '@/components/AuthProvider';

const blinker = Blinker({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-blinker',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Prosper Manufacturing OS',
  description: 'Operator-grade CRM, quoting, production, and fulfillment platform.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${blinker.variable} ${inter.variable}`}>
      <body className="bg-light-gray text-dark-gray font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
