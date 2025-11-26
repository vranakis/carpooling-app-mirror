"use client";

import { ThemeProvider } from "@/components/theme-provider";
import AppHeaderWrapper from "@/components/app-header-wrapper";
import type { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppHeaderWrapper />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-700">
        {children}
      </main>
    </ThemeProvider>
  );
}
