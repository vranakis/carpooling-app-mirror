"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export function ClerkClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/SSG, render children directly without ClerkProvider
  if (!mounted) {
    return <>{children}</>;
  }

  // Only render ClerkProvider on client after hydration
  return <ClerkProvider>{children}</ClerkProvider>;
}
