import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/app-header";
import { ThemeProvider } from "@/components/theme-provider";
// import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Easy Rider Athens - Sustainable Carpooling",
  description: "Connect with others for eco-friendly rides",
  generator: "v0.dev",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ClerkProvider>
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider>
          <AppHeader />
          <main className="min-h-screen bg-gray-50 dark:bg-gray-700">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
    //  </ClerkProvider>
  );
}
