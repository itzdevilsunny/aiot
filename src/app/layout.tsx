import './globals.css';
import type { Metadata } from 'next';
import { RiskProvider } from '../context/RiskContext';
import { AppShell } from '../components/layout/AppShell';

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
    <html lang="en">
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
