import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { RiskProvider } from '../context/RiskContext';
import { AppShell } from '../components/layout/AppShell';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Risk Register Copilot | AI Business Operations Platform',
  description: 'Enterprise AI Risk Register Copilot for project managers and operations teams. Converts natural language threats into structured risk registers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="antialiased bg-slate-50 text-slate-900">
        <RiskProvider>
          <AppShell>
            {children}
          </AppShell>
        </RiskProvider>
      </body>
    </html>
  );
}
