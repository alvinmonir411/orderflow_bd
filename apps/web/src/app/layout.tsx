import type { Metadata } from 'next';
import { Inter, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: 'OrderFlow BD — Smart F-Commerce Order Automation Platform',
  description: 'Facebook Messenger & WhatsApp Order Management, Steadfast & Pathao Courier Automation with Google Gemini AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${hindSiliguri.variable} font-sans bg-[#090a0f] text-neutral-100 antialiased min-h-screen`}
      >
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: '#11131a',
              borderColor: '#1e222f',
              color: '#f3f4f6',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            },
          }}
        />
      </body>
    </html>
  );
}
