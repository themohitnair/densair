import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { Header } from "@/components/header";
import { AuthProvider } from "@/components/session-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "densAIr",
  description: "Your paper-reading assistant",
  icons: "/favicon.svg"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
      <body className={inter.className}>
        <Header />
        {children}
        <Analytics />
      </body>
      </AuthProvider>
    </html>
  );
}
