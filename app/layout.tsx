import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/app-header";
import AuthProvider from "@/components/auth-provider";
import AuthDebug from "@/components/auth-debug";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RideShare - Sustainable Carpooling",
  description: "Connect with others for eco-friendly rides",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <AppHeader />
            <main className="min-h-screen bg-gray-50 dark:bg-gray-700">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
