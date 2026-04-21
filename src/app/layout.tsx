import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BLONK | Workflow Platform for Professional Services",
  description: "Automate repetitive admin for accounting, law, HR, and insurance with BLONK. The premium workflow platform for modern firms.",
};

import { AuthProvider } from "@/components/auth-provider";

import { Suspense } from "react";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
