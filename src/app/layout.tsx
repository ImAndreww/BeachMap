import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BeachMap — Descoperă plajele lumii',
  description: 'Hartă interactivă cu plaje, certificări Blue Flag și informații despre stațiuni din toată lumea.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
