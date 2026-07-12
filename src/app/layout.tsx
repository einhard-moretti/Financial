import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Einhard Financial",
  description: "Track every transaction with confidence. Auto-saved, never lost. Built for entrepreneurs who have reached financial freedom.",
  keywords: ["finance", "wealth", "tracker", "dashboard", "financial freedom"],
  authors: [{ name: "Einhard Wayne" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
        <SonnerToaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.11 0.005 270)",
              border: "1px solid oklch(0.22 0.005 270)",
              color: "oklch(0.98 0.005 90)",
            },
          }}
        />
      </body>
    </html>
  );
}
