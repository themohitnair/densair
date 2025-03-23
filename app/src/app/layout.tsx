import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/react"


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
      <body className={inter.className}>
        {children}
        <Analytics />
        <Footer/>
      </body>
    </html>
  );
}
